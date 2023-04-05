export function AttributeRoll({
  actor = null,
  attribute = null,
  extraMessageData = {},
} = {}) {
  let rollFormula = "1d100";
  let rollData = {}; //for some reasons, rollData are not conserved on ChatMessage, use rollOptions instead
  let rollOptions = {
    attributeName: attribute.attributename,
    attributeValue: attribute.attributevalue,
    actorName: actor.name,
    actorLimitCritical: actor.system.roll.limitCritical,
    actorLimitFumble: actor.system.roll.limitFumble,
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
      parseFloat(attribute.attributevaluebase)
    ).toString(),
    value: attribute.attributevalue,
    diff: (
      parseFloat(attribute.attributevalue) - parseFloat(rollResult.total)
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
    AttributeRollToCustomLimitedMessage(rollResult, {
      ...extraMessageData,
    });
  }
  AttributeRollToCustomFullMessage(rollResult, {
    ...extraMessageData,
  });
}

export async function AttributeRollToCustomFullMessage(rollResult, extraData) {
  const template = "systems/orc/templates/chat/roll-attribute-full-result.hbs";

  let templateContext = {
    ...extraData,
    roll: rollResult,
    tooltip: await rollResult.getTooltip(),
  };

  let chatData = {
    user: game.user._id,
    speaker: ChatMessage.getSpeaker(),
    roll: rollResult,
    sound: CONFIG.sounds.dice,
    content: await renderTemplate(template, templateContext),
    type: CONST.CHAT_MESSAGE_TYPES.ROLL,
  };
  //only visible to the GM and GM assistants
  if (rollResult.options.visibleByPlayers == 0) {
    chatData.blind = true;
    chatData.whisper = game.users.filter(function (user) {
      return user.role > 2;
    });
    chatData.type = CONST.CHAT_MESSAGE_TYPES.BLIND;
  }

  await ChatMessage.create(chatData);
}

export async function AttributeRollToCustomLimitedMessage(
  rollResult,
  extraData
) {
  const template =
    "systems/orc/templates/chat/roll-attribute-limited-result.hbs";

  let templateContext = {
    ...extraData,
    roll: rollResult,
    tooltip: await rollResult.getTooltip(),
  };

  let chatData = {
    user: game.user._id,
    speaker: ChatMessage.getSpeaker(),
    roll: rollResult,
    content: await renderTemplate(template, templateContext),
    type: CONST.CHAT_MESSAGE_TYPES.ROLL,
  };

  await ChatMessage.create(chatData);
}

export function AttackRoll({
  actor = null,
  attribute = null,
  extraMessageData = {},
}) {
  this.AttributeRoll({
    actor,
    attribute,
    extraMessageData,
  });
}

export function DodgeRoll({
  actor = null,
  attribute = null,
  extraMessageData = {},
}) {
  this.AttributeRoll({
    actor,
    attribute,
    extraMessageData,
  });
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

        const ammoStock = ammo.system.stock;
        if (ammoStock > 0) {
          if (ammo.system.damage)
            //Add the ammo to the formula
            rollFormula += "+" + ammo.system.damage;
          //Add the weapon effects to the message
          if (ammo.system.effect)
            extraMessageData.effect += " " + ammo.system.effect;
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
      //If the weapon don't use ammo,
      else {
        //Tag the message as "no ammo used"
        extraMessageData.ammoTag = 0;
        //Add the actor damage bonus
        if (actor.system.damageBonus.value)
          rollFormula += "+" + actor.system.damageBonus.value;
      }
    }

    //If the weapon is tagged as "precise", set a min damage
    if (weapon.system.precise) {
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
  DamageRollToCustomMessage(rollResult, {
    ...extraMessageData,
  });

  return rollResult.total;
}

export async function DamageRollToCustomMessage(rollResult, extraData) {
  const template = "systems/orc/templates/chat/roll-damage-result.hbs";

  let templateContext = {
    ...extraData,
    roll: rollResult,
    tooltip: rollResult ? await rollResult.getTooltip() : null,
  };

  let chatData = {
    user: game.user._id,
    speaker: ChatMessage.getSpeaker(),
    roll: rollResult,
    sound: CONFIG.sounds.dice,
    content: await renderTemplate(template, templateContext),
    type: CONST.CHAT_MESSAGE_TYPES.ROLL,
  };

  await ChatMessage.create(chatData);
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
    return;
  }

  let rollFormula = ndice + "d6";
  let rollData = {}; //for some reasons, rollData are not conserved on ChatMessage, use rollOptions instead
  let rollOptions = {
    actorName: actor.name,
    visibleByPlayers: actor.ownership.default,
  };

  let roll = new Roll(rollFormula, rollData, rollOptions);
  let rollResult = roll.roll({ async: false });

  StatusRollToCustomMessage(rollResult, {
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

  StatusRollToCustomMessage(rollResult, {
    ...extraMessageData,
  });

  return rollResult.total;
}

export async function StatusRollToCustomMessage(rollResult, extraData) {
  const template = "systems/orc/templates/chat/roll-status-result.hbs";

  let templateContext = {
    ...extraData,
    roll: rollResult,
    tooltip: await rollResult.getTooltip(),
  };

  let chatData = {
    user: game.user._id,
    speaker: ChatMessage.getSpeaker(),
    roll: rollResult,
    sound: CONFIG.sounds.dice,
    content: await renderTemplate(template, templateContext),
    type: CONST.CHAT_MESSAGE_TYPES.ROLL,
  };
  //only visible to the GM and GM assistants
  if (rollResult.options.visibleByPlayers == 0) {
    chatData.blind = true;
    chatData.whisper = game.users.filter(function (user) {
      return user.role > 2;
    });
    chatData.type = CONST.CHAT_MESSAGE_TYPES.BLIND;
  }

  await ChatMessage.create(chatData);
}
