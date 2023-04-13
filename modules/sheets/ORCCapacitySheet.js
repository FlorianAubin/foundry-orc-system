import * as Item from "../commons/item.js";
export default class ORCCapacitySheet extends ItemSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      width: 600,
      height: 500,
      classes: ["orc", "sheet", "item", "capacity"],
    });
  }

  get template() {
    return `systems/orc/templates/sheets/capacity-sheet.hbs`;
  }

  /* -------------------------------------------- */
  /*  Override general functions                  */
  /* -------------------------------------------- */

  getData(options) {
    const data = super.getData(options);

    //If default img, change for sword
    if (data.item.img == "icons/svg/item-bag.svg")
      data.item.img =
        "icons/skills/trades/academics-astronomy-navigation-blue.webp";

    data.config = CONFIG.ORC;
    data.unlocked = this.item.getFlag(game.system.id, "SheetUnlocked");

    //Enrich the html to be able to link objects
    data.descriptionHTML = TextEditor.enrichHTML(data.item.system.description, {
      secrets: data.item.isOwner,
      async: false,
      relativeTo: this.item,
    });

    const parent = data.item.parent;
    if (parent) {
      data.attributes = parent.system.attributes;
      data.weapons = parent.items.filter(function (item) {
        return item.type == "weapon";
      });
    }

    //console.log(data);
    return data;
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find(".sheet-change-lock").click(Item._onSheetChangelock.bind(this));

    html
      .find(".description-deploy")
      .click(Item._onDescriptionDeploy.bind(this));
  }

  /* -------------------------------------------- */
}
