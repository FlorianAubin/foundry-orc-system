import * as Chat from "./chat.js";

export function AttributeRoll({
  actor = null,
  attribute = null,
  modif = 0,
  extraMessageData = {},
} = {}) {
  let rollFormula = "1d100";
  let rollData = {}; //for some reasons, rollData are not conserved on ChatMessage, use rollOptions instead
  let rollOptions = {
    attributeName: attribute.attributename,
    attributeValue: (parseFloat(attribute.attributevalue) + modif).toString(),
    actorName: actor.name,
    actorLimitCritical: actor.system.roll.limitCritical.value,
    actorLimitFumble: actor.system.roll.limitFumble.value,
    visibleByPlayers: actor.ownership.default,
  };

  let roll = new Roll(rollFormula, rollData, rollOptions);
  let rollResult = roll.roll({ async: false });

  extraMessageData.title = game.i18n.format("orc.dialog.attribute.title", {
    charName: actor.name,
    attributeName: attribute.attributename,
  });
  extraMessageData.attributeValue = {
    base: attribute.attributevaluebase,
    modif: (
      parseFloat(attribute.attributevalue) -
      parseFloat(attribute.attributevaluebase) +
      modif
    ).toString(),
    value: (parseFloat(attribute.attributevalue) + modif).toString(),
    diff: (
      parseFloat(attribute.attributevalue) +
      modif -
      parseFloat(rollResult.total)
    ).toString(),
  };

  if (rollResult.total <= rollResult.options.actorLimitCritical) {
    extraMessageData.message = "orc.dialog.criticalSuccess";
  } else if (rollResult.total >= rollResult.options.actorLimitFumble) {
    extraMessageData.message = "orc.dialog.fumbleFailure";
  } else if (
    rollResult.total <= parseFloat(extraMessageData.attributeValue.value)
  ) {
    extraMessageData.message = "orc.dialog.Success";
  } else if (
    rollResult.total > parseFloat(extraMessageData.attributeValue.value)
  ) {
    extraMessageData.message = "orc.dialog.Failure";
  }

  //Display a limited message if the player is not allowed to see the form
  if (rollOptions.visibleByPlayers == 0) {
    Chat.AttributeRollToCustomLimitedMessage(rollResult, {
      ...extraMessageData,
    });
  }
  Chat.AttributeRollToCustomFullMessage(rollResult, {
    ...extraMessageData,
  });

  return rollResult.total;
}

export function AttackRoll({
  actor = null,
  attribute = null,
  modif = 0,
  extraMessageData = {},
}) {
  return this.AttributeRoll({
    actor,
    attribute,
    modif,
    extraMessageData,
  });
}

export function DodgeRoll({
  actor = null,
  attribute = null,
  modif = 0,
  extraMessageData = {},
}) {
  return this.AttributeRoll({
    actor,
    attribute,
    modif,
    extraMessageData,
  });
}

export function StatusResistRoll({ actor = null, modif = 0 }) {
  let physical = actor.system.attributes.physical;
  let attribute = {
    attributename: "Physique", //physical.name,    ////c'est pas beau !
    attributevalue: physical.value,
    attributevaluebase: physical.native,
  };
  return (
    this.AttributeRoll({
      actor: actor,
      attribute: attribute,
      modif: modif,
    }) >
    physical.value + modif
  );
}

