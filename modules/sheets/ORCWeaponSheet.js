import * as Dice from "../commons/dice.js";
import * as Enchant from "../commons/enchant.js";

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

    html.find(".sheet-change-lock").click(this._onSheetChangelock.bind(this));

    html.find(".damage-roll").click(this._onDamageRoll.bind(this));

    html.find(".enchant-deploy").click(Enchant._onEnchantDeploy.bind(this));
    html.find(".enchant-roll").click(Enchant._onEnchantRoll.bind(this));
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

  async _onDamageRoll(event) {
    Dice.DamageRoll({ weapon: this.item });
  }
}
