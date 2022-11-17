import "./Inventory.css"
import InventoryElement from "./InventoryElement"
import { useState, useEffect } from 'react'

const Inventory = (props) => {

  const fetchURL = `http://127.0.0.1:8000/list/${props.steamid}/`
  const [inventory, setInventory] = useState(null);
  const [inventoryPreview, setInventoryPreview] = useState(null);

  function loadInventory() {
    fetch(fetchURL)
      .then(response => response.json())
      .then(response => JSON.parse(response))
      .then(response => setInventory(response))
  }

  function getInventoryPreview(filter_string) {
    const inventory_preview = inventory
      .filter(asset => asset.description.name.toLowerCase().includes(filter_string.toLowerCase()))
      .splice(0,4);

    resetSelectionIfInvisible(inventory_preview);

    return inventory_preview;
  }

  function resetSelectionIfInvisible(inventory_preview) {
    if(props.selected && inventory_preview.filter(asset => asset.id === props.selected.id).length < 1) {
      onSelectAsset(null);
    }
  }

  function onSelectAsset(asset) {
    props.onSelectAsset(asset)
  }

  useEffect(() => {
    loadInventory();
  }, []);

  return (
    <div className="inventory-elements">
      {inventory && getInventoryPreview(props.filter).map(asset =>
        <InventoryElement asset={asset} onSelectAsset={onSelectAsset} selected={props.selected} key={asset.id}/>
      )}
    </div>
  )
}

export default Inventory
