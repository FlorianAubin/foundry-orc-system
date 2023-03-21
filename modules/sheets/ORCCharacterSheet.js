export default class ORCCharacterSheet extends ActorSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      template: "systems/orc/templates/sheet/character-sheet.html",
      classes: ["orc", "sheet", "actor"],
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

    html.find(".rollable").click(this._onRoll.bind(this));
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
  _onRoll(event) {}

  /**
   * Calulated derived values
   */
  _prepareCharacterData(actorData) {
    actorData.hp.valueMax = actorData.hp.valueMaxBase + 10;
    actorData.mp.valueMax = actorData.mp.valueMaxBase;
  }
}
