export function AttributeRoll({
  actor = null,
  attribute = null,
  extraMessageData = {},
} = {}) {
  let rollFormula = "1d100";
  let rollData = {}; //for some reasons, rollData are not conserved on ChatMessage, use rollOptions instead
  let rollOptions = {
    attributeName: attribute.attributename,
    attributeValue: attribute.attributevalue,
    actorName: actor.name,
    actorLimitCritical: actor.system.roll.limitCritical,
    actorLimitFumble: actor.system.roll.limitFumble,
    visibleByPlayers: actor.ownership.default,
  };

  let roll = new Roll(rollFormula, rollData, rollOptions);
  let rollResult = roll.roll({ async: false });

  extraMessageData.title = game.i18n.format("orc.dialog.attribute.title", {
    charName: actor.name,
    attributeName: attribute.attributename,
  });
  extraMessageData.attributeValue = {
    base: attribute.attributevaluebase,
    modif: attribute.attributevaluemodif,
    value: attribute.attributevalue,
    diff: attribute.attributevalue - rollResult.total,
  };

  //Display a limited message if the player is not allowed to see the form
  if (rollOptions.visibleByPlayers == 0) {
    AttributeRollToCustomLimitedMessage(rollResult, {
      ...extraMessageData,
    });
  }
  AttributeRollToCustomFullMessage(rollResult, {
    ...extraMessageData,
  });
}

export async function AttributeRollToCustomFullMessage(rollResult, extraData) {
  const template = "systems/orc/templates/chat/roll-attribute-full-result.html";

  let templateContext = {
    ...extraData,
    roll: rollResult,
    tooltip: await rollResult.getTooltip(),
  };

  let chatData = {
    user: game.user._id,
    speaker: ChatMessage.getSpeaker(),
    roll: rollResult,
    sound: CONFIG.sounds.dice,
    content: await renderTemplate(template, templateContext),
    type: CONST.CHAT_MESSAGE_TYPES.ROLL,
  };
  //only visible to the GM and GM assistants
  if (rollResult.options.visibleByPlayers == 0) {
    chatData.blind = true;
    chatData.whisper = game.users.filter(function (user) {
      return user.role > 2;
    });
    chatData.type = CONST.CHAT_MESSAGE_TYPES.BLIND;
  }

  await ChatMessage.create(chatData);
}

export async function AttributeRollToCustomLimitedMessage(
  rollResult,
  extraData
) {
  const template =
    "systems/orc/templates/chat/roll-attribute-limited-result.html";

  let templateContext = {
    ...extraData,
    roll: rollResult,
    tooltip: await rollResult.getTooltip(),
  };

  let chatData = {
    user: game.user._id,
    speaker: ChatMessage.getSpeaker(),
    roll: rollResult,
    content: await renderTemplate(template, templateContext),
    type: CONST.CHAT_MESSAGE_TYPES.ROLL,
  };

  await ChatMessage.create(chatData);
}
