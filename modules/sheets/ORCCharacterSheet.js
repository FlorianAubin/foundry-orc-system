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

  /** @override **/

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
  }

  prepareData() {
    super.prepareData();
  }

  /*********/

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

  /**
   * Calulated derived values
   */
  _prepareCharacterData(actorData) {
    actorData.hp.valueMax =
      actorData.hp.valueMaxBase + actorData.hp.valueMaxModif;
    actorData.mp.valueMax =
      actorData.mp.valueMaxBase + actorData.mp.valueMaxModif;
    actorData.ap.value = actorData.ap.native + actorData.ap.valueModif;

    for (let [key, attribut] of Object.entries(actorData.attributes)) {
      attribut.value = attribut.valueBase + attribut.valueModif;
    }
  }
}
