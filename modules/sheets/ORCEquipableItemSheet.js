import * as EnchantOrc from "../commons/enchant.js";
import * as ItemOrc from "../commons/item.js";
export default class ORCEquipableItemSheet extends ItemSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      width: 600,
      height: 500,
      classes: ["orc", "sheet", "item", "equipableitem"],
    });
  }

  get template() {
    return `systems/orc/templates/sheets/equipableitem-sheet.hbs`;
  }

  /* -------------------------------------------- */
  /*  Override general functions                  */
  /* -------------------------------------------- */

  getData(options) {
    const data = super.getData(options);

    //If default img, change for sword
    if (data.item.img == "icons/svg/item-bag.svg")
      data.item.img = "icons/equipment/finger/ring-band-copper.webp";

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

    html.find(".enchant-deploy").click(EnchantOrc.onEnchantDeploy.bind(this));
    html.find(".enchant-roll").click(EnchantOrc.onEnchantRoll.bind(this));
    html.find(".enchant-set-use").change(EnchantOrc.onEnchantSetUse.bind(this));

    html
      .find(".description-deploy")
      .click(ItemOrc.onDescriptionDeploy.bind(this));
  }
}
