import { ORC } from "../commons/config.js";

export default class ActiveEffectConfig4e extends ActiveEffectConfig {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["sheet", "active-effect-sheet"],
      template: "systems/orc/templates/sheets/active-effect-config.html",
      width: 560,
      height: "auto",
    });
  }

  /** @override */
  getData(options) {
    let data = super.getData(options);

    data.config = CONFIG.ORC;

    return data;
  }
}
