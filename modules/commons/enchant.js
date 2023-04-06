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
  //Does nothing if no item has been found
  if (item == null) return;

  let maj = {
    system: {
      enchant: { optionDeploy: !item.system.enchant.optionDeploy },
    },
  };
  item.update(maj);
}

export async function _onEnchantRoll(event) {
  Dice.EnchantRoll({
    actor: this.actor,
    item: this.item,
    attribute: event.currentTarget.dataset,
  });
}
