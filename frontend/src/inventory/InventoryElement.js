import "./InventoryElement.css"

const InventoryElement = (props) => {

  const imageURL = `https://community.akamai.steamstatic.com/economy/image/${props.asset.description.icon_url}/330x`

  function handleClick() {
    props.onSelectAsset(props.asset)
  }

  return (
    <button className="inventory-element" onClick={handleClick}>
      {props.selected && props.selected.id === props.asset.id && <div className="selectionMarker"/>}
      <img src={imageURL}/>
    </button>
  )
}

export default InventoryElement
