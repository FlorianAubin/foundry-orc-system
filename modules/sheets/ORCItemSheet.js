export default class ORCItemSheet extends ItemSheet {
  get template() {
    return `systems/orc/templates/sheets/${this.item.type}-sheet.html`;
  }

  getData(options) {
    const data = super.getData(options);

    data.config = CONFIG.ORC;

    //console.log(data);
    return data;
  }
}
