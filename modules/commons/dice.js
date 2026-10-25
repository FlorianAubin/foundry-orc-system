import * as Chat from "./chat.js";
import { ORC } from "./config.js";

export async function AttributeRoll({
  actor = null,
  attribute = null,
  modif = 0,
  extraMessageData = {},
  } = {}) {

  if (attribute.attributelocalmodif != null){
    let rollFormula = attribute.attributelocalmodif
    let roll = new Roll(rollFormula, {}, {});
    await roll.evaluate();
    modif += parseFloat(roll.total);
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
  await roll.evaluate()

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
      parseFloat(roll.total)
    ).toString(),
  };

  if (roll.total <= actor.system.roll.limitCritical) {
    extraMessageData.message = "orc.dialog.criticalSuccess";
    extraMessageData.color = "critical";
  } else if (roll.total >= actor.system.roll.limitFumble) {
    extraMessageData.message = "orc.dialog.fumbleFailure";
    extraMessageData.color = "fumble";
  } else if (
    roll.total <= parseFloat(extraMessageData.attributeValue.value)
  ) {
    extraMessageData.message = "orc.dialog.Success";
  } else if (
    roll.total > parseFloat(extraMessageData.attributeValue.value)
  ) {
    extraMessageData.message = "orc.dialog.Failure";
  }

  //Display a limited message if the player is not allowed to see the form
  if (rollOptions.visibleByPlayers == 0) {
    Chat.AttributeRollToCustomLimitedMessage(roll, {
      ...extraMessageData,
    });
  }
  Chat.AttributeRollToCustomFullMessage(roll, {
    ...extraMessageData,
  });

  return roll.total;
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

