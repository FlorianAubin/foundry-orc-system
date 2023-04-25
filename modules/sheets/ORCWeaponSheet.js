import * as DiceOrc from "../commons/dice.js";
import * as EnchantOrc from "../commons/enchant.js";
import * as ItemOrc from "../commons/item.js";

export default class ORCWeaponSheet extends ItemSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      width: 600,
      height: 500,
      classes: ["orc", "sheet", "item", "weapon"],
    });
  }

  get template() {
    return `systems/orc/templates/sheets/weapon-sheet.hbs`;
  }

  /* -------------------------------------------- */
  /*  Override general functions                  */
  /* -------------------------------------------- */

  getData(options) {
    const data = super.getData(options);

    //If default img, change for sword
    if (data.item.img == "icons/svg/item-bag.svg")
      data.item.img = "icons/weapons/swords/greatsword-crossguard-steel.webp";

    data.config = CONFIG.ORC;
    data.unlocked = this.item.getFlag(game.system.id, "SheetUnlocked");

    //Recover the list of ammo of the owner
    const parent = data.item.parent;
    if (parent) {
      data.ammos = parent.items.filter(function (item) {
        return item.type == "ammo";
      });
    }

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

    html.find(".damage-roll").click(this._onDamageRoll.bind(this));

    html.find(".enchant-deploy").click(EnchantOrc.onEnchantDeploy.bind(this));
    html.find(".enchant-roll").click(EnchantOrc.onEnchantRoll.bind(this));
    html.find(".enchant-set-use").change(EnchantOrc.onEnchantSetUse.bind(this));

    html
      .find(".description-deploy")
      .click(ItemOrc.onDescriptionDeploy.bind(this));
  }

  /* -------------------------------------------- */

  /* -------------------------------------------- */

  async _onDamageRoll(event) {
    DiceOrc.DamageRoll({ weapon: this.item });
  }
}
