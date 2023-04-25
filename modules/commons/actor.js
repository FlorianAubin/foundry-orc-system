import * as ItemOrc from "../commons/item.js";

/**
 * Manage the lock/unlock button on the sheet
 */
export async function onSheetChangelock(event) {
  event.preventDefault();

  let flagData = await this.actor.getFlag(game.system.id, "SheetUnlocked");
  flagData
    ? await this.actor.unsetFlag(game.system.id, "SheetUnlocked")
    : await this.actor.setFlag(
        game.system.id,
        "SheetUnlocked",
        "SheetUnlocked"
      );

  this.actor.sheet.render(true);
}

//Overide the onDropItem
export async function onDropItem(event, data, sheet) {
  if (!sheet.actor.isOwner) return false;
  const item = await Item.implementation.fromDropData(data);
  let itemData = item.toObject();

  // Handle item sorting within the same Actor
  if (sheet.actor.uuid === item.parent?.uuid)
    return sheet._onSortItem(event, itemData);

  //Does this item stack up?
  if (item.system.stock != null) {
    let movedStock = item.system.stock;
    //If the shift key is pressed, ask to the user the item quantity to move
    if (event.shiftKey) {
      let checkNSpilt = await ItemOrc._getNSplit();
      if (checkNSpilt.cancelled) return;
      movedStock = checkNSpilt.newStock;
    }
    if (item.parent != null && movedStock > item.system.stock)
      movedStock = item.system.stock;
    //For containers, check that the capacity is not exceeded
    let movedWeight =
      Math.floor(100 * movedStock * item.system.weight.indiv) / 100;
    if (
      sheet.actor.type == "container" &&
      sheet.actor.system.capacityUsed + movedWeight >
        sheet.actor.system.capacity
    )
      return;

    let targetStock = movedStock;
    //Does the target already have a similar item? If not, create a new one
    let targetItem = await sheet.actor.items.getName(item.name);
    if (targetItem == null) {
      targetItem = await sheet._onDropItemCreate(itemData);
      targetItem = targetItem[0];
    } else targetStock += targetItem.system.stock;

    //Update the new item
    let targetWeight =
      Math.floor(100 * targetStock * targetItem.system.weight.indiv) / 100;
    await targetItem.update({
      system: { stock: targetStock, weight: { total: targetWeight } },
    });

    //Update the original item
    if (!event.altKey && item.parent != null) {
      let newOriginStock = item.system.stock - movedStock;
      let newOriginWeight =
        Math.floor(100 * newOriginStock * item.system.weight.indiv) / 100;
      await item.update({
        system: {
          stock: newOriginStock,
          weight: { total: newOriginWeight },
        },
      });
    }
  } else {
    if (
      sheet.actor.type == "container" &&
      sheet.actor.system.capacityUsed + item.system.weight >
        sheet.actor.system.capacity
    )
      return;
    // Create the owned item
    sheet._onDropItemCreate(itemData);
    //If the item came from an actor, delete the origin
    if (!event.altKey && item.parent != null) await item.delete();
  }

  return;
}

export function removeItemsWithoutStock(data) {
  const actor = data.actor;
  const items = data.items;

  for (let [key, it] of Object.entries(items)) {
    let item = actor.items.get(it._id);
    let itemData = item.system;

    if (itemData.stock != null && itemData.stock <= 0) item.delete();
  }

  return;
}
