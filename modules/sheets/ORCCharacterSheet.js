import * as Dice from "../commons/dice.js";
export default class ORCCharacterSheet extends ActorSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      template: "systems/orc/templates/sheet/character-sheet.hbs",
      classes: ["orc", "sheet", "actor", "character"],
      tabs: [
        {
          navSelector: ".sheet-tabs",
          contentSelector: ".sheet-body",
          initial: "shortcut", //default tab
        },
      ],
    });
  }

  get template() {
    return `systems/orc/templates/sheets/character-sheet.hbs`;
  }

  getData(options) {
    const data = super.getData(options);

    data.config = CONFIG.ORC;
    //Recover the onwed items
    data.weapons = data.items.filter(function (item) {
      return item.type == "weapon";
    });
    data.ammos = data.items.filter(function (item) {
      return item.type == "ammo";
    });
    data.armors = data.items.filter(function (item) {
      return item.type == "armor";
    });

    //Enrich the html to be able to link objects
    data.biographyHTML = TextEditor.enrichHTML(data.actor.system.biography, {
      secrets: this.actor.isOwner,
      async: false,
      relativeTo: this.actor,
    });

    data.unlocked = this.actor.getFlag(game.system.id, "SheetUnlocked");

    this._prepareCharacterData(data);

    //console.log(data);
    return data;
  }

  activateListeners(html) {
    html.find(".sheet-change-lock").click(this._onSheetChangelock.bind(this));

    html.find(".ap-deploy").click(this._onAPDeploy.bind(this));

    //html.find(".item-create").click(this._onItemCreate.bind(this));
    html.find(".item-edit").click(this._onItemEdit.bind(this));
    html.find(".item-delete").click(this._onItemDelete.bind(this));

    html.find(".item-equipped").click(this._onItemEquipped.bind(this));
    html
      .find(".weapon-choose-ammo")
      .change(this._onWeaponChooseAmmo.bind(this));
    html.find(".ammo-update-stock").change(this._onAmmoUpdateStock.bind(this));
    html.find(".armor-equipped").change(this._onArmorEquipped.bind(this));
    html.find(".armor-update-ap").change(this._onArmorUpdateAP.bind(this));

    html.find(".take-damage").click(this._onTakeDamage.bind(this));
    html.find(".recover-hp").click(this._onRecoverHP.bind(this));
    html.find(".recover-mp").click(this._onRecoverMP.bind(this));

    html.find(".attribute-roll").click(this._onAttributeRoll.bind(this));
    html.find(".attack-roll").click(this._onAttackRoll.bind(this));
    html.find(".dodge-roll").click(this._onDodgeRoll.bind(this));

    html.find(".damage-roll").click(this._onDamageRoll.bind(this));

    html.find(".bleed-roll").click(this._onBleedRoll.bind(this));
    html.find(".bleed-off").click(this._onBleedOff.bind(this));
    html.find(".poison-roll").click(this._onPoisonRoll.bind(this));
    html.find(".poison-off").click(this._onPoisonOff.bind(this));
    html.find(".burn-roll").click(this._onBurnRoll.bind(this));
    html.find(".burn-damage").click(this._onBurnDamage.bind(this));
    html.find(".burn-off").click(this._onBurnOff.bind(this));

    html.find(".new-day").click(this._onNewDay.bind(this));

    html
      .find(".attack-with-weapon-roll")
      .click(this._onAttackWithWeaponRoll.bind(this));

    super.activateListeners(html);
  }

  /**
   * Manage the lock/unlock button on the sheet
   */
  async _onSheetChangelock(event) {
    event.preventDefault();

    let flagData = await this.actor.getFlag(game.system.id, "SheetUnlocked");
    flagData
      ? await this.actor.unsetFlag(game.system.id, "SheetUnlocked")
      : await this.actor.setFlag(
          game.system.id,
          "SheetUnlocked",
          "SheetUnlocked"
        );

    this.actor.sheet.render(true);
  }

  async _onAPDeploy(event) {
    event.preventDefault();

    let maj = {
      system: { ap: { optionDeploy: !this.actor.system.ap.optionDeploy } },
    };
    this.actor.update(maj);
  }

  /**
   * Edit owned item
   */
  _onItemEdit(event) {
    const li = $(event.currentTarget).parents(".item");
    const item = this.actor.items.get(li.data("itemId"));
    item.sheet.render(true);
  }

  /**
   * Delete owned item
   */
  _onItemDelete(event) {
    const li = $(event.currentTarget).parents(".item");
    const item = this.actor.items.get(li.data("itemId"));
    item.delete();
  }

  _onItemEquipped(event) {
    event.preventDefault();
    let element = event.currentTarget;
    let itemId = element.closest(".item").dataset.itemId;
    let item = this.actor.items.get(itemId);
    if (item == null) return;

    //Check if the item can be equipped
    if (item.system.equipped == null) return;

    //If the item (weapon) needs ammo, if there is no linked ammo, and if the actor has ammo, use the first one by default
    if (item.system.useAmmo && item.system.ammo == "") {
      const defaultAmmo = this.getData().ammos[0];
      if (defaultAmmo) item.update({ system: { ammo: defaultAmmo._id } });
    }

    return item.update({
      system: { equipped: true, enchant: { activate: true } },
    });
  }

  _onArmorEquipped(event) {
    event.preventDefault();
    let element = event.currentTarget;
    let itemId = element.value;
    let items = this.actor.items;

    //Un-equipped all armors related to this body part
    let slotBodyPart = element.slot;
    for (let it of items) {
      if (it.type == "armor")
        if (it.system.bodyPart == slotBodyPart) {
          it.update({
            system: { equipped: false, enchant: { activate: false } },
          });
        }
    }

    //Recover the armor to equipped
    let item = items.get(itemId);
    if (item == null) return;
    if (item.type != "armor") return;

    //Check if the item can be equipped
    if (item.system.equipped == null) return;

    return item.update({
      system: { equipped: true, enchant: { activate: true } },
    });
  }

  _onWeaponChooseAmmo(event) {
    event.preventDefault();
    let element = event.currentTarget;
    let itemId = element.closest(".item").dataset.itemId;
    let item = this.actor.items.get(itemId);
    if (item.type != "weapon") return;

    let maj = { system: { ammo: event.currentTarget.value } };
    return item.update(maj);
  }

  _onAmmoUpdateStock(event) {
    event.preventDefault();
    let element = event.currentTarget;
    let itemId = element.closest(".item").dataset.itemId;
    let item = this.actor.items.get(itemId);
    if (item.type != "ammo") return;

    let maj = {
      system: {
        stock: parseFloat(event.currentTarget.value),
        weight: {
          total:
            Math.floor(
              100 *
                item.system.weight.indiv *
                parseFloat(event.currentTarget.value)
            ) / 100,
        },
      },
    };
    return item.update(maj);
  }

  _onArmorUpdateAP(event) {
    event.preventDefault();
    let element = event.currentTarget;
    let itemId = element.closest(".item").dataset.itemId;
    let item = this.actor.items.get(itemId);
    if (item.type != "armor") return;

    let maj = { system: { ap: parseFloat(event.currentTarget.value) } };
    return item.update(maj);
  }

  _onTakeDamage(event) {
    const damage = event.currentTarget.dataset.damage;
    const applyArmor = event.currentTarget.dataset.applyarmor === "true";
    const onMP = event.currentTarget.dataset.onmp === "true";
    if (!damage) return;
    this.takeDamage(damage, { applyArmor: applyArmor, onMP: onMP });
  }

  _onRecoverHP(event) {
    const heal = event.currentTarget.dataset.heal;
    const multiplier = event.currentTarget.dataset.multiplier;
    if (!heal || !multiplier) return;
    this.takeHeal(heal, multiplier, { onMP: false });
  }

  _onRecoverMP(event) {
    const heal = event.currentTarget.dataset.heal;
    const multiplier = 1;
    if (!heal) return;
    this.takeHeal(heal, multiplier, { onMP: true });
  }

  async _onAttributeRoll(event) {
    Dice.AttributeRoll({
      actor: this.actor,
      attribute: event.currentTarget.dataset,
    });
  }

  async _onAttackRoll(event) {
    Dice.AttackRoll({
      actor: this.actor,
      attribute: event.currentTarget.dataset,
    });
  }

  async _onDodgeRoll(event) {
    Dice.DodgeRoll({
      actor: this.actor,
      attribute: event.currentTarget.dataset,
    });
  }

  async _onDamageRoll(event) {
    Dice.DamageRoll({
      actor: this.actor,
      attribute: event.currentTarget.dataset,
    });
  }

  async _onPoisonRoll(event) {
    let damage = Dice.BleedPoisonRoll({
      actor: this.actor,
      type: event.currentTarget.dataset.type,
    });
    this.takeDamage(damage, { limitValue: 1 });
  }

  async _onBleedRoll(event) {
    let damage = Dice.BleedPoisonRoll({
      actor: this.actor,
      type: event.currentTarget.dataset.type,
    });
    this.takeDamage(damage);
  }

  async _onBurnRoll(event) {
    const rollResult = Dice.BurnRoll({
      actor: this.actor,
    });

    //If it rolls a 100, the burn stacks are removed
    if (rollResult == 100) {
      this._onBurnOff(event);
      return;
      //If it rolls a value lower than the number of stacks, the character catches fire.
    } else if (rollResult <= this.actor.system.status.burn) {
      let maj = { system: { status: { onfire: true } } };
      this.actor.update(maj);
    }
  }

  async _onBleedOff(event) {
    let maj = { system: { status: { bleed: 0 } } };
    this.actor.update(maj);
  }

  async _onPoisonOff(event) {
    let maj = { system: { status: { poison: 0 } } };
    this.actor.update(maj);
  }

  async _onBurnOff(event) {
    let maj = { system: { status: { burn: 0, onfire: false } } };
    this.actor.update(maj);
  }

  async _onBurnDamage(event) {
    let damage = this.actor.system.status.burn;
    this.takeDamage(damage, {
      applyArmor: true,
    });

    //Add 5 burn stacks
    let maj = { system: { status: { burn: damage + 5 } } };
    this.actor.update(maj);
  }

  async _onNewDay(event) {
    this.newDay();
  }

  async _onAttackWithWeaponRoll(event) {
    await Dice.AttackRoll({
      actor: this.actor,
      attribute: event.currentTarget.dataset,
    });
    await Dice.DamageRoll({
      actor: this.actor,
      attribute: event.currentTarget.dataset,
    });
  }

  async takeDamage(
    damageFormula,
    options = {
      applyArmor: false,
      onMP: false,
    }
  ) {
    if (typeof damageFormula !== "string")
      damageFormula = damageFormula.toString();
    let damage = new Roll(damageFormula).roll({ async: false }).total;
    if (options.applyArmor) damage -= this.actor.system.ap.value;

    let value, limitValue;
    value = this.actor.system.hp.value;
    limitValue = this.actor.system.hp.surplus;

    if (options.onMP) {
      value = this.actor.system.mp.value;
      limitValue = this.actor.system.mp.surplus;
      if (damage > value) {
        //MP cannot be negative, extra damages are reported to HP
        let extraDamage = damage - value;
        let extraOptions = { ...options };
        extraOptions.applyArmor = false;
        extraOptions.onMP = false;
        this.takeDamage(extraDamage, extraOptions);
        damage = value;
      }
    }

    if (damage <= 0) return;

    let newValue = value - damage;
    if (options.limitValue) limitValue = options.limitValue;
    if (newValue < limitValue) newValue = limitValue;

    let maj = {
      system: options.onMP
        ? { mp: { value: newValue } }
        : { hp: { value: newValue } },
    };

    this.actor.update(maj);
  }

  async takeHeal(
    healFormula,
    multiplier,
    options = {
      onMP: false,
    }
  ) {
    if (typeof healFormula !== "string") healFormula = healFormula.toString();
    let heal = new Roll(healFormula).roll({ async: false }).total;
    heal *= multiplier;

    let value, limitValue;
    value = this.actor.system.hp.value;
    limitValue = this.actor.system.hp.valueMax;
    if (options.onMP) {
      value = this.actor.system.mp.value;
      limitValue = this.actor.system.mp.valueMax;
    }

    let newValue = value + heal;
    if (newValue > limitValue) newValue = limitValue;

    let maj = {
      system: options.onMP
        ? { mp: { value: newValue } }
        : { hp: { value: newValue } },
    };

    this.actor.update(maj);
  }

  async newDay() {
    const valueMP = this.actor.system.mp.value;
    const limitValueMP = this.actor.system.mp.valueMax;
    let newValueMP = valueMP + 10;
    if (newValueMP > limitValueMP) newValueMP = limitValueMP;

    const food = this.actor.system.nutrition.foodDay;
    const foodNeeded = this.actor.system.nutrition.foodNeededDay.value;
    let newFood = food >= foodNeeded ? 0 : food - foodNeeded;
    const drink = this.actor.system.nutrition.drinkDay;
    const drinkNeeded = this.actor.system.nutrition.drinkNeededDay.value;
    let newDrink = drink >= drinkNeeded ? 0 : drink - drinkNeeded;

    let maj = {
      system: {
        mp: { value: newValueMP },
        nutrition: {
          foodDay: newFood,
          drinkDay: newDrink,
          tipsiness: 0,
        },
      },
    };

    this.actor.update(maj);
  }

  /**
   * Calulated the actor derived values
   */
  _prepareCharacterData(data) {
    //Init the actor derived values
    this.calculateValues(data);

    //Apply some modifiers, and recalculate the actor derived values if need !!! Must be done in this order !!!
    //Combat style
    if (this.applyCombatStyle(data)) this.calculateValues(data);
    //Modifiers from owned items
    if (this.applyModifFromItems(data)) this.calculateValues(data);
    //Encumbrance
    if (this.checkEncumbrance(data)) this.calculateValues(data);
    //Bad nutrition
    if (this.checkBadNutrition(data)) this.calculateValues(data);

    //Calculate the HP and MP surplus
    this.calculateSurplus(data);

    //Check if some effective values are higher the minimal or the maximal allowed values
    this.checkExcessValues(data);

    //Update the owned weapon effective values (damage, effect and attack)
    this.updateWeaponsEffectiveValues(data);
  }

  calculateValues(data) {
    const actor = data.actor;
    const actorData = actor.system;

    //HP
    actorData.hp.valueMax = actorData.hp.valueMaxNative;
    for (let [key, modificator] of Object.entries(actorData.hp.valueMaxModif))
      if (modificator) actorData.hp.valueMax += modificator;
    //MP
    actorData.mp.valueMax = actorData.mp.valueMaxNative;
    for (let [key, modificator] of Object.entries(actorData.mp.valueMaxModif))
      if (modificator) actorData.mp.valueMax += modificator;
    //AP
    actorData.ap.value = actorData.ap.native;
    for (let [key, modificator] of Object.entries(actorData.ap.valueModif))
      if (modificator) actorData.ap.value += modificator;

    //Attributes
    for (let [key, attribut] of Object.entries(actorData.attributes)) {
      attribut.value = attribut.native;
      for (let [key, modificator] of Object.entries(attribut.valueModif))
        if (modificator) attribut.value += modificator;
    }

    //Encumbrance limit
    //Recover the physical value
    actorData.encumbrance.limit = actorData.attributes.physical.value;
    //Remove the encumbrance modifier
    if (actorData.attributes.physical.valueModif.encumbrance)
      actorData.encumbrance.limit -=
        actorData.attributes.physical.valueModif.encumbrance;
    //Apply the multiplier
    actorData.encumbrance.limit *= actorData.encumbrance.limitMultiplier;
    actorData.encumbrance.limit = Math.floor(actorData.encumbrance.limit);
    for (let [key, modificator] of Object.entries(
      actorData.encumbrance.limitModif
    ))
      if (modificator) actorData.encumbrance.limit += modificator;

    //Encumbrance
    actorData.encumbrance.value = 0;
    for (let [key, modificator] of Object.entries(
      actorData.encumbrance.valueModif
    ))
      if (modificator) actorData.encumbrance.value += modificator;

    //Attack
    actorData.attack.native = actorData.attributes.physical.value;
    actorData.attack.value = actorData.attack.native;
    for (let [key, modificator] of Object.entries(actorData.attack.valueModif))
      if (modificator) actorData.attack.value += modificator;
    //Defence
    actorData.defence.value = actorData.defence.native;
    for (let [key, modificator] of Object.entries(actorData.defence.valueModif))
      if (modificator) actorData.defence.value += modificator;
    //Dodge
    actorData.dodge.native = actorData.attributes.physical.value - 20;
    actorData.dodge.value = actorData.dodge.native;
    for (let [key, modificator] of Object.entries(actorData.dodge.valueModif))
      if (modificator) actorData.dodge.value += modificator;
    //Damage bonus
    actorData.damageBonus.value = actorData.damageBonus.native;
    for (let [key, modificator] of Object.entries(
      actorData.damageBonus.valueModif
    )) {
      if (modificator) {
        if (!actorData.damageBonus.value)
          actorData.damageBonus.value += modificator;
        else actorData.damageBonus.value += " + " + modificator;
      }
    }

    //Roll limits
    //Critical
    actorData.roll.limitCritical.value = actorData.roll.limitCritical.native;
    for (let [key, modificator] of Object.entries(
      actorData.roll.limitCritical.valueModif
    ))
      if (modificator) actorData.roll.limitCritical.value += modificator;
    //Fumble
    actorData.roll.limitFumble.value = actorData.roll.limitFumble.native;
    for (let [key, modificator] of Object.entries(
      actorData.roll.limitFumble.valueModif
    ))
      if (modificator) actorData.roll.limitFumble.value += modificator;

    //Healing multiplier
    actorData.recoverHP.multiplier.value =
      actorData.recoverHP.multiplier.native;
    for (let [key, modificator] of Object.entries(
      actorData.recoverHP.multiplier.valueModif
    ))
      if (modificator) actorData.recoverHP.multiplier.value += modificator;

    //Nutrition need day
    //Food
    actorData.nutrition.foodNeededDay.value =
      actorData.nutrition.foodNeededDay.native;
    for (let [key, modificator] of Object.entries(
      actorData.nutrition.foodNeededDay.valueModif
    ))
      if (modificator) actorData.nutrition.foodNeededDay.value += modificator;
    //Drink
    actorData.nutrition.drinkNeededDay.value =
      actorData.nutrition.drinkNeededDay.native;
    for (let [key, modificator] of Object.entries(
      actorData.nutrition.drinkNeededDay.valueModif
    ))
      if (modificator) actorData.nutrition.drinkNeededDay.value += modificator;
  }

  applyCombatStyle(data) {
    const actor = data.actor;
    const actorData = actor.system;
    const style = actorData.combatStyle;
    if (style === "standard") {
      actorData.attack.valueModif.style = 0;
      actorData.defence.valueModif.style = 0;
      actorData.dodge.valueModif.style = 0;
      actorData.dodge.enable = false;
      actorData.damageBonus.valueModif.style = "";
    } else if (style === "offensive") {
      actorData.attack.valueModif.style = +10;
      actorData.defence.valueModif.style = -10;
      actorData.dodge.valueModif.style = 0;
      actorData.dodge.enable = false;
      actorData.damageBonus.valueModif.style = "";
    } else if (style === "defensive") {
      actorData.attack.valueModif.style = -15;
      actorData.defence.valueModif.style = +10;
      actorData.dodge.valueModif.style = 0;
      actorData.dodge.enable = false;
      actorData.damageBonus.valueModif.style = "";
    } else if (style === "dodge") {
      actorData.attack.valueModif.style = -10;
      actorData.defence.valueModif.style = -10;
      actorData.dodge.valueModif.style = 0;
      actorData.dodge.enable = true;
      actorData.damageBonus.valueModif.style = "";
    } else if (style === "aggressive") {
      actorData.attack.valueModif.style = -10;
      actorData.defence.valueModif.style = -10;
      actorData.dodge.valueModif.style = 0;
      actorData.dodge.enable = false;
      actorData.damageBonus.valueModif.style = "2d10";
    }

    return true;
  }

  applyModifFromItems(data) {
    const actor = data.actor;
    const actorData = actor.system;
    const items = data.items;
    let updated = false;

    let modif = {
      phyisical: 0,
      social: 0,
      intel: 0,
      hpMax: 0,
      mpMax: 0,
      ap: 0,
      attack: 0,
      defence: 0,
      dodge: 0,
      encumbranceLimit: 0,
      limitCritical: 0,
      limitFumble: 0,
      damageBonus: "",

      encumbrance: 0,
    };

    for (let [key, item] of Object.entries(items)) {
      //Weapons
      if (item.type == "weapon" && item.system.equipped) {
        if (item.system.defenceModif) modif.defence += item.system.defenceModif;
      }
      //Armors
      if (item.type == "armor") {
        if (item.system.equipped)
          if (item.system.ap) modif.ap += item.system.ap;
      }
      //Bag
      if (item.type == "bag") {
        if (actorData.encumbrance.equippedBag == item._id) {
          if (item.system.capacity)
            modif.encumbranceLimit += item.system.capacity;
          if (item.system.modifPhysical)
            modif.phyisical += item.system.modifPhysical;
        }
      }
      //All items with weight
      if (item.system.weight) {
        modif.encumbrance +=
          item.system.weight.total != null
            ? item.system.weight.total
            : item.system.weight;
      }
      //Add the enchant
      let enchant = item.system.enchant;
      if (enchant && enchant.activate) {
        if (enchant.physicalModif != 0) modif.physical += enchant.physicalModif;
        if (enchant.socialModif != 0) modif.social += enchant.socialModif;
        if (enchant.intelModif != 0) modif.intel += enchant.intelModif;
        if (enchant.hpMaxModif != 0) modif.hpMax += enchant.hpMaxModif;
        if (enchant.mpMaxModif != 0) modif.mpMax += enchant.mpMaxModif;
        if (enchant.apModif != 0) modif.ap += enchant.apModif;
        if (enchant.encumbranceLimitModif != 0)
          modif.encumbranceLimit += enchant.encumbranceLimitModif;
        if (enchant.attackModif != 0) modif.attack += enchant.attackModif;
        if (enchant.defenceModif != 0) modif.defence += enchant.defenceModif;
        if (enchant.dodgeModif != 0) modif.dodge += enchant.dodgeModif;
        if (enchant.limitCriticalModif != 0)
          modif.limitCritical += enchant.limitCriticalModif;
        if (enchant.limitFumbleModif != 0)
          modif.limitFumble += enchant.limitFumbleModif;
        if (enchant.damageBonusModif != 0)
          modif.damageBonus += "+" + enchant.damageBonusModif;
      }
    }

    if (modif.phyisical != 0) {
      actorData.attributes.physical.valueModif.items = modif.phyisical;
      updated = true;
    }
    if (modif.social != 0) {
      actorData.attributes.social.valueModif.items = modif.social;
      updated = true;
    }
    if (modif.intel != 0) {
      actorData.attributes.intel.valueModif.items = modif.intel;
      updated = true;
    }
    if (modif.hp != 0) {
      actorData.hp.valueMaxModif.items = modif.hp;
      updated = true;
    }
    if (modif.mp != 0) {
      actorData.mp.valueMaxModif.items = modif.mp;
      updated = true;
    }
    if (modif.ap != 0) {
      actorData.ap.valueModif.items = modif.ap;
      updated = true;
    }
    if (modif.attack != 0) {
      actorData.attack.valueModif.items = modif.attack;
      updated = true;
    }
    if (modif.defence != 0) {
      actorData.defence.valueModif.items = modif.defence;
      updated = true;
    }
    if (modif.dodge != 0) {
      actorData.dodge.valueModif.items = modif.dodge;
      updated = true;
    }
    if (modif.encumbranceLimit != 0) {
      actorData.encumbrance.limitModif.items = modif.encumbranceLimit;
      updated = true;
    }
    if (modif.limitCritical != 0) {
      actorData.roll.limitCritical.valueModif.items = modif.limitCritical;
      updated = true;
    }
    if (modif.limitFumble != 0) {
      actorData.roll.limitFumble.valueModif.items = modif.limitFumble;
      updated = true;
    }
    if (modif.damageBonus != "") {
      actorData.damageBonus.valueModif.items = modif.damageBonus;
      updated = true;
    }

    if (modif.encumbrance != 0) {
      actorData.encumbrance.valueModif.items = modif.encumbrance;
      updated = true;
    }

    return updated;
  }

  checkEncumbrance(data) {
    const actor = data.actor;
    const actorData = actor.system;
    const encumbrance = actorData.encumbrance.value;
    const limit = actorData.encumbrance.limit;
    let updated = false;

    if (encumbrance > 1 * limit) {
      //Malus in phyisical
      actorData.attributes.physical.valueModif.encumbrance =
        -5 * Math.floor(10 * (encumbrance / limit - 1 + 0.1));
      updated = true;
    }
    if (encumbrance > 1.2 * limit) {
      //Malus in defence
      actorData.defence.valueModif.encumbrance =
        -5 * Math.floor(10 * (encumbrance / limit - 1.2 + 0.1));
      updated = true;
    }
    if (encumbrance > 1.4 * limit) {
      //+1 drink needed per day
      actorData.nutrition.drinkNeededDay.valueModif.encumbrance = 1;
      //No dodge
      actorData.dodge.valueModif.encumbrance = -100;
      updated = true;
    }
    if (encumbrance > 1.6 * limit) {
      //+1 food needed per day
      actorData.nutrition.foodNeededDay.valueModif.encumbrance = 1;
      //Automatically hit
      actorData.defence.valueModif.encumbrance = -100;
      updated = true;
    }
    if (encumbrance > 1.8 * limit) {
      //+2 drink needed per day
      actorData.nutrition.drinkNeededDay.valueModif.encumbrance = 2;
      updated = true;
    }
    if (encumbrance > 2 * limit) {
      //No attack
      actorData.attack.valueModif.encumbrance = -100;
      updated = true;
    }
    return updated;
  }

  checkBadNutrition(data) {
    const actor = data.actor;
    const actorData = actor.system;
    let updated = false;

    //Food
    const food = actorData.nutrition.foodDay;
    if (food < 0) {
      updated = true;
      if (food == -1) {
        actorData.attributes.physical.valueModif.food = -5;
      } else if (food == -2) {
        actorData.attributes.physical.valueModif.food = -10;
      } else if (food == -3) {
        actorData.attributes.physical.valueModif.food = -20;
      } else if (food <= -4) {
        actorData.attributes.physical.valueModif.food = -40;
        actorData.hp.valueMaxModif.food = 10 * (food + 3);
      }
    }

    //Drink
    const drink = actorData.nutrition.drinkDay;
    if (drink < 0) {
      updated = true;
      if (drink == -1) {
        actorData.attributes.physical.valueModif.drink = -10;
      } else if (drink == -2) {
        actorData.attributes.physical.valueModif.drink = -20;
        actorData.hp.valueMaxModif.drink = -10;
      } else if (drink == -3) {
        actorData.attributes.physical.valueModif.drink = -30;
        actorData.hp.valueMaxModif.drink = -20;
      } else if (drink <= -4) {
        this.takeDamage(10000);
      }
    }

    //Tipsiness
    const tipsiness = actorData.nutrition.tipsiness;
    if (tipsiness > 0) {
      updated = true;
      if (tipsiness == 1) {
        actorData.attributes.social.valueModif.tipsiness = +5;
        actorData.attributes.intel.valueModif.tipsiness = -5;
      } else if (tipsiness == 2) {
        actorData.attributes.social.valueModif.tipsiness = +10;
        actorData.attributes.intel.valueModif.tipsiness = -10;
      } else if (tipsiness >= 3) {
        actorData.attributes.intel.valueModif.tipsiness = -10 * (tipsiness - 1);
      }
    }

    return updated;
  }

  calculateSurplus(data) {
    const actor = data.actor;
    const actorData = actor.system;

    actorData.hp.surplus = -Math.floor(actorData.hp.valueMaxNative / 5);
    actorData.mp.surplus = -Math.floor(actorData.mp.valueMaxNative / 5);
  }

  checkExcessValues(data) {
    const actor = data.actor;
    const actorData = actor.system;

    //HP
    if (actorData.hp.value > actorData.hp.valueMax)
      actorData.hp.value = actorData.hp.valueMax;
    //MP
    if (actorData.mp.value > actorData.mp.valueMax)
      actorData.mp.value = actorData.mp.valueMax;

    //Attributes
    for (let [key, attribut] of Object.entries(actorData.attributes))
      if (attribut.value < 0) attribut.value = 0;

    //Attack
    if (actorData.attack.value < 0) actorData.attack.value = 0;
    //Defence
    if (actorData.defence.value < -100) actorData.defence.value = -100;
    //Dodge
    if (actorData.dodge.value < 0) actorData.dodge.value = 0;

    //Food
    if (actorData.nutrition.foodDay > actorData.nutrition.foodMax)
      actorData.nutrition.foodDay = actorData.nutrition.foodMax;
    //Drink
    if (actorData.nutrition.drinkDay > actorData.nutrition.drinkMax)
      actorData.nutrition.drinkDay = actorData.nutrition.drinkMax;
  }

  updateWeaponsEffectiveValues(data) {
    const actor = data.actor;
    const weapons = data.weapons;
    const ammos = data.ammos;

    for (let [key, weapon] of Object.entries(weapons)) {
      let item = actor.items.get(weapon._id);

      let effectiveDamage = item.system.damage;
      let effectiveEffect = item.system.effect;
      let effectiveAttack = actor.system.attack.value + item.system.attackModif;

      if (item.system.useAmmo) {
        let ammo = ammos.filter(function (i) {
          return i._id == item.system.ammo;
        })[0];
        if (ammo) {
          effectiveDamage += "+" + ammo.system.damage;
          effectiveEffect += " " + ammo.system.effect;
        }
      } else if (actor.system.damageBonus.value != "") {
        effectiveDamage += "+" + actor.system.damageBonus.value;
      }

      let maj = {
        system: {
          effective: {
            damage: effectiveDamage,
            effect: effectiveEffect,
            attack: effectiveAttack,
          },
        },
      };
      item.update(maj);
    }
  }
}
