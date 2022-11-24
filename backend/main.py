import requests
import jsons
import urllib.parse
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import dotenv_values

config = dotenv_values(".env")
app = FastAPI()

# TODO: Replace with less temporary solution
origins = [
    'http://localhost',
    'http://localhost:8000',
    'http://localhost:3000',
    'http://localhost:*'
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


# TODO: Change endpoint
# TODO: Regenerate output.txt
@app.get('/list/{steamid}/')
async def inventory(steamid):
    f = open('./output.txt', 'r')
    return jsons.load(f.read())
    # return {'inventory': get_enriched_inventory(steamid_64=steamid)}

@app.get('/price/{market_hash_name}/')
def median_price(market_hash_name):
    url = 'http://csgobackpack.net/api/GetItemPrice/'
    params = {'currency': 'USD', 'id': market_hash_name, 'time': 14}

    return jsons.load(requests.get(url, params).json())

@app.get('/float/{steamid}/{assetid}/')
def get_item_float(steamid, assetid, url):
    inspectlink = reformat_inspectlink(url, assetid, steamid)
    csgofloat_url = 'https://api.csgofloat.com/?url={}'.format(inspectlink)

    authorization = config['CSGOFLOAT_API']

    headers = {
        'Content-Type': 'application/json',
        'Authorization': '{}'.format(authorization)
    }

    response = jsons.load(requests.get(csgofloat_url, headers=headers).json())

    return jsons.load(response)

# client has addr and id => deposit
# client requests to initiate claiming process for deposit pertaining to (addr, id)

# get data for deposit (addr, id)
# get steam profile, item_hash_name and float to check for
# get all items with hash_name in profile and append their float
# check if there is an item present with float
# return ownerid, addr, hasItem state

@app.get('/verify/{steamid}/{item_name}/{float}/')
def verify_item(steamid, item_name, float):
    enriched_inventory = get_enriched_inventory(steamid, item_name)

    # API should also provide information to uniquely identify the deposit that is being updated

    for asset in enriched_inventory:
        if asset.get('floatinfo').get('float') == float:
            return True
    return False

# TODO: Verify that get_enriched_inventory_* returns the same data structure for both methods

def get_enriched_inventory(steamid_64, filter_name):
    items = get_unified_inventory(steamid_64)
    filtered_items = [asset for asset in items if filter_name in asset.get('description').get('market_hash_name')]

    # Add float data
    floatinfo = get_float_bulk(items, steamid_64)
    print(floatinfo)

    for matched in filtered_items:
        matched['floatinfo'] = floatinfo.get(matched.get('id'))

    return filtered_items

def get_enriched_inventory(steamid_64):
    items = get_unified_inventory(steamid_64)
    
    return items

# The json response for the inventory contains two dictionaries that each have information for the assets
# This function merges both into one datastructure
def get_unified_inventory(steamid_64):
    inventory = fetch_inventory(steamid_64)
    item_information = inventory.get('assets')
    item_descriptions = inventory.get('descriptions')

    # build lookup_table
    description_lut = {'{0}_{1}'.format(description.get('classid'), description.get('instanceid') or '0'): description for description in item_descriptions}
    
    for asset in item_information:
        description = description_lut.get(asset.get('classid') + '_' + asset.get('instanceid'))
        asset['description'] = description

    return item_information

# TODO: Rewrite based on https://github.com/DoctorMcKay/node-steamcommunity/blob/0ccac69beac4bd2c565ef861f89e3053a886e6ec/components/users.js
def fetch_inventory(steamid_64):
    url = 'https://steamcommunity.com/inventory/{steamid_64}/{app_id}/{context_id}'.format(
        steamid_64=steamid_64,
        app_id=730,
        context_id=2
    )

    headers = { 'Referer': 'https://steamcommunity.com/profiles/{0}/inventory'.format(steamid_64)}

    response = requests.get(url, headers).json()
    return jsons.load(response)

def get_float_bulk(entries, owner_steamid):
    url = 'https://api.csgofloat.com/bulk'
    json = reformat_for_bulk_request(entries, owner_steamid)
    authorization = config['CSGOFLOAT_API']

    headers = {
        'Content-Type': 'application/json',
        'Authorization': '{0}'.format(authorization)
    }

    response = requests.post(url, json=headers, headers=headers).json()

    return jsons.load(response)

# Only works if CSGOFloat is self-hosted since bulk requests are not supported
# TODO: Improve efficiency
def reformat_for_bulk_request(entries, owner_steamid):
    links = [build_inspectlink(entry, owner_steamid) for entry in entries if 'actions' in entry.get('description')]
    csgofloat_json = {'links': [{'link': l} for l in links]}

    return csgofloat_json


def build_inspectlink(entry, steamid):
    description = entry.get('description')
    link = description.get('actions')[0].get('link')

    link.replace('%owner_steamid%', "{0}".format(steamid))
    link.replace('%assetid', "{0}".format(entry.get('assetid')))

    return link


def reformat_inspectlink(link, asset_id, steamid):
    link = link.replace('%owner_steamid%', "{0}".format(steamid))
    link = link.replace('%assetid%', "{0}".format(asset_id))

    return link

print(get_enriched_inventory(76561198278346799, 'awp'))