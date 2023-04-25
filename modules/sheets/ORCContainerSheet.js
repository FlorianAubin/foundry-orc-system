import * as ItemOrc from "../commons/item.js";
import * as ActorOrc from "../commons/actor.js";

export default class ORCContainerSheet extends ActorSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      template: "systems/orc/templates/sheet/container-sheet.hbs",
      classes: ["orc", "sheet", "actor", "container"],
      tabs: [
        {
          navSelector: ".sheet-tabs",
          contentSelector: ".sheet-body",
          initial: "shortcut", //default tab
        },
      ],
    });
  }

  get template() {
    return `systems/orc/templates/sheets/container-sheet.hbs`;
  }

  getData(options) {
    const data = super.getData(options);

    //If default img, change for sword
    if (data.actor.img == "icons/svg/mystery-man.svg")
      data.actor.img = "icons/containers/chest/chest-elm-steel-brown.webp";

    data.config = CONFIG.ORC;

    //Enrich the html to be able to link objects
    data.biographyHTML = TextEditor.enrichHTML(data.actor.system.biography, {
      secrets: this.actor.isOwner,
      async: false,
      relativeTo: this.actor,
    });

    data.unlocked = this.actor.getFlag(game.system.id, "SheetUnlocked");

    this._prepareContainerData(data);

    //console.log(data);
    return data;
  }

  activateListeners(html) {
    html
      .find(".sheet-change-lock")
      .click(ActorOrc.onSheetChangelock.bind(this));

    //html.find(".item-create").click(this._onItemCreate.bind(this));
    html.find(".item-edit").click(ItemOrc.onItemEdit.bind(this));
    html.find(".item-delete").click(ItemOrc.onItemDelete.bind(this));
    html.find(".item-split").click(ItemOrc.onItemSplit.bind(this));

    html.find(".update-stock").change(ItemOrc.onUpdateStock.bind(this));

    super.activateListeners(html);
  }

  /**
   * Calulated the actor derived values
   */
  _prepareContainerData(data) {
    //Delete items with 0 stock
    ActorOrc.removeItemsWithoutStock(data);

    this.calculateUsedCapacity(data);
  }

  async _onDropItem(event, data) {
    return ActorOrc.onDropItem(event, data, this);
  }

  calculateUsedCapacity(data) {
    const actor = data.actor;
    const actorData = actor.system;
    const items = data.items;

    let capacityUsed = 0;
    for (let [key, item] of Object.entries(items)) {
      let itemData = item.system;
      if (itemData.weight) {
        capacityUsed +=
          itemData.weight.total != null
            ? itemData.weight.total
            : itemData.weight;
      }
    }

    actor.update({ system: { capacityUsed: capacityUsed } });
  }
}
