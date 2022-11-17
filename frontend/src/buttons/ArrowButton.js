import "./ArrowButton.css";

const ArrowButton = (props) => {
  {/* Centered / Outline Styling dependent on property? Can an arrow button have an Outline */}

  function updateText(evt) {
    props.setPrice(evt.target.value);
  }

  return (
    <button className={props.unlocked ? "arrowButton" : "arrowButton disabled"} onClick={props.onClick}>
      <p>Proceed with offer for $
        <input ref={input => input && props.focusID == 2 && input.focus()} placeholder="0.00" className="textfield" value={props.price} onChange={evt => updateText(evt)}/>
      </p>
    </button>
  )
}

export default ArrowButton
