import * as Dice from "../commons/dice.js";
export default class ORCCharacterSheet extends ActorSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      template: "systems/orc/templates/sheet/character-sheet.hbs",
      classes: ["orc", "sheet", "actor"],
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

    html.find(".weapon-equipped").click(this._onWeaponEquipped.bind(this));
    html
      .find(".weapon-choose-ammo")
      .change(this._onWeaponChooseAmmo.bind(this));
    html.find(".ammo-update-stock").change(this._onAmmoUpdateStock.bind(this));
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

  prepareData() {
    super.prepareData();
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

  _onWeaponEquipped(event) {
    event.preventDefault();
    let element = event.currentTarget;
    let itemId = element.closest(".item").dataset.itemId;
    let item = this.actor.items.get(itemId);
    if (item.type != "weapon") return;

    //If the weapon needs ammo, there is no linked ammo, and the actor has ammo, use the first one by default
    if (item.system.useAmmo && item.system.ammo == "") {
      const defaultAmmo = this.getData().ammos[0];
      if (defaultAmmo) item.update({ system: { ammo: defaultAmmo._id } });
    }

    let maj = {
      system: {
        equipped: !item.system.equipped,
      },
    };
    return item.update(maj);
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

    let maj = { system: { stock: parseFloat(event.currentTarget.value) } };
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
    const foodNeeded = this.actor.system.nutrition.foodNeededDay;
    let newFood = food >= foodNeeded ? 0 : food - foodNeeded;
    const drink = this.actor.system.nutrition.drinkDay;
    const drinkNeeded = this.actor.system.nutrition.drinkNeededDay;
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
   * Calulated derived values
   */
  _prepareCharacterData(data) {
    this.applyCombatStyle(data);

    this.calculateEffectiveValues(data);

    if (this.applyModifFromItems(data)) this.calculateEffectiveValues(data);

    if (this.checkEncumbrance(data)) this.calculateEffectiveValues(data);
    if (this.checkBadNutrition(data)) this.calculateEffectiveValues(data);

    this.initSurplus(data);
    this.checkExcessValues(data);

    this.updateWeaponsEffectiveValues(data);
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
  }

  calculateEffectiveValues(data) {
    const actor = data.actor;
    const actorData = actor.system;

    //HP
    actorData.hp.valueMax = actorData.hp.valueMaxBase;
    for (let [key, modificator] of Object.entries(actorData.hp.valueMaxModif))
      if (modificator) actorData.hp.valueMax += modificator;
    //MP
    actorData.mp.valueMax = actorData.mp.valueMaxBase;
    for (let [key, modificator] of Object.entries(actorData.mp.valueMaxModif))
      if (modificator) actorData.mp.valueMax += modificator;
    //AP
    actorData.ap.native = actorData.ap.nativeBase;
    for (let [key, modificator] of Object.entries(actorData.ap.nativeModif))
      if (modificator) actorData.ap.native += modificator;
    actorData.ap.value = actorData.ap.native;
    for (let [key, modificator] of Object.entries(actorData.ap.valueModif))
      if (modificator) actorData.ap.value += modificator;

    //Attributes
    for (let [key, attribut] of Object.entries(actorData.attributes)) {
      attribut.value = attribut.valueBase;
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

    //Healing multiplier
    actorData.recoverHP.multiplier.value =
      actorData.recoverHP.multiplier.native;
    for (let [key, modificator] of Object.entries(
      actorData.recoverHP.multiplier.valueModif
    ))
      if (modificator) actorData.recoverHP.multiplier.value += modificator;
  }

  checkBadNutrition(data) {
    const actor = data.actor;
    const actorData = actor.system;
    let out = 0;

    //Food
    const food = actorData.nutrition.foodDay;
    if (food < 0) {
      out = 1;
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
      out = 1;
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
      out = 1;
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

    return out;
  }

  checkEncumbrance(data) {
    const actor = data.actor;
    const actorData = actor.system;
    const encumbrance = actorData.encumbrance.value;
    const limit = actorData.encumbrance.limit;

    if (encumbrance <= limit) {
      return 0;
    } else if (encumbrance <= 1.1 * limit) {
      actorData.attributes.physical.valueModif.encumbrance = -5;
    } else if (encumbrance <= 1.2 * limit) {
      actorData.attributes.physical.valueModif.encumbrance = -10;
    } else if (encumbrance <= 1.4 * limit) {
      actorData.attributes.physical.valueModif.encumbrance = -20;
    } else if (encumbrance <= 1.6 * limit) {
      actorData.attributes.physical.valueModif.encumbrance = -30;
    } else if (encumbrance <= 1.8 * limit) {
      actorData.attributes.physical.valueModif.encumbrance = -50;
    } else {
      actorData.attributes.physical.valueModif.encumbrance = -100;
    }
    return 1;
  }

  applyModifFromItems(data) {
    const actor = data.actor;
    const actorData = actor.system;
    const items = data.items;
    let encumbranceModif = 0;
    let defenceModif = 0;
    let apModif = 0;
    let out = 0;

    for (let [key, item] of Object.entries(items)) {
      //Weapons
      if (item.type == "weapon" && item.system.equipped) {
        if (item.system.defenceModif) defenceModif += item.system.defenceModif;
      }
      //Armors
      if (item.type == "armor") {
        let equipped = false;
        for (let [key, bodyPart] of Object.entries(actorData.ap.bodyParts))
          if (bodyPart == item._id) equipped = true;
        if (item.system.ap && equipped) apModif += item.system.ap;
      }
      //All items with weight
      if (item.system.weight) {
        encumbranceModif +=
          item.system.stock == null
            ? item.system.weight
            : item.system.weight * item.system.stock;
      }
    }

    if (defenceModif != 0) {
      actorData.defence.valueModif.weapons = defenceModif;
      out = 1;
    }
    if (apModif != 0) {
      actorData.ap.valueModif.armors = apModif;
      out = 1;
    }
    if (encumbranceModif != 0) {
      actorData.encumbrance.valueModif.weapons = encumbranceModif;
      out = 1;
    }

    return out;
  }

  initSurplus(data) {
    const actor = data.actor;
    const actorData = actor.system;

    actorData.hp.surplus = -Math.floor(actorData.hp.valueMaxBase / 5);
    actorData.mp.surplus = -Math.floor(actorData.mp.valueMaxBase / 5);
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
