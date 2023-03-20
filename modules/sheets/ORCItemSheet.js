export default class ORCItemSheet extends ItemSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      width: 530,
      height: 354,
      classes: ["orc", "sheet", "item"],
    });
  }

  get template() {
    return `systems/orc/templates/sheets/${this.item.type}-sheet.html`;
  }

  getData() {
    const data = super.getData();

    data.config = CONFIG.ORC;

    console.log(data);
    return data;
  }
}
