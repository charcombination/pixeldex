import "./Panel.css"
import ArrowButton from "../buttons/ArrowButton"
import PrefixedButton from "../buttons/PrefixedButton"
import DepositButton from "../buttons/DepositButton"
import TradeOfferButton from "../buttons/TradeOfferButton"
import Inventory from "../inventory/Inventory"
import { useState, useEffect } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'

const Panel = (props) => {

  const [sellerProfile, setSellerProfile] = useState("");
  const [itemFilter, setItemFilter] = useState("");
  const [sellerAddress, setSellerAddress] = useState("");
  const [recipientProfile, setRecipientProfile] = useState("");

  const [itemFilterTimeout, setItemFilterTimeout] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);

  const [sellerProfileText, setSellerProfileText] = useState("");
  const [itemFilterText, setItemFilterText] = useState("");
  const [sellerAddressText, setSellerAddressText] = useState("");
  const [recipientProfileText, setRecipientProfileText] = useState("");

  const [price, setPrice] = useState(0.00);

  const [focusID, setFocusID] = useState(0);
  const [page, setPage] = useState(0);
  const handleFocus = (event) => event.target.select();

  const [float, setFloat] = useState(0.0);

  const temporaryVerificationFloat = 0.14;
  const { address, isConnected } = useAccount()

  function selectAsset(asset) {
    setSelectedAsset(asset);
    setFocusID(asset ? 2 : 1);
    asset ? getItemPrice(asset) : setPrice(0.00);
  }

  function updateItemFilterText(evt) {
    setFocusID(1)
    setItemFilterText(evt.target.value);

    // Last interaction less than 0.75s ago => Update Filtertext
    itemFilterTimeout && clearTimeout(itemFilterTimeout);
    setItemFilterTimeout(setTimeout(() => setItemFilter(evt.target.value), 750));
  }

  function updateSellerProfileText(evt) {
    setSellerProfileText(evt.target.value);

    const newSellerProfile = validateSteamAddress(evt.target.value) ? evt.target.value : null;
    setSellerProfile(newSellerProfile);

    setFocusID(1);
  }

  function updateSellerAddressText(evt) {
    setSellerAddressText(evt.target.value);
    const newSellerAddress = validateEthAddress(evt.target.value) ? evt.target.value : null;
    setSellerAddress(newSellerAddress);
  }

  function updateRecipientProfileText(evt) {
    setRecipientProfileText(evt.target.value);
    const newRecipientProfile = validateSteamAddress(evt.target.value) ? evt.target.value : null;
    setRecipientProfile(newRecipientProfile);
  }

  function validateSteamAddress(link) {
    return new RegExp("^[a-zA-Z0-9]{17}$").test(link);
  }

  function validateEthAddress(addr) {
    return new RegExp("^0x[a-fA-F0-9]{40}$").test(addr);
  }

  function goBack() {
    setPage(0);
  }

  function proceed() {
    setPage(1);
    getItemFloat(sellerProfile, selectedAsset);
  }

  function sendTransfer(beneficiary, beneficiary_steamid, item_name, item_float, value) {
    // sellerAddress, sellerProfile, selectedAsset.description.name, float, price
    console.log(`${sellerAddress},${sellerProfile},${selectedAsset.description.name},${float},${price}`);
  }

  function getItemPrice(asset) {
    fetch(`http://127.0.0.1:8000/price/${asset.description.market_hash_name}/`)
      .then(response => response.json())
      .then(response => setPrice(response.median_price))
  }

  function getItemFloat(steamid, asset) {
    const baseInspectURL = asset.description.actions[0].link;
    fetch(`http://127.0.0.1:8000/float/${steamid}/${asset.id}/?url=${encodeURIComponent(baseInspectURL)}`)
      .then(response => response.json())
      .then(response => setFloat(response.iteminfo.floatvalue))
  }



  return (
    <div className="panel">
      {page == 0 && <>
        <div className="upperside">
        <h1>Create Buy Offer</h1>
          <div>
            <div className="requestbox">
              <div className="spacebetween">
                <p className="description">Seller Profile:</p>
                <a href="https://www.steamidfinder.com/">ID64 Lookup</a>
              </div>
              <input autoFocus placeholder="7656...87930" value={sellerProfileText} onChange={evt => updateSellerProfileText(evt)} onFocus={handleFocus}/>
            </div>
            {sellerProfile && <div className="requestbox">
              <p className="description">{selectedAsset ? selectedAsset.description.name : "Select Item:"}</p>
              <input ref={input => input && focusID == 1 && input.focus()} placeholder="Start typing to filter" value={itemFilterText} onChange={evt => updateItemFilterText(evt)}/>
              <Inventory onSelectAsset={selectAsset} selected={selectedAsset} filter={itemFilter} steamid={sellerProfile}/>
            </div>}
          </div>
        </div>
        <ArrowButton unlocked={!!selectedAsset} onClick={!!selectedAsset && proceed} focusID={focusID} price={price} setPrice={setPrice}/>
      </>}

      {page == 1 && <>
        <div className="upperside">
        <div className="horizontal">
          <h1>Finalize Buy Offer</h1>
          <div className="goback" aria-label="Go back" role="button" onClick={goBack}>
            <svg focusable="false" viewBox="0 0 24 24">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
              </svg>
          </div>
        </div>

            <div className="requestbox">
              <p className="description">Seller Ethereum Address:</p>
              <input placeholder="0xD7a...2cbB0eE" value={sellerAddressText} onChange={evt => updateSellerAddressText(evt)} onFocus={handleFocus}/>
            </div>

            <div className="requestbox">
            <div className="spacebetween">
              <p className="description">Your Profile:</p>
              <a href="https://www.steamidfinder.com/">ID64 Lookup</a>
            </div>
              <input placeholder="7656...87930" value={recipientProfileText} onChange={evt => updateRecipientProfileText(evt)} onFocus={handleFocus}/>
            </div>
          </div>
          <DepositButton amount={price} unlocked={sellerAddress && recipientProfile} connect={props.connect} sendTransfer={sendTransfer}/>
          <TradeOfferButton unlocked={sellerAddress && recipientProfile && isConnected}/>
      </>}
    </div>
  )
}

export default Panel
