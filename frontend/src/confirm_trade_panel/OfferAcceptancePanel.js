import "./OfferAcceptancePanel.css";
import Screenshot from "../resources/howl.png";
import PrefixedButton from "../buttons/PrefixedButton"

const OfferAcceptancePanel = (props) => {

  function image_from_name(asset_name) {
    return Screenshot
  }

  return (
    <div className="acceptancepanel">
      <h1>Trade Offer</h1>
      <div className="informationpanel">
        <p className="seller-info">{`${props.seller} offers`}</p>
        <p className="price-info">{`$${props.price}`}</p>
        <img src={image_from_name(props.asset_name)} className="asset-image"/>
        <p className="item-info">for your <span className="name">{props.asset_name}</span></p>
      </div>
      <div className="buttonrow">
        <PrefixedButton text="Reject" solid={false} className="reject"/>
        <PrefixedButton text="Proceed with Trade Offer" solid={true} className="proceed"/>
      </div>
  </div>)
}

export default OfferAcceptancePanel
