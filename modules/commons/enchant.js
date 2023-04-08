import * as Dice from "../commons/dice.js";

export async function _onEnchantDeploy(event) {
  event.preventDefault();

  let item = null;
  //If the event occurs from a item sheet, simply take that item
  if (this.item) item = this.item;
  //If the event occurs from an actor sheet, retrieve the item from the given identifier
  else if (this.actor)
    item = this.actor.items.filter(function (item) {
      return item._id == event.currentTarget.dataset.itemid;
    })[0];
  //Does nothing if no item or no enchant has been found
  if (item == null) return;
  let enchant = item.system.enchant;
  if (enchant == null) return;

  let maj = {
    system: {
      enchant: { optionDeploy: !enchant.optionDeploy },
    },
  };
  await item.update(maj);
}

export async function _onEnchantRoll(event) {
  Dice.EnchantRoll({
    actor: this.actor,
    item: this.item,
    attribute: event.currentTarget.dataset,
  });
}

export async function _onEnchantUse(event) {
  event.preventDefault();

  let item = null;
  //If the event occurs from a item sheet, simply take that item
  if (this.item) item = this.item;
  //If the event occurs from an actor sheet, retrieve the item from the given identifier
  else if (this.actor)
    item = this.actor.items.filter(function (item) {
      return item._id == event.currentTarget.dataset.itemid;
    })[0];
  //Does nothing if no item or no enchant has been found
  if (item == null) return;
  let enchant = item.system.enchant;
  if (enchant == null) return;

  if (enchant.use.available <= 0 || enchant.use.perDay <= 0) return;
  let maj = {
    system: {
      enchant: {
        use: { available: enchant.use.available - 1 },
      },
    },
  };
  await item.update(maj);
}
