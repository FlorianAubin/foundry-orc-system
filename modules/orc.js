import { ORC } from "./commons/config.js";
import * as Macros from "./commons/macros.js";
import * as Chat from "./commons/chat.js";
import ORCAmmoSheet from "./sheets/ORCAmmoSheet.js";
import ORCWeaponSheet from "./sheets/ORCWeaponSheet.js";
import ORCCharacterSheet from "./sheets/ORCCharacterSheet.js";
import { preloadHandlebarsTemplates } from "./commons/templates.js";
import { RegisterHandlebars } from "./commons/handlebars.mjs";

//import ORCActiveEffect from "./effects/ORCActiveEffect.js";
//import ORCActiveEffectConfig from "./effects/ORCActiveEffectConfig.js";

Hooks.once("init", async function () {
  console.log("orc | Initialising the ORC system");

  CONFIG.ORC = ORC;

  game.orc = {
    macros: Macros,
  };

  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("character", ORCCharacterSheet, {
    types: ["character"],
    makeDefault: true,
  });

  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("weapon", ORCWeaponSheet, {
    types: ["weapon"],
    makeDefault: true,
  });
  Items.registerSheet("ammo", ORCAmmoSheet, {
    types: ["ammo"],
    makeDefault: true,
  });

  preloadHandlebarsTemplates();

  RegisterHandlebars();
});

Hooks.on("renderChatMessage", (app, html, data) => {
  Chat.highlightSuccessFailure(app, html, data);
});
