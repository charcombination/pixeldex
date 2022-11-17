import "./DepositButton.css";
import PrefixedButton from "./PrefixedButton"
import lock from "./lock.png"
import { useAccount } from "wagmi";

const DepositButton = (props) => {

  const { data: account } = useAccount();

  function getPreviewText() {
    return account ? `Deposit $${props.amount}` : "Connect Wallet";
  }

  function clickDepositButton() {
    if (account) {
      props.sendTransfer();
    } else {
      props.connect();
    }
  }

  return (
    <PrefixedButton text={getPreviewText()} solid={props.unlocked} onClick={clickDepositButton}>
      {props.unlocked ?
        <span className="depositPrefix">1</span> :
        <img src={lock} width={20}/>
      }
    </PrefixedButton>
  )
}

export default DepositButton
