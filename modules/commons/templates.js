export const preloadHandlebarsTemplates = async function () {
  // Define template paths to load
  const templatePaths = [
    // Actor Sheet Partials
    "systems/orc/templates/actors/actor-header.hbs",
    "systems/orc/templates/actors/actor-left-column.hbs",
    "systems/orc/templates/actors/tabs/actor-shortcut.hbs",
    "systems/orc/templates/actors/tabs/actor-inventory.hbs",
    "systems/orc/templates/actors/tabs/actor-magic.hbs",
    "systems/orc/templates/actors/tabs/actor-capacity.hbs",
    "systems/orc/templates/actors/tabs/actor-biography.hbs",

    "systems/orc/templates/sheets/enchant-sheet.hbs",
    "systems/orc/templates/sheets/consumable-activable-sheet.hbs",
  ];

  // Load the template parts
  return loadTemplates(templatePaths);
};
