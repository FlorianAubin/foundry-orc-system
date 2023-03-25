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
          initial: "biography", //initial default tab
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

    //console.log(data);
    return data;
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find(".sheet-change-lock").click(this._onSheetChangelock.bind(this));

    html.find(".item-edit").click(this._onItemEdit.bind(this));
    html.find(".item-delete").click(this._onItemDelete.bind(this));

    html.find(".attribute-roll").click(this._onAttributeRoll.bind(this));
    html.find(".damageBonus-roll").click(this._onBonusDamageRoll.bind(this));
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
  _onItemEdit(ev) {
    const li = $(ev.currentTarget).parents(".item");
    const item = this.actor.items.get(li.data("itemId"));
    item.sheet.render(true);
  }

  /**
   * Delete owned item
   */
  _onItemDelete(ev) {
    const li = $(ev.currentTarget).parents(".item");
    const item = this.actor.items.get(li.data("itemId"));
    item.delete();
  }

  /**
   *
   */
  async _onAttributeRoll(event) {
    Dice.AttributeRoll({
      actor: this.actor,
      attribute: event.currentTarget.dataset,
    });
  }

  async _onBonusDamageRoll(event) {
    Dice.BonusDamageRoll({
      actor: this.actor,
    });
  }
  /**
   * Calulated derived values
   */
  _prepareCharacterData(actorData) {
    this.applyCombatStyle(actorData);

    this.calculateEffectiveValues(actorData);
  }

  applyCombatStyle(actorData) {
    if (actorData.combatStyle === "standard") {
      actorData.attack.valueModif.style = 0;
      actorData.defence.valueModif.style = 0;
      actorData.dodge.valueModif.style = 0;
      actorData.dodge.enable = false;
      actorData.damageBonus.valueModif.style = "";
    } else if (actorData.combatStyle === "offensive") {
      actorData.attack.valueModif.style = +10;
      actorData.defence.valueModif.style = -10;
      actorData.dodge.valueModif.style = 0;
      actorData.dodge.enable = false;
      actorData.damageBonus.valueModif.style = "";
    } else if (actorData.combatStyle === "defensive") {
      actorData.attack.valueModif.style = -15;
      actorData.defence.valueModif.style = +10;
      actorData.dodge.valueModif.style = 0;
      actorData.dodge.enable = false;
      actorData.damageBonus.valueModif.style = "";
    } else if (actorData.combatStyle === "dodge") {
      actorData.attack.valueModif.style = -10;
      actorData.defence.valueModif.style = -10;
      actorData.dodge.valueModif.style = 0;
      actorData.dodge.enable = true;
      actorData.damageBonus.valueModif.style = "";
    } else if (actorData.combatStyle === "aggressive") {
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
    actorData.ap.valueModifSum = 0;
    actorData.attack.valueModifSum = 0;
    actorData.defence.valueModifSum = 0;
    actorData.dodge.valueModifSum = 0;
    actorData.damageBonus.valueModifSum = "";
  }

  calculateEffectiveValues(actorData) {
    this.initModifValues(actorData);

    //HP
    for (let [key, modificator] of Object.entries(actorData.hp.valueMaxModif)) {
      if (modificator) actorData.hp.valueMaxModifSum += modificator;
    }
    actorData.hp.valueMax =
      actorData.hp.valueMaxBase + actorData.hp.valueMaxModifSum;
    //MP
    for (let [key, modificator] of Object.entries(actorData.mp.valueMaxModif)) {
      if (modificator) actorData.mp.valueMaxModifSum += modificator;
    }
    actorData.mp.valueMax =
      actorData.mp.valueMaxBase + actorData.mp.valueMaxModifSum;
    //AP
    for (let [key, modificator] of Object.entries(actorData.ap.valueModif)) {
      if (modificator) actorData.ap.valueModifSum += modificator;
    }
    actorData.ap.value = actorData.ap.native + actorData.ap.valueModifSum;

    //Attributes
    for (let [key, attribut] of Object.entries(actorData.attributes)) {
      for (let [key, modificator] of Object.entries(attribut.valueModif)) {
        if (modificator) attribut.valueModifSum += modificator;
      }
      attribut.value = attribut.valueBase + attribut.valueModifSum;
    }

    //Attack
    actorData.attack.native = actorData.attributes.physical.value;
    for (let [key, modificator] of Object.entries(
      actorData.attack.valueModif
    )) {
      if (modificator) actorData.attack.valueModifSum += modificator;
    }
    actorData.attack.value =
      actorData.attack.native + actorData.attack.valueModifSum;
    //Defence
    for (let [key, modificator] of Object.entries(
      actorData.defence.valueModif
    )) {
      if (modificator) actorData.defence.valueModifSum += modificator;
    }
    actorData.defence.value =
      actorData.defence.native + actorData.defence.valueModifSum;
    //Dodge
    actorData.dodge.native = actorData.attributes.physical.value - 20;
    for (let [key, modificator] of Object.entries(actorData.dodge.valueModif)) {
      if (modificator) actorData.dodge.valueModifSum += modificator;
    }
    actorData.dodge.value =
      actorData.dodge.native + actorData.dodge.valueModifSum;
    //Damage bonus
    for (let [key, modificator] of Object.entries(
      actorData.damageBonus.valueModif
    )) {
      if (modificator) {
        if (!actorData.damageBonus.valueModifSum)
          actorData.damageBonus.valueModifSum += modificator;
        else {
          actorData.damageBonus.valueModifSum += " + " + modificator;
        }
      }
    }
    actorData.damageBonus.value =
      actorData.damageBonus.native + actorData.damageBonus.valueModifSum;
  }
}
