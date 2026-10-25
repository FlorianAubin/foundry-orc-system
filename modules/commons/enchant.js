import * as Dice from "../commons/dice.js";
import * as Chat from "../commons/chat.js";

export async function onEnchantDeploy(event) {
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

export async function onEnchantRoll(event) {
  event.preventDefault();

  return Dice.EnchantRoll({
    actor: this.actor,
    item: this.item,
    attribute: event.currentTarget.dataset,
  });
}

export async function onEnchantActivate(event) {
  event.preventDefault();

  const actor = this.actor;
  let item = null;

  // Depuis la fiche de l'objet
  if (this.item) {
    item = this.item;
  }
  // Depuis la fiche du personnage
  else if (actor) {
    item = actor.items.get(event.currentTarget.dataset.itemid);
  }

  if (!item) return;

  const enchant = item.system.enchant;
  if (!enchant) return;
  if (!enchant.activeEffect) return;

  const activatedBefore = enchant.activated;
  const usesBefore = enchant.use.available;
  const durationBefore = enchant.use.durationEffective ?? 0;

  let durationEffective = durationBefore;
  let durationFormula = null;

  // Activation
  if (!activatedBefore) {
    if (usesBefore <= 0) return;

    durationFormula = String(enchant.use.duration ?? "");

    if (durationFormula !== "") {
      const roll = await new Roll(durationFormula).evaluate();
      durationEffective = roll.total;

      if (
        durationFormula.includes("d") ||
        durationFormula.includes("+")
      ) {
        Chat.RollToSimpleCustomMessage({ roll });
      }
    }

    await item.update({
      "system.enchant.activated": true,
      "system.enchant.use.available": usesBefore - 1,
      "system.enchant.use.durationEffective": durationEffective,
    });
  } else {
    // Désactivation
    await item.update({
      "system.enchant.activated": false,
    });
  }

  await Chat.createEnchantActivateMessage({
    actor,
    actorName: actor?.name ?? "",
    itemName: enchant.name,
    activated: !activatedBefore,
    usesBefore,
    usesAfter: activatedBefore ? usesBefore : usesBefore - 1,
    duration:durationEffective,
    durationAfter: activatedBefore ? durationBefore : durationEffective,
    durationFormula,
    durationUnit:enchant.use.durationUnit,
    hasDuration: !activatedBefore && durationFormula !== "",
  });
}

export async function _onEnchantReduceDuration(event) {
  event.preventDefault();

  const actor = this.actor;
  if (!actor) return;

  const item = actor.items.get(event.currentTarget.dataset.itemid);
  if (!item) return;

  const enchant = item.system.enchant;
  if (!enchant) return;

  const durationBefore = Number(enchant.use.durationEffective) || 0;
  const durationAfter = durationBefore - 1;
  const deactivated = durationAfter <= 0;

  if (deactivated) {
    await item.update({
      "system.enchant.activated": false,
    });
  } else {
    await item.update({
      "system.enchant.use.durationEffective": durationAfter,
    });
  }

  await Chat.createReduceDurationMessage({
    actor,
    actorName: actor.name,
    itemName: enchant.name,
    itemType: "Enchantement",
    durationBefore,
    durationAfter: deactivated ? 0 : durationAfter,
    deactivated,
    durationUnit:enchant.use.durationUnit,
  });
}

export async function onEnchantSetUse(event) {
  let item = this.item;
  await item.update({
    system: { enchant: { use: { available: event.currentTarget.value } } },
  });

}
