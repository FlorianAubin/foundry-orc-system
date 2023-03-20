export default class ORCCharacterSheet extends ActorSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      template: "systems/orc/templates/sheet/character-sheet.html",
      classes: ["orc", "sheet", "actor"],
    });
  }

  get template() {
    return `systems/orc/templates/sheets/${this.actor.type}-sheet.html`;
  }

  getData() {
    const data = super.getData();

    data.config = CONFIG.ORC;
    data.weapons = data.items.filter(function (item) {
      return item.type == "weapon";
    });

    //console.log(data);
    return data;
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find(".item-edit").click(this._onItemEdit.bind(this));
    html.find(".item-delete").click(this._onItemDelete.bind(this));
  }

  _onItemEdit(ev) {
    const li = $(ev.currentTarget).parents(".item");
    const item = this.actor.items.get(li.data("itemId"));
    item.sheet.render(true);
  }

  _onItemDelete(ev) {
    const li = $(ev.currentTarget).parents(".item");
    const item = this.actor.items.get(li.data("itemId"));
    item.delete();
  }
}
