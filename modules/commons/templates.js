export const preloadHandlebarsTemplates = async function () {
  // Define template paths to load
  const templatePaths = [
    // Actor Sheet Partials
    "systems/orc/templates/actors/tabs/actor-biography.html",
    "systems/orc/templates/actors/tabs/actor-inventory.html",

    "systems/orc/templates/chat/roll-result.html",
  ];

  // Load the template parts
  return loadTemplates(templatePaths);
};
