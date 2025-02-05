export async function onSheetChangelock(event) {
  event.preventDefault();

  let item = this.item;
  if (item == null) return;

  let flagData = await item.getFlag(game.system.id, "SheetUnlocked");
  flagData
    ? await item.unsetFlag(game.system.id, "SheetUnlocked")
    : await item.setFlag(game.system.id, "SheetUnlocked", "SheetUnlocked");

  item.sheet.render(true);
}

export function updateTotalWeight(data) {
  let item = data.item;
  if (item == null) return;

  const itemData = item.system;
  const stock = itemData.stock;
  const indivWeight = itemData.weight.indiv;
  if (stock == null || indivWeight == null) return;

  item.update({
    system: {
      weight: { total: Math.floor(100 * indivWeight * stock) / 100 },
    },
  });

  return;
}

export function onDescriptionDeploy(event) {
  event.preventDefault();

  let item = this.item;
  if (item == null) return;

  item.update({
    system: {
      optionDescriptionDeploy: !item.system.optionDescriptionDeploy,
    },
  });

  return;
}

export async function onItemCreate(event) {
  let element = event.currentTarget;
  const actor = this.actor;

  let itemData = {
    name: game.i18n.localize("orc.newItem"),
    type: element.dataset.type,
  };
  return actor.createEmbeddedDocuments("Item", [itemData]);
}

export async function onItemEdit(event) {
  const actor = this.actor;
  if (event == null || actor == null) return;
  const li = $(event.currentTarget).parents(".item");
  const item = actor.items.get(li.data("itemId"));
  if (item == null) return;

  item.sheet.render(true);
}

export async function onItemDelete(event) {
  const actor = this.actor;
  if (event == null || actor == null) return;

  const li = $(event.currentTarget).parents(".item");
  const item = actor.items.get(li.data("itemId"));
  if (item == null) return;

  item.delete();

  return;
}

export async function onItemSplit(event) {
  const actor = this.actor;
  if (event == null || actor == null) return;

  const li = $(event.currentTarget).parents(".item");
  const item = actor.items.get(li.data("itemId"));
  if (item == null) return;

  const stock = item.system.stock;
  const weight = item.system.weight.indiv;
  if (stock == null) return;

  let checkNSpilt = await _getNSplit();
  if (checkNSpilt.cancelled) return;

  let newStock = checkNSpilt.newStock,
    newWeight = Math.floor(100 * newStock * weight) / 100;
  let stockUpdate = stock - newStock,
    weightUpdate = Math.floor(100 * stockUpdate * weight) / 100;
  if (newStock <= 0 || stockUpdate <= 0) return;

  //Create the new item
  await item.clone(
    {
      "system.stock": newStock,
      "system.weight.total": newWeight,
    },
    { save: true }
  );

  //Update the origin
  item.update({
    system: {
      stock: stockUpdate,
      weight: { total: weightUpdate },
    },
  });

  return;
}

export async function _getNSplit() {
  const template = "systems/orc/templates/chat/split-choose-number.hbs";
  const html = await renderTemplate(template, {});

  return new Promise((resolve) => {
    new Dialog({
      title: game.i18n.format("orc.dialog.splitItem.title"),
      content: html,
      buttons: {
        normal: {
          label: game.i18n.localize("orc.dialog.splitItem.validate"),
          callback: (html) =>
            resolve(_processNSplit(html[0].querySelector("form"))),
        },
      },
      default: "normal",
      close: () => resolve({ cancelled: true }),
    }).render(true);
  });
}

export function _processNSplit(form) {
  return { newStock: parseInt(form.newStock.value) };
}

export async function onUpdateStock(event) {
  if (event == null || this.actor == null) return;
  event.preventDefault();

  let element = event.currentTarget;
  let itemId = element.closest(".item").dataset.itemId;
  let item = this.actor.items.get(itemId);
  if (item == null || item.system.stock == null) return;

  let newStock = event.currentTarget.value;
  let newWeight =
    Math.floor(100 * item.system.weight.indiv * parseFloat(newStock)) / 100;

  if (
    this.actor.type == "container" &&
    this.actor.system.capacityUsed + newWeight - item.system.weight.total >
      this.actor.system.capacity
  )
    return;

  let maj = {
    system: {
      stock: parseFloat(newStock),
      weight: {
        total: newWeight,
      },
    },
  };
  return item.update(maj);
}

export async function onConsumableDeploy(event) {
  if (event == null || this.actor == null) return;

  event.preventDefault();
  //Retrive the item
  let item = this.actor.items.get(event.currentTarget.dataset.itemid);
  //Does nothing if no item has been found
  if (item == null) return;
  //Does nothing if the item is not a consumable
  if (item.type != "consumable") return;
  let itemData = item.system;
  //Does nothing if the item is not tagged as activable
  if (!itemData.isActivable) return;

  await item.update({
    system: {
      ifActivable: { optionDeploy: !itemData.ifActivable.optionDeploy },
    },
  });
  return;
}

export async function onWoundDeploy(event) {
  if (event == null || this.actor == null) return;

  event.preventDefault();
  //Retrive the item
  let item = this.actor.items.get(event.currentTarget.dataset.itemid);

  //Does nothing if no item has been found
  if (item == null) return;
  //Does nothing if the item is not a consumable
  if (item.type != "wound") return;
  let itemData = item.system;

  await item.update({
    system: {
      optionDeploy: !itemData.optionDeploy,
    },
  });
  return;
}
