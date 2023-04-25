import * as ItemOrc from "../commons/item.js";

export default class ORCSpellSheet extends ItemSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      width: 600,
      height: 500,
      classes: ["orc", "sheet", "item", "spell"],
    });
  }

  get template() {
    return `systems/orc/templates/sheets/spell-sheet.hbs`;
  }

  /* -------------------------------------------- */
  /*  Override general functions                  */
  /* -------------------------------------------- */

  getData(options) {
    const data = super.getData(options);

    //If default img, change for sword
    if (data.item.img == "icons/svg/item-bag.svg")
      data.item.img = "icons/magic/unholy/energy-smoke-pink.webp";

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

    html.find(".sheet-change-lock").click(ItemOrc.onSheetChangelock.bind(this));
    html
      .find(".description-deploy")
      .click(ItemOrc.onDescriptionDeploy.bind(this));
  }

  /* -------------------------------------------- */
}
