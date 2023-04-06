import * as Dice from "../commons/dice.js";

export async function _onEnchantDeploy(event) {
  event.preventDefault();

  let maj = {
    system: {
      enchant: { optionDeploy: !this.item.system.enchant.optionDeploy },
    },
  };
  this.item.update(maj);
}

export async function _onEnchantRoll(event) {
  Dice.EnchantRoll({
    actor: this.actor,
    item: this.item,
    attribute: event.currentTarget.dataset,
  });
}
