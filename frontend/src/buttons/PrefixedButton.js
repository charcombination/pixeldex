import "./PrefixedButton.css";

const PrefixedButton = (props) => {
  return (
    <button className={props.solid ? "prefixedButton filled" : "prefixedButton outlined"} onClick={props.onClick}>
      {props.children && <div className={props.solid ? "prefix filled" : "prefix outlined"}>
        {props.children}
      </div>}
      <p>{props.text}</p>
    </button>
  )
}

export default PrefixedButton
