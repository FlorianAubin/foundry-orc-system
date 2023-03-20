import { ORC } from "./config.js";
import ORCItemSheet from "./sheets/ORCItemSheet.js";
import ORCCharacterSheet from "./sheets/ORCCharacterSheet.js";

Hooks.once("init", async function () {
  console.log("orc | Initialising the ORC system");

  CONFIG.ORC = ORC;

  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("orc", ORCItemSheet, { makeDefault: true });

  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("orc", ORCCharacterSheet, { makeDefault: true });
});
