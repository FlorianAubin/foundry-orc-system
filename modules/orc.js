import { ORC } from "./commons/config.js";
import * as Macros from "./commons/macros.js";
import * as Chat from "./commons/chat.js";
import ORCItemSheet from "./sheets/ORCItemSheet.js";
import ORCCharacterSheet from "./sheets/ORCCharacterSheet.js";
import { preloadHandlebarsTemplates } from "./commons/templates.js";
//import ORCActiveEffect from "./effects/ORCActiveEffect.js";
//import ORCActiveEffectConfig from "./effects/ORCActiveEffectConfig.js";

Hooks.once("init", async function () {
  console.log("orc | Initialising the ORC system");

  CONFIG.ORC = ORC;

  game.orc = {
    macros: Macros,
  };

  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("orc", ORCCharacterSheet, { makeDefault: true });

  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("orc", ORCItemSheet, { makeDefault: true });

  preloadHandlebarsTemplates();
});

Hooks.on("renderChatMessage", (app, html, data) => {
  Chat.highlightSuccessFailure(app, html, data);
});
