export const preloadHandlebarsTemplates = async function () {
  // Define template paths to load
  const templatePaths = [
    // Actor Sheet Partials
    "systems/orc/templates/actors/actor-header.html",
    "systems/orc/templates/actors/actor-left-column.html",
    "systems/orc/templates/actors/tabs/actor-shortcut.html",
    "systems/orc/templates/actors/tabs/actor-inventory.html",
    "systems/orc/templates/actors/tabs/actor-magic.html",
    "systems/orc/templates/actors/tabs/actor-capacity.html",
    "systems/orc/templates/actors/tabs/actor-biography.html",
  ];

  // Load the template parts
  return loadTemplates(templatePaths);
};