export async function SpellRoll({
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
    //if (actor.system.magic.mpReduc > 0)
    //  costFormula += " + " + (actor.system.magic.mpReduc).toString();
    //else if (actor.system.magic.mpReduc < 0)
    //  costFormula += + (actor.system.magic.mpReduc).toString();
    //Do the roll
    if (costFormula != "") {
      costroll = new Roll(costFormula, rollData, rollOptions);
      await costroll.evaluate()

      // Minimal cost
      // if (costRoll._total < 0) costRoll._total = 0 
      if (costroll._total < 1) costroll._total = 1 
      //Integer cost 
      costroll._total = Math.floor(costroll.total)
      //Remove ressource from actor
      if (actor.system.magic.effective.useHP) {
        if (actor.system.hp.value <= 0) return;
        let newValue = actor.system.hp.value - costroll.total;
        if (newValue < actor.system.hp.surplus)
          newValue = actor.system.hp.surplus;
        actor.update({ system: { hp: { value: newValue } } });
      } else {
        let newValue = actor.system.mp.value - costroll.total;
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
    //if(actor.system.magic.powerModif != "")
    //  powerFormula += " + " + actor.system.magic.powerModif;
    //Convert to string
    if (typeof powerFormula !== "string")
      powerFormula = powerFormula.toString();
    //Roll
    if (powerFormula != ""){
      powerroll = new Roll(powerFormula, rollData, rollOptions);
      await powerroll.evaluate()
    }
    if (powerroll != null){
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
      if (powerroll._total < powerMin) powerroll._total = powerMin;
      powerroll._total = Math.floor(powerroll._total)
    }

    //Roll duration
    durationFormula = actor.system.magic.effective.duration;
    if (typeof durationFormula !== "string")
      durationFormula = durationFormula.toString();
    if (durationFormula != ""){
      durationroll = new Roll(durationFormula, rollData, rollOptions);
      await durationroll.evaluate()
      //Integer duration 
      durationroll._total = Math.floor(durationroll._total)
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
        { costroll, powerroll, durationroll },
        { ...extraMessageData }
      );
    }
    */
    Chat.SpellRollToCustomFullMessage(
      { costroll, powerroll, durationroll },
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


export async function DamageRoll({
  actor = null,
  weapon = null,
  attribute = {},
  critical = null,
  extraMessageData = {},
} = {}) {
  let ammo = null;
  let rollFormula = "";
  let rollData = {};
  let precise = false;
  let damageMin = 0;

  extraMessageData.effect = extraMessageData.effect ?? "";

  const rollOptions = {
    visibleByPlayers: actor == null ? 1 : actor.ownership.default,
  };

  // Aucun acteur ni aucune arme : quitter
  if (!actor && !weapon) return 0;

  // Récupérer l'arme depuis son identifiant
  if (actor && attribute?.weaponid && !weapon) {
    weapon = actor.items.find(
      item => item.type === "weapon" &&
              item.id === attribute.weaponid
    );
  }

  // Dégâts bonus sans arme
  if (!weapon) {
    extraMessageData.title = game.i18n.format(
      "orc.dialog.damageBonus.title",
      {}
    );

    rollFormula += String(actor.system.damageBonus.value);
  } else {
    // Formule et effets de l'arme
    rollFormula += weapon.system.damage;
    extraMessageData.effect += weapon.system.effect ?? "";
    extraMessageData.range =
      extraMessageData.range ?? weapon.system.range ?? "";

    precise = precise || weapon.system.precise;

    if (actor) {
      if (weapon.system.useAmmo) {
        // Récupérer les munitions
        ammo = actor.items.find(
          item => item.type === "ammo" &&
                  item.id === weapon.system.ammo
        );

        if (!ammo) return 0;

        const ammoStock = Number(ammo.system.stock ?? 0);
        const ammoCost = Number(attribute?.nammo ?? 1);

        extraMessageData.showAmmoAfter = true;

        // Sécurité : ne pas tirer avec un stock insuffisant
        if (ammoStock < ammoCost) return 0;

        // Ajouter les dégâts et effets des munitions
        if (ammo.system.damage) {
          rollFormula += "+" + ammo.system.damage;
        }

        if (ammo.system.effect) {
          extraMessageData.effect += " " + ammo.system.effect;
        }

        precise = precise || ammo.system.precise;

        // Consommer les munitions une seule fois
        const ammoAfter = ammoStock - ammoCost;

        await ammo.update({
          "system.stock": ammoAfter,
        });

        // Données de la carte
        extraMessageData.ammoAfter = ammoAfter;
        extraMessageData.ammoTag = 1;
        extraMessageData.ammo = game.i18n.format(
          "orc.dialog.damageFromWeapon.ammo",
          {
            ammoName: ammo.name,
          }
        );
      } else {
        // Arme sans munitions
        extraMessageData.ammoTag = 0;
        extraMessageData.showAmmoAfter = false;

        if (actor.system.damageBonus.value) {
          rollFormula += "+" + actor.system.damageBonus.value;
        }
      }
    }

    // Dégâts minimum d'une arme précise
    if (precise) {
      const formulaSplitPlus = rollFormula.split("+");

      for (const part of formulaSplitPlus) {
        if (part.includes("d")) {
          const [numberOfDice, diceFaces] = part.split("d");

          damageMin +=
            parseFloat(numberOfDice) *
            (Math.floor(parseFloat(diceFaces) / 2) + 0.5);
        } else {
          damageMin += parseFloat(part);
        }
      }

      damageMin = Math.floor(damageMin);
    }

    // Dégâts maximum en cas de critique
    if (critical) {
      let criticalDamage = 0;

      for (const part of rollFormula.split("+")) {
        if (part.includes("d")) {
          const [numberOfDice, diceFaces] = part.split("d");
          criticalDamage +=
            parseFloat(numberOfDice) * parseFloat(diceFaces);
        } else {
          criticalDamage += parseFloat(part);
        }
      }

      damageMin = Math.max(damageMin, criticalDamage);
    }

    // Titres du message
    extraMessageData.titleLimited = game.i18n.format(
      "orc.dialog.damageFromWeapon.titleLimited",
      {
        actorName: actor?.name ?? "XXX",
      }
    );

    extraMessageData.title = game.i18n.format(
      "orc.dialog.damageFromWeapon.title",
      {
        actorName: actor?.name ?? "XXX",
        weaponName: weapon.name,
      }
    );
  }

  // Effectuer le jet
  const roll = new Roll(rollFormula, rollData, rollOptions);
  await roll.evaluate();

  // Appliquer les dégâts minimums
  if (roll.total < damageMin) {
    roll._total = damageMin;
  }

  // Message limité pour les joueurs sans permission
  if (rollOptions.visibleByPlayers == 0) {
    await Chat.DamageRollToCustomLimitedMessage(roll, {
      ...extraMessageData,
    });
  }

  // Message complet
  await Chat.DamageRollToCustomFullMessage(roll, {
    ...extraMessageData,
  });

  return roll.total;
}


export async function BleedRoll({
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
  }  else {
    return 0;
  }

  let rollFormula = ndice + "d6";
  let rollData = {}; //for some reasons, rollData are not conserved on ChatMessage, use rollOptions instead
  let rollOptions = {
    actorName: actor.name,
    visibleByPlayers: actor.ownership.default,
  };

  let roll = new Roll(rollFormula, rollData, rollOptions);
  await roll.evaluate()

  Chat.StatusRollToCustomMessage(roll, {
    ...extraMessageData,
  });

  return roll.total;
}

export async function PoisonRoll({
  actor = null,
  type = null,
  extraMessageData = {},
}) {
  let ndice = 0;
  if (type === "poison") {
    ndice = actor.system.status.poison;
    extraMessageData.title = game.i18n.format("orc.dialog.poison.title", {
      charName: actor.name,
    });
  } else {
    return 0;
  }

  let rollFormula = (actor.system.status.poisonDamage).toString();
  let rollData = {}; //for some reasons, rollData are not conserved on ChatMessage, use rollOptions instead
  let rollOptions = {
    actorName: actor.name,
    visibleByPlayers: actor.ownership.default,
  };

  let roll = new Roll(rollFormula, rollData, rollOptions);
  await roll.evaluate()

  Chat.StatusRollToCustomMessage(roll, {
    ...extraMessageData,
  });

  return roll.total;
}


export async function  BurnRoll({ actor = null, extraMessageData = {} }) {
  let rollFormula = "1d100";
  let rollData = {}; //for some reasons, rollData are not conserved on ChatMessage, use rollOptions instead
  let rollOptions = {
    actorName: actor.name,
    visibleByPlayers: actor.ownership.default,
  };

  let roll = new Roll(rollFormula, rollData, rollOptions);
  await roll.evaluate()

  extraMessageData.title = game.i18n.format("orc.dialog.burn.title", {
    charName: actor.name,
  });
  if (roll.total <= actor.system.status.burn) {
    extraMessageData.info = game.i18n.format("orc.dialog.burn.onFire", {
      charName: actor.name,
    });
  }
  else
    actor.update({ system: { status: { burn: actor.system.status.burn - 5 } } });

  Chat.StatusRollToCustomMessage(roll, {
    ...extraMessageData,
  });

  return roll.total;
}
export async function EnchantRoll({
  actor = null,
  item = null,
  attribute = null,
  extraMessageData = {},
} = {}) {
  if (!actor && !item) return 0;

  // Récupération de l'objet depuis la fiche du personnage
  if (actor && attribute?.itemid) {
    item = actor.items.get(attribute.itemid);
  }

  if (!item) return 0;

  const enchant = item.system.enchant;
  if (!enchant?.roll) return 0;

  const rollFormula = enchant.roll;
  const roll = await new Roll(rollFormula).evaluate();

  const messageData = {
    ...extraMessageData,
    itemName: item.name,
    enchantName: enchant.name,
    rollFormula,
    rollTotal: roll.total,
  };

  if (actor) {
    messageData.title = game.i18n.format(
      "orc.dialog.enchant.title",
      {
        charName: actor.name,
        enchantName: enchant.name,
      }
    );
    messageData.actorName = actor.name;
  } else {
    messageData.title = game.i18n.format(
      "orc.dialog.enchant.titleNoActor",
      {
        enchantName: enchant.name,
      }
    );
    messageData.actorName = null;
  }

  await Chat.EnchantRollToCustomMessage(roll, messageData);

  return roll.total;
}

// From a dice formula, calculate the min, mean and max values
export function CalculateValuesFromDiceFormula({formula = "", mult = 1, useMedian = false, min_val = null}) {
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

  min = Math.floor(min * mult);
  avg = Math.floor(avg * mult);
  max = Math.floor(max * mult)

  if (min_val != null){
    if (min < min_val) min = min_val;
    if (max < min_val) max = min_val;
    if (avg < min_val) avg = min_val;
  }



  // Return the calculated results
  return { min: min, avg: avg, max: max };
}