import * as Dice from "../commons/dice.js";
export default class ORCCharacterSheet extends ActorSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      template: "systems/orc/templates/sheet/character-sheet.html",
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
    return `systems/orc/templates/sheets/${this.actor.type}-sheet.html`;
  }

  getData(options) {
    const data = super.getData(options);
    const actor = data.actor;
    const actorData = actor.system;

    data.config = CONFIG.ORC;
    data.weapons = data.items.filter(function (item) {
      return item.type == "weapon";
    });
    data.unlocked = this.actor.getFlag(game.system.id, "SheetUnlocked");

    this._prepareCharacterData(actorData);

    return data;
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find(".sheet-change-lock").click(this._onSheetChangelock.bind(this));

    html.find(".item-edit").click(this._onItemEdit.bind(this));
    html.find(".item-delete").click(this._onItemDelete.bind(this));

    html.find(".take-damage").click(this._onTakeDamage.bind(this));
    html.find(".take-heal").click(this._onTakeHeal.bind(this));

    html.find(".attribute-roll").click(this._onAttributeRoll.bind(this));
    html.find(".attack-roll").click(this._onAttackRoll.bind(this));
    html.find(".dodge-roll").click(this._onDodgeRoll.bind(this));

    html.find(".damage-roll").click(this._onDamageRoll.bind(this));
    html.find(".damageBonus-roll").click(this._onBonusDamageRoll.bind(this));

    html.find(".bleed-roll").click(this._onBleedRoll.bind(this));
    html.find(".bleed-off").click(this._onBleedOff.bind(this));
    html.find(".poison-roll").click(this._onPoisonRoll.bind(this));
    html.find(".poison-off").click(this._onPoisonOff.bind(this));
    html.find(".burn-roll").click(this._onBurnRoll.bind(this));
    html.find(".burn-damage").click(this._onBurnDamage.bind(this));
    html.find(".burn-off").click(this._onBurnOff.bind(this));

    html.find(".new-day").click(this._onNewDay.bind(this));
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

  _onTakeDamage(event) {
    const damage = event.currentTarget.dataset.damage;
    const applyArmor = event.currentTarget.dataset.applyarmor === "true";
    const onMP = event.currentTarget.dataset.onmp === "true";
    if (!damage) return;
    this.takeDamage(damage, { applyArmor: applyArmor, onMP: onMP });
  }

  _onTakeHeal(event) {
    const heal = event.currentTarget.dataset.heal;
    const multiplier = event.currentTarget.dataset.multiplier;
    if (!heal || !multiplier) return;
    this.takeHeal(heal, multiplier, {});
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
    });
  }

  async _onBonusDamageRoll(event) {
    Dice.BonusDamageRoll({
      actor: this.actor,
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
    console.log("(takeDamage) damage: " + damage);

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

  async takeHeal(healFormula, multiplier, options = {}) {
    if (typeof healFormula !== "string") healFormula = healFormula.toString();
    let heal = new Roll(healFormula).roll({ async: false }).total;
    heal *= multiplier;
    console.log("(takeHeal) healing: " + heal);

    let value, limitValue;
    value = this.actor.system.hp.value;
    limitValue = this.actor.system.hp.valueMax;

    let newValue = value + heal;
    if (newValue > limitValue) newValue = limitValue;

    let maj = {
      system: { hp: { value: newValue } },
    };

    this.actor.update(maj);
  }

  async newDay() {
    const valueMP = this.actor.system.mp.value;
    const limitValueMP = this.actor.system.mp.valueMax;
    let newValueMP = valueMP + 10;
    if (newValueMP > limitValueMP) newValueMP = limitValueMP;

    const valueFood = this.actor.system.nutrition.foodDay;
    let newValueFood = valueFood > 0 ? 0 : valueFood;
    const valueDrink = this.actor.system.nutrition.drinkDay;
    let newValueDrink = valueDrink > 0 ? 0 : valueDrink;

    let maj = {
      system: {
        mp: { value: newValueMP },
        nutrition: { foodDay: newValueFood, drinkDay: newValueDrink },
      },
    };

    this.actor.update(maj);
  }

  /**
   * Calulated derived values
   */
  _prepareCharacterData(actorData) {
    this.initSurplus(actorData);
    this.initModifValues(actorData);

    this.checkBadNutrition(actorData);
    this.applyCombatStyle(actorData);

    this.calculateEffectiveValues(actorData);

    this.checkExcessValues(actorData);
  }

  initSurplus(actorData) {
    actorData.hp.surplus = -Math.floor(actorData.hp.valueMaxBase / 5);
    actorData.mp.surplus = -Math.floor(actorData.mp.valueMaxBase / 5);
  }

  checkExcessValues(actorData) {
    if (actorData.hp.value > actorData.hp.valueMax)
      actorData.hp.value = actorData.hp.valueMax;
    if (actorData.mp.value > actorData.mp.valueMax)
      actorData.mp.value = actorData.mp.valueMax;

    if (actorData.nutrition.foodDay > actorData.nutrition.foodMax)
      actorData.nutrition.foodDay = actorData.nutrition.foodMax;
    if (actorData.nutrition.drinkDay > actorData.nutrition.drinkMax)
      actorData.nutrition.drinkDay = actorData.nutrition.drinkMax;
  }

  calculateEffectiveValues(actorData) {
    //HP
    for (let [key, modificator] of Object.entries(actorData.hp.valueMaxModif))
      if (modificator) actorData.hp.valueMaxModifSum += modificator;
    actorData.hp.valueMax =
      actorData.hp.valueMaxBase + actorData.hp.valueMaxModifSum;
    //MP
    for (let [key, modificator] of Object.entries(actorData.mp.valueMaxModif))
      if (modificator) actorData.mp.valueMaxModifSum += modificator;
    actorData.mp.valueMax =
      actorData.mp.valueMaxBase + actorData.mp.valueMaxModifSum;
    //AP
    for (let [key, modificator] of Object.entries(actorData.ap.nativeModif))
      if (modificator) actorData.ap.nativeModifSum += modificator;
    for (let [key, modificator] of Object.entries(actorData.ap.valueModif))
      if (modificator) actorData.ap.valueModifSum += modificator;
    actorData.ap.native = actorData.ap.nativeBase + actorData.ap.nativeModifSum;
    actorData.ap.value = actorData.ap.native + actorData.ap.valueModifSum;

    //Attributes
    for (let [key, attribut] of Object.entries(actorData.attributes)) {
      for (let [key, modificator] of Object.entries(attribut.valueModif))
        if (modificator) attribut.valueModifSum += modificator;
      attribut.value = attribut.valueBase + attribut.valueModifSum;
    }

    //Attack
    actorData.attack.native = actorData.attributes.physical.value;
    for (let [key, modificator] of Object.entries(actorData.attack.valueModif))
      if (modificator) actorData.attack.valueModifSum += modificator;
    actorData.attack.value =
      actorData.attack.native + actorData.attack.valueModifSum;
    //Defence
    for (let [key, modificator] of Object.entries(actorData.defence.valueModif))
      if (modificator) actorData.defence.valueModifSum += modificator;
    actorData.defence.value =
      actorData.defence.native + actorData.defence.valueModifSum;
    //Dodge
    actorData.dodge.native = actorData.attributes.physical.value - 20;
    for (let [key, modificator] of Object.entries(actorData.dodge.valueModif))
      if (modificator) actorData.dodge.valueModifSum += modificator;
    actorData.dodge.value =
      actorData.dodge.native + actorData.dodge.valueModifSum;
    //Damage bonus
    for (let [key, modificator] of Object.entries(
      actorData.damageBonus.valueModif
    )) {
      if (modificator) {
        if (!actorData.damageBonus.valueModifSum)
          actorData.damageBonus.valueModifSum += modificator;
        else actorData.damageBonus.valueModifSum += " + " + modificator;
      }
    }
    actorData.damageBonus.value =
      actorData.damageBonus.native + actorData.damageBonus.valueModifSum;

    //Healing multiplier
    for (let [key, modificator] of Object.entries(
      actorData.takeHeal.multiplier.valueModif
    ))
      if (modificator)
        actorData.takeHeal.multiplier.valueModifSum += modificator;
    actorData.takeHeal.multiplier.value =
      actorData.takeHeal.multiplier.native +
      actorData.takeHeal.multiplier.valueModifSum;
  }

  checkBadNutrition(actorData) {
    const food = actorData.nutrition.foodDay;
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

    let drink = actorData.nutrition.drinkDay;
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

  applyCombatStyle(actorData) {
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

  initModifValues(actorData) {
    actorData.hp.valueMaxModifSum = 0;
    actorData.mp.valueMaxModifSum = 0;
    actorData.ap.nativeModifSum = 0;
    actorData.ap.valueModifSum = 0;
    for (let [key, attribut] of Object.entries(actorData.attributes))
      attribut.valueModifSum = 0;
    actorData.attack.valueModifSum = 0;
    actorData.defence.valueModifSum = 0;
    actorData.dodge.valueModifSum = 0;
    actorData.damageBonus.valueModifSum = "";
    actorData.takeHeal.multiplier.valueModifSum = 0;
  }
}
