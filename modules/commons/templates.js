export const preloadHandlebarsTemplates = async function () {
  // Define template paths to load
  const templatePaths = [
    // Actor Sheet Partials
    "systems/orc/templates/character/character-header.hbs",
    "systems/orc/templates/character/character-left-column.hbs",
    "systems/orc/templates/character/tabs/character-shortcut.hbs",
    "systems/orc/templates/character/tabs/character-inventory.hbs",
    "systems/orc/templates/character/tabs/character-magic.hbs",
    "systems/orc/templates/character/tabs/character-capacity.hbs",
    "systems/orc/templates/character/tabs/character-active.hbs",
    "systems/orc/templates/character/tabs/character-biography.hbs",

    "systems/orc/templates/sheets/enchant-sheet.hbs",
    "systems/orc/templates/sheets/consumable-activable-sheet.hbs",

    "systems/orc/templates/description.hbs",
  ];

  // Load the template parts
  return loadTemplates(templatePaths);
};
