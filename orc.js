import { ORC } from "./modules/config.js";
import ORCItemSheet from "./modules/sheets/ORCItemSheet.js";

Hooks.once("init", function () {
  console.log("orc | Initialising the ORC system");

  CONFIG.ORC = ORC;

  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("orc", ORCItemSheet, { makeDefault: true });
});