export function DamageRoll({
  actor = null,
  weapon = null,
  attribute = null,
  extraMessageData = {},
} = {}) {
  //Init
  let ammo = null;
  let rollFormula = "";
  extraMessageData.effect = "";
  let rollData = {};
  let rollOptions = {};
  let precise = false;
  let damageMin = 0;

  //If neither an actor or a weapon is provided, exit the function
  if (!actor && !weapon) {
    return 0;
  }

  //If an actor and a weapon id is provided, recover his weapon
  if (actor && attribute.weaponid) {
    //Recover the weapon
    weapon = actor.items
      .filter(function (item) {
        return item.type == "weapon";
      })
      .filter(function (item) {
        return item._id == attribute.weaponid;
      })[0];
  }

  //If no weapon is provide, simply do a bonus damage roll
  if (!weapon) {
    extraMessageData.title = game.i18n.format(
      "orc.dialog.damageBonus.title",
      {}
    );
    rollFormula += actor.system.damageBonus.value;
  } else {
    //Add the weapon to the formula
    rollFormula += weapon.system.damage;
    //Add the weapon effects to the message
    extraMessageData.effect += weapon.system.effect;
    precise = precise || weapon.system.precise;

    //If it is an actor that does the roll, add the extra damage and effects
    if (actor) {
      //If the weapon use an ammo, recover it
      if (weapon.system.useAmmo) {
        ammo = actor.items
          .filter(function (item) {
            return item.type == "ammo";
          })
          .filter(function (item) {
            return item._id == weapon.system.ammo;
          })[0];
        if (ammo == null) return;

        const ammoStock = ammo.system.stock;
        if (ammoStock > 0) {
          if (ammo.system.damage)
            //Add the ammo to the formula
            rollFormula += "+" + ammo.system.damage;
          //Add the weapon effects to the message
          if (ammo.system.effect)
            extraMessageData.effect += " " + ammo.system.effect;
          precise = precise || ammo.system.precise;
          //Remove one ammo
          let maj = { system: { stock: ammoStock - 1 } };
          ammo.update(maj);
          //Add the ammo information to the message
          extraMessageData.ammoTag = 1;
          extraMessageData.ammo = game.i18n.format(
            "orc.dialog.damageFromWeapon.ammo",
            {
              ammoName: ammo.name,
            }
          );
        }
        //Add the not enough ammo message
        else {
          extraMessageData.ammoTag = 2;
          extraMessageData.ammo = game.i18n.format(
            "orc.dialog.damageFromWeapon.notEnoughAmmo",
            {
              ammoName: ammo.name,
            }
          );
        }
      }
      //If the weapon don't use ammo
      else {
        //Tag the message as "no ammo used"
        extraMessageData.ammoTag = 0;
        //Add the actor damage bonus
        if (actor.system.damageBonus.value)
          rollFormula += "+" + actor.system.damageBonus.value;
      }
    }

    //If precise attack, set a min damage
    if (precise) {
      //Split the formula between the "+"
      let formulaSplitPlus = rollFormula.split("+");
      for (let i = 0; i < formulaSplitPlus.length; i++) {
        //Split the sub-formula related to dices between the "d"
        if (formulaSplitPlus[i].includes("d")) {
          let formulatSplitDice = formulaSplitPlus[i].split("d");
          damageMin +=
            parseFloat(formulatSplitDice[0]) *
            (Math.floor(parseFloat(formulatSplitDice[1]) / 2) + 0.5);
        } else damageMin += parseFloat(formulaSplitPlus[i]);
      }
      damageMin = Math.floor(damageMin);
    }

    //Define the message title
    extraMessageData.title = game.i18n.format(
      "orc.dialog.damageFromWeapon.title",
      {
        weaponName: weapon.name,
      }
    );
  }

  //Do the roll
  let roll = new Roll(rollFormula, rollData, rollOptions);
  let rollResult = roll.roll({ async: false });
  //Apply the min damage
  if (rollResult._total < damageMin) rollResult._total = damageMin;

  //Display the message
  Chat.DamageRollToCustomMessage(rollResult, {
    ...extraMessageData,
  });

  return rollResult.total;
}

export function BleedPoisonRoll({
  actor = null,
  type = null,
  extraMessageData = {},
}) {
  let ndice = 0;
  if (type === "bleed") {
    ndice = actor.system.status.bleed;
    extraMessageData.title = game.i18n.format("orc.dialog.bleed.title", {
      charName: actor.name,
    });
  } else if (type === "poison") {
    ndice = actor.system.status.poison;
    extraMessageData.title = game.i18n.format("orc.dialog.poison.title", {
      charName: actor.name,
    });
  } else {
    return 0;
  }

  let rollFormula = ndice + "d6";
  let rollData = {}; //for some reasons, rollData are not conserved on ChatMessage, use rollOptions instead
  let rollOptions = {
    actorName: actor.name,
    visibleByPlayers: actor.ownership.default,
  };

  let roll = new Roll(rollFormula, rollData, rollOptions);
  let rollResult = roll.roll({ async: false });

  Chat.StatusRollToCustomMessage(rollResult, {
    ...extraMessageData,
  });

  return rollResult.total;
}

export function BurnRoll({ actor = null, extraMessageData = {} }) {
  let rollFormula = "1d100";
  let rollData = {}; //for some reasons, rollData are not conserved on ChatMessage, use rollOptions instead
  let rollOptions = {
    actorName: actor.name,
    visibleByPlayers: actor.ownership.default,
  };

  let roll = new Roll(rollFormula, rollData, rollOptions);
  let rollResult = roll.roll({ async: false });

  extraMessageData.title = game.i18n.format("orc.dialog.burn.title", {
    charName: actor.name,
  });
  if (rollResult.total <= actor.system.status.burn) {
    extraMessageData.info = game.i18n.format("orc.dialog.burn.onFire", {
      charName: actor.name,
    });
  }

  Chat.StatusRollToCustomMessage(rollResult, {
    ...extraMessageData,
  });

  return rollResult.total;
}

export function EnchantRoll({
  actor = null,
  item = null,
  attribute = null,
  extraMessageData = {},
} = {}) {
  //If neither an actor or a item is provided, exit the function
  if (!actor && !item) {
    return 0;
  }

  //If an actor and a item id is provided, recover his weapon
  if (actor && attribute.itemid) {
    //Recover the item
    item = actor.items.filter(function (item) {
      return item._id == attribute.itemid;
    })[0];
  }

  //No item?
  if (!item) return 0;

  let enchant = item.system.enchant;
  let rollFormula = enchant.roll;
  let rollData = {};
  let rollOptions = {};
  let roll = new Roll(rollFormula, rollData, rollOptions);
  let rollResult = roll.roll({ async: false });

  if (actor) {
    extraMessageData.title = game.i18n.format("orc.dialog.enchant.title", {
      charName: actor.name,
      enchantName: enchant.name,
    });
  } else {
    extraMessageData.title = game.i18n.format(
      "orc.dialog.enchant.titleNoActor",
      {
        enchantName: enchant.name,
      }
    );
  }

  Chat.EnchantRollToCustomMessage(rollResult, {
    ...extraMessageData,
  });

  return rollResult.total;
}
