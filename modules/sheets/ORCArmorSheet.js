import * as Enchant from "../commons/enchant.js";
import * as Item from "../commons/item.js";
export default class ORCArmorSheet extends ItemSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      width: 600,
      height: 500,
      classes: ["orc", "sheet", "item", "armor"],
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

    html.find(".sheet-change-lock").click(Item._onSheetChangelock.bind(this));

    html.find(".enchant-deploy").click(Enchant._onEnchantDeploy.bind(this));
    html.find(".enchant-roll").click(Enchant._onEnchantRoll.bind(this));

    html
      .find(".description-deploy")
      .click(Item._onDescriptionDeploy.bind(this));
  }
}
