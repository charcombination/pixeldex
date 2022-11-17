import requests
import jsons
import urllib.parse
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

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
    inspectlink = get_inspectlink(url, assetid, steamid)
    csgofloat_url = 'https://api.csgofloat.com/?url={}'.format(inspectlink)

    authorization = os.getenv('CSGOFLOAT_API')

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
    print(enriched_inventory)
    # API should also provide information to uniquely identify the deposit that is being updated

    for asset in enriched_inventory:
        if asset.get('iteminfo').get('float') == float:
            return True
    return False


# These should return values of the same type
def get_enriched_inventory(steamid_64):
    inventory = fetch_inventory(steamid_64)
    item_information = inventory.get('rgInventory')
    item_descriptions = inventory.get('rgDescriptions')

    # Append description
    for key in item_information.keys():

        value = item_information.get(key)
        description = item_descriptions.get(value.get('classid') + '_' + value.get('instanceid'))
        value['description'] = description

    # TODO: Add float info from filtered inventory, make filtered search based on default search

    return item_information.values()


# These should return values of the same type
def get_enriched_inventory_filtered(steamid_64, filter_name):
    inventory = fetch_inventory(steamid_64)
    item_information = inventory.get('rgInventory')
    item_descriptions = inventory.get('rgDescriptions')

    # Append relevant values of rgDescriptions to keys of rgInventory
    for key in item_information.keys():
        value = item_information.get(key)
        description = item_descriptions.get(value.get('classid') + '_' + value.get('instanceid'))
        value['description'] = description

    # Filter for item name / TODO: Clarify
    name_matches = [asset for asset in item_information.values() if filter_name in asset.get('description').get('market_hash_name')]

    # Append item info to items matching the required name (e.g. float)
    iteminfo = get_iteminfo(name_matches, steamid_64)

    for match in name_matches:
        match['iteminfo'] = iteminfo.get(match.get('id'))

    return name_matches

def fetch_inventory(steamid_64):
    url = 'https://steamcommunity.com/profiles/{steamid_64}/inventory/json/{app_id}/{context_id}/'.format(
        steamid_64=steamid_64,
        app_id=730,
        context_id=2
    )

    response = requests.get(url).json()
    return jsons.load(response)

def get_iteminfo(entries, owner_steamid):
    url = 'https://api.csgofloat.com/bulk'
    json = get_requestjson(entries, owner_steamid)
    authorization = os.getenv('CSGOFLOAT_API')

    headers = {
        'Content-Type': 'application/json',
        'Authorization': '{}'.format(authorization)
    }

    response = jsons.load(url, json=json, headers=headers)

    return jsons.load(response)

def get_requestjson(entries, owner_steamid):
    links = [get_inspectlink_forentry(entry, owner_steamid) for entry in entries]
    csgofloat_json = {'links': [{'link': l} for l in links]}

    return csgofloat_json


def get_inspectlink_forentry(entry, steamid):
    link = entry.get('description').get('actions')[0].get('link')
    link.replace('%owner_steamid%', steamid)
    link.replace('%assetid', entry)

    return link


def get_inspectlink(link, asset_id, steamid):
    link = link.replace('%owner_steamid%', steamid)
    link = link.replace('%assetid%', asset_id)

    return link

