export default class ORCFoodSheet extends ItemSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      width: 600,
      height: 500,
      classes: ["orc", "sheet", "item", "food"],
    });
  }

  get template() {
    return `systems/orc/templates/sheets/food-sheet.hbs`;
  }

  /* -------------------------------------------- */
  /*  Override general functions                  */
  /* -------------------------------------------- */

  getData(options) {
    const data = super.getData(options);

    //If default img, change for sword
    if (data.item.img == "icons/svg/item-bag.svg")
      data.item.img =
        "icons/consumables/food/bowl-ribs-meat-rice-mash-brown-white.webp";

    data.config = CONFIG.ORC;
    data.unlocked = this.item.getFlag(game.system.id, "SheetUnlocked");

    //Enrich the html to be able to link objects
    data.descriptionHTML = TextEditor.enrichHTML(data.item.system.description, {
      secrets: data.item.isOwner,
      async: false,
      relativeTo: this.item,
    });

    this.updateTotalWeight(data);

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

  updateTotalWeight(data) {
    const item = data.item;
    const itemData = item.system;

    const stock = itemData.stock;
    const indivWeight = itemData.weight.indiv;

    item.update({
      system: {
        weight: { total: Math.floor(100 * indivWeight * stock) / 100 },
      },
    });
  }
}
