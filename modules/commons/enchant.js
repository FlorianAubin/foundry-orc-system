import * as Dice from "../commons/dice.js";
import * as Chat from "../commons/chat.js";

export async function _onEnchantDeploy(event) {
  event.preventDefault();

  let item = null;
  //If the event occurs from a item sheet, simply take that item
  if (this.item) item = this.item;
  //If the event occurs from an actor sheet, retrieve the item from the given identifier
  else if (this.actor)
    item = this.actor.items.get(event.currentTarget.dataset.itemid);

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

export async function _onEnchantActivate(event) {
  event.preventDefault();

  let item = null;
  //If the event occurs from a item sheet, simply take that item
  if (this.item) item = this.item;
  //If the event occurs from an actor sheet, retrieve the item from the given identifier
  else if (this.actor)
    item = this.actor.items.get(event.currentTarget.dataset.itemid);

  //Does nothing if no item or no enchant has been found
  if (item == null) return;
  let enchant = item.system.enchant;
  if (enchant == null) return;
  if (!enchant.activeEffect == null) return;
  if (!enchant.activated && enchant.use.available <= 0) return;

  //Roll the effective duration
  let durationEffective = 0;
  if (!enchant.activated) {
    let durationFormula = enchant.use.duration;
    if (typeof durationFormula !== "string")
      durationFormula = durationFormula.toString();
    let roll = new Roll(durationFormula).roll({ async: false });
    durationEffective = roll.total;
    //If the formula is not trivial, display the roll in the chat
    if (durationFormula.includes("d") || durationFormula.includes("+"))
      Chat.RollToSimpleCustomMessage({ roll: roll });
  }

  //Update the enchant
  enchant.activated
    ? await item.update({
        system: {
          enchant: {
            activated: false,
          },
          use: { durationEffective: durationEffective },
        },
      })
    : await item.update({
        system: {
          enchant: {
            activated: true,
            use: {
              available: enchant.use.available - 1,
              durationEffective: durationEffective,
            },
          },
        },
      });

  return;
}

export async function _onEnchantReduceDuration(event) {
  if (this.actor == null) return;
  let item = this.actor.items.get(event.currentTarget.dataset.itemid);

  //Does nothing if no item or no enchant has been found
  if (item == null) return;
  let enchant = item.system.enchant;
  if (enchant == null) return;

  let newDuration = enchant.use.durationEffective - 1;
  if (newDuration <= 0)
    await item.update({ system: { enchant: { activated: false } } });
  else
    await item.update({
      system: { enchant: { use: { durationEffective: newDuration } } },
    });

  return;
}
