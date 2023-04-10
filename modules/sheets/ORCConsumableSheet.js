import * as Item from "../commons/item.js";
export default class ORCConsumableSheet extends ItemSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      width: 600,
      height: 500,
      classes: ["orc", "sheet", "item", "consumable"],
    });
  }

  get template() {
    return `systems/orc/templates/sheets/consumable-sheet.hbs`;
  }

  /* -------------------------------------------- */
  /*  Override general functions                  */
  /* -------------------------------------------- */

  getData(options) {
    const data = super.getData(options);

    //If default img, change for sword
    if (data.item.img == "icons/svg/item-bag.svg")
      data.item.img = "icons/consumables/potions/bottle-pear-corked-blue.webp";

    data.config = CONFIG.ORC;
    data.unlocked = this.item.getFlag(game.system.id, "SheetUnlocked");

    //Enrich the html to be able to link objects
    data.descriptionHTML = TextEditor.enrichHTML(data.item.system.description, {
      secrets: data.item.isOwner,
      async: false,
      relativeTo: this.item,
    });

    Item.updateTotalWeight(data);

    //console.log(data);
    return data;
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find(".sheet-change-lock").click(Item._onSheetChangelock.bind(this));
    html
      .find(".consumable-activable-deploy")
      .click(this._onConsumableDeploy.bind(this));

    html
      .find(".description-deploy")
      .click(Item._onDescriptionDeploy.bind(this));
  }

  /* -------------------------------------------- */
  async _onConsumableDeploy(event) {
    event.preventDefault();

    let item = this.item;
    if (item == null) return;
    let itemData = item.system;
    //Does nothing if the item is not tagged as activable
    if (!itemData.isActivable) return;

    await item.update({
      system: {
        ifActivable: { optionDeploy: !itemData.ifActivable.optionDeploy },
      },
    });

    return;
  }
}
