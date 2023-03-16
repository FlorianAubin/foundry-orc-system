export default class ORCItemSheet extends ItemSheet {
  get template() {
    return `systems/orc/templates/sheets/${this.item.type}-sheet.html`;
  }

  getData() {
    const data = super.getData();

    data.config = CONFIG.orc;

    return data;
  }
}
