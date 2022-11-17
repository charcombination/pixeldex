import "./TradeOfferButton.css"
import lock from "./lock.png"

import PrefixedButton from "./PrefixedButton"

const TradeOfferButton = (props) => {
  return (
    <PrefixedButton text="Deposit and Send Trade Offer" solid={props.unlocked}>
      {props.unlocked ?
        <span className="depositPrefix">2</span> :
        <img src={lock} width={20}/>
      }
    </PrefixedButton>
  )
}

export default TradeOfferButton
