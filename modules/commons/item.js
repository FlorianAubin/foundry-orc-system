export async function _onSheetChangelock(event) {
  event.preventDefault();

  let item = this.item;
  if (item == null) return;

  let flagData = await item.getFlag(game.system.id, "SheetUnlocked");
  flagData
    ? await item.unsetFlag(game.system.id, "SheetUnlocked")
    : await item.setFlag(game.system.id, "SheetUnlocked", "SheetUnlocked");

  item.sheet.render(true);
}

export function updateTotalWeight(data) {
  let item = data.item;
  if (item == null) return;

  const itemData = item.system;
  const stock = itemData.stock;
  const indivWeight = itemData.weight.indiv;
  if (stock == null || indivWeight == null) return;

  item.update({
    system: {
      weight: { total: Math.floor(100 * indivWeight * stock) / 100 },
    },
  });

  return;
}

export function _onDescriptionDeploy(event) {
  event.preventDefault();

  let item = this.item;
  if (item == null) return;

  item.update({
    system: {
      optionDescriptionDeploy: !item.system.optionDescriptionDeploy,
    },
  });

  return;
}
