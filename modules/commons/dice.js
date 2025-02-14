import * as Chat from "./chat.js";
import { ORC } from "./config.js";

export function AttributeRoll({
  actor = null,
  attribute = null,
  modif = 0,
  extraMessageData = {},
  } = {}) {

  if (attribute.attributelocalmodif != null){
    let rollFormula = attribute.attributelocalmodif
    let roll = new Roll(rollFormula, {}, {});
    let rollResult = roll.roll({ async: false });
    modif += parseFloat(rollResult.total);
  }

  let rollFormula = "1d100";
  let rollData = {}; //for some reasons, rollData are not conserved on ChatMessage, use rollOptions instead
  let rollOptions = {
    attributeName: attribute.attributename,
    attributeValue: (parseFloat(attribute.attributevalue) + modif).toString(),
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

export function SpellRoll({
  actor = null,
  attribute = null,
  modif = 0,
  extraMessageData = {},
}) {
  let costFormula, powerFormula, durationFormula;
  let costroll = null, powerroll = null, durationroll = null;
  let costRoll = null, powerRoll = null, durationRoll = null;

  let roll;
  let rollData = {}; 
  let rollOptions = {
    visibleByPlayers: actor.ownership.default,
  }; 

  let critical = null;
  if (this.AttributeRoll({
        actor,
        attribute,
        modif,
        extraMessageData,
        }) 
        <= actor.system.roll.limitCritical){
          critical = 1;
        }

    //Consume ressource
    costFormula = actor.system.magic.effective.cost;
    if (typeof costFormula !== "string") costFormula = costFormula.toString();
    //Apply multi
    if (actor.system.magic.effective.costMult > 0){
      costFormula = "(" + costFormula + ")"
      costFormula += " * " + (actor.system.magic.effective.costMult).toString();
    }
    //Apply reductions
    if (actor.system.magic.mpReduc > 0)
      costFormula += " + " + (actor.system.magic.mpReduc).toString();
    else if (actor.system.magic.mpReduc < 0)
      costFormula += + (actor.system.magic.mpReduc).toString();
    //Do the roll
    if (costFormula != "") {
      costroll = new Roll(costFormula, rollData, rollOptions);
      costRoll = costroll.roll({ async: false });
      //Integer cost 
      if (costRoll._total > 0 && costRoll._total < 1) costRoll._total = 1 
      costRoll._total = Math.floor(costRoll._total)
      //Remove ressource from actor
      if (actor.system.magic.effective.useHP) {
        if (actor.system.hp.value <= 0) return;
        let newValue = actor.system.hp.value - costRoll.total;
        if (newValue < actor.system.hp.surplus)
          newValue = actor.system.hp.surplus;
        actor.update({ system: { hp: { value: newValue } } });
      } else {
        let newValue = actor.system.mp.value - costRoll.total;
        if (newValue < 0) return;
        actor.update({ system: { mp: { value: newValue } } });
      }
    }

    //Roll power
    powerFormula = actor.system.magic.effective.power;
    //Apply multi
    if (actor.system.magic.effective.powerMult > 0){
      powerFormula = "(" + powerFormula + ")"
      powerFormula += " * " + (actor.system.magic.effective.powerMult).toString();
    }
    //Apply modificators
    if(actor.system.magic.powerModif != "")
      powerFormula += " + " + actor.system.magic.powerModif;
    //Convert to string
    if (typeof powerFormula !== "string")
      powerFormula = powerFormula.toString();
    //Roll
    if (powerFormula != ""){
      powerroll = new Roll(powerFormula, rollData, rollOptions);
      powerRoll = powerroll.roll({ async: false });
    }
    if (powerRoll != null){
      let powerMin= -10000;
      //If critical -> max power
      if (critical) {
        //Split the formula between the "+"
        let formulaSplitPlus = powerFormula.split("+");
        for (let i = 0; i < formulaSplitPlus.length; i++) {
          //Split the sub-formula related to dices between the "d"
          if (formulaSplitPlus[i].includes("d")) {
            let formulatSplitDice = formulaSplitPlus[i].split("d");
            powerMin +=
              parseFloat(formulatSplitDice[0]) * parseFloat(formulatSplitDice[1]);
          } else powerMin += parseFloat(formulaSplitPlus[i]);
        }
      }
      //Integer power 
      if (powerRoll._total < powerMin) powerRoll._total = powerMin;
      powerRoll._total = Math.floor(powerRoll._total)
    }

    //Roll duration
    durationFormula = actor.system.magic.effective.duration;
    if (typeof durationFormula !== "string")
      durationFormula = durationFormula.toString();
    if (durationFormula != ""){
      durationroll = new Roll(durationFormula, rollData, rollOptions);
      durationRoll = durationroll.roll({ async: false });
      //Integer duration 
      durationRoll._total = Math.floor(durationRoll._total)
    }

    extraMessageData.title = game.i18n.format("orc.dialog.rollSpell.title", {
      actorName: actor.name,
    });
    extraMessageData.range = actor.system.magic.effective.range;
    extraMessageData.effect = actor.system.magic.effective.effect;
    extraMessageData.useHP = actor.system.magic.effective.useHP;
    extraMessageData.durationUnit = actor.system.magic.effective.durationUnit;

    //Get active spell names
    let bases = actor.system.magic.actives.bases.array;
    let shapes = actor.system.magic.actives.shapes.array;
    let powers = actor.system.magic.actives.powers.array;
    let modifs = actor.system.magic.actives.modifs.array;
    const spells = bases.concat(shapes, powers, modifs);

    let baseNames  = null;
    let shapeNames = null;
    let powerNames = null;
    let modifNames = null;

    for (const id of spells){
      let item = actor.items.get(id);
      
      if(item == null)         continue;
      if(item.type != "spell") continue;
  
      let name = item.name;
      let type = item.system.type;

      //Depending of the spell type, fill the correct string
      if(type == ORC.spellType.base){
        if(baseNames == null) baseNames = name;
        else                  baseNames += ", " + name;
      }
      if(type == ORC.spellType.shape){
        if(shapeNames == null) shapeNames = name;
        else                   shapeNames += ", " + name;
      }
      if(type == ORC.spellType.power){
        if(powerNames == null) powerNames = name;
        else                   powerNames += ", " + name;
      }
      if(type == ORC.spellType.modif){
        if(modifNames == null) modifNames = name;
        else                   modifNames += ", " + name;
      }
    }

    //Display the message
    /*
    //Display a limited message if the player is not allowed to see the form
    if (rollOptions.visibleByPlayers == 0) {
      Chat.SpellRollToCustomLimitedMessage(
        { costRoll, powerRoll, durationRoll },
        { ...extraMessageData }
      );
    }
    */
    Chat.SpellRollToCustomFullMessage(
      { costRoll, powerRoll, durationRoll },
      {baseNames, shapeNames, powerNames, modifNames},
      { ...extraMessageData }
    );
  
  return;
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
  let strengh = actor.system.attributes.strengh;
  let attribute = {
    attributename: "Constitution", //strengh.name,    ////c'est pas beau !
    attributevalue: strengh.value,
    attributevaluebase: strengh.native,
  };
  return (
    this.AttributeRoll({
      actor: actor,
      attribute: attribute,
      modif: modif,
    }) >
    strengh.value + modif
  );
}

export function DamageRoll({
  actor = null,
  weapon = null,
  attribute = null,
  critical = null,
  extraMessageData = {},
} = {}) {
  //Init
  let ammo = null;
  let rollFormula = "";
  extraMessageData.effect = "";
  let rollData = {};
  let rollOptions = {
    visibleByPlayers: actor == null ? 1 : actor.ownership.default,
  };
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
        let maj;
        if (ammoStock > 0) {
          if (ammo.system.damage)
            //Add the ammo to the formula
            rollFormula += "+" + ammo.system.damage;
          //Add the weapon effects to the message
          if (ammo.system.effect)
            extraMessageData.effect += " " + ammo.system.effect;
          precise = precise || ammo.system.precise;
          //Remove one ammo
          if(attribute.nammo == null)
            maj = { system: { stock: ammoStock - 1 } };
          else
            maj = { system: { stock: ammoStock - attribute.nammo } };
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

    //If critical -> deal max damage
    if (critical) {
      //Split the formula between the "+"
      let formulaSplitPlus = rollFormula.split("+");
      for (let i = 0; i < formulaSplitPlus.length; i++) {
        //Split the sub-formula related to dices between the "d"
        if (formulaSplitPlus[i].includes("d")) {
          let formulatSplitDice = formulaSplitPlus[i].split("d");
          damageMin +=
            parseFloat(formulatSplitDice[0]) * parseFloat(formulatSplitDice[1]);
        } else damageMin += parseFloat(formulaSplitPlus[i]);
      }
    }

    //Define the message title
    extraMessageData.titleLimited = game.i18n.format(
      "orc.dialog.damageFromWeapon.titleLimited",
      {
        actorName: actor == null ? "XXX" : actor.name,
      }
    );
    extraMessageData.title = game.i18n.format(
      "orc.dialog.damageFromWeapon.title",
      {
        actorName: actor == null ? "XXX" : actor.name,
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
  //Display a limited message if the player is not allowed to see the form
  if (rollOptions.visibleByPlayers == 0) {
    Chat.DamageRollToCustomLimitedMessage(rollResult, {
      ...extraMessageData,
    });
  }
  Chat.DamageRollToCustomFullMessage(rollResult, {
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
  else
    actor.update({ system: { status: { burn: actor.system.status.burn - 5 } } });

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

// From a dice formula, calculate the min, mean and max values
export function CalculateValuesFromDiceFormula({formula = "", mult = 1, useMedian = false}) {
  if(formula == "")
    return { min: 0, avg: 0, max: 0 };

  // Helper function to calculate the median of a die
  const median = (sides) => (sides % 2 === 0 ? (sides / 2 + 0.5) : Math.ceil(sides / 2));

  // Parse the formula into individual components (e.g., numbers and dice rolls)
  const parts = formula.match(/([+-]?\d+d\d+|[+-]?\d+)/g);

  let min = 0, max = 0, avg = 0;

  for (const part of parts) {
    const sign = part[0] === '-' ? -1 : 1; // Determine if the part is negative
    const cleanPart = part.startsWith("+") || part.startsWith("-") ? part.slice(1) : part;

    if (cleanPart.includes("d")) {
        // Handle dice rolls (e.g., "2d6")
        const [count, sides] = cleanPart.split("d").map(Number);

        const dieMin = useMedian ? median(sides) : 1;
        const dieMax = sides;

        // Adjust the average when using median replacement
        let dieAvg;
        if (useMedian) {
            const dieMedian = median(sides);
            const belowMedianProbability = (dieMedian - 1) / sides;

            // Adjust for the group of dice
            const adjustedAvgForGroup = belowMedianProbability * dieMedian + 
                (1 - belowMedianProbability) * (sides + 1) / 2;
            dieAvg = adjustedAvgForGroup * count;
        } else {
            dieAvg = count * (1 + sides) / 2;
        }

        // Accumulate results for the group with the appropriate sign
        min += sign * count * dieMin;
        max += sign * count * dieMax;
        avg += sign * dieAvg;
    } else {
        // Handle fixed numbers (e.g., "6")
        const value = Number(cleanPart);

        // Add the fixed number to the results with the appropriate sign
        min += sign * value;
        max += sign * value;
        avg += sign * value;
    }
  }

  // Return the calculated results
  return { min: Math.round(min * mult), avg: Math.round(avg * mult), max: Math.round(max * mult) };
}