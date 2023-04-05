export default class ORCItemSheet extends ItemSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      width: 530,
      height: 354,
      classes: ["orc", "sheet", "item"],
    });
  }

  get template() {
    return `systems/orc/templates/sheets/armor-sheet.hbs`;
  }

  /* -------------------------------------------- */
  /*  Override general functions                  */
  /* -------------------------------------------- */

  getData(options) {
    const data = super.getData(options);

    //If default img, change for sword
    if (data.item.img == "icons/svg/item-bag.svg")
      data.item.img =
        "icons/equipment/chest/breastplate-cuirass-steel-grey.webp";

    data.config = CONFIG.ORC;
    data.unlocked = this.item.getFlag(game.system.id, "SheetUnlocked");

    //Enrich the html to be able to link objects
    data.descriptionHTML = TextEditor.enrichHTML(data.item.system.description, {
      secrets: data.item.isOwner,
      async: false,
      relativeTo: this.item,
    });

    //console.log(data);
    return data;
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find(".sheet-change-lock").click(this._onSheetChangelock.bind(this));
  }

  /* -------------------------------------------- */

  /* -------------------------------------------- */
  /*  Manage the lock/unlock button on the sheet  */
  /* -------------------------------------------- */

  async _onSheetChangelock(event) {
    event.preventDefault();

    let flagData = await this.item.getFlag(game.system.id, "SheetUnlocked");
    flagData
      ? await this.item.unsetFlag(game.system.id, "SheetUnlocked")
      : await this.item.setFlag(
          game.system.id,
          "SheetUnlocked",
          "SheetUnlocked"
        );

    this.item.sheet.render(true);
  }

  /* -------------------------------------------- */
}
