export async function AttributeRollToCustomFullMessage(rollResult, extraData) {
  const template = "systems/orc/templates/chat/roll-attribute-full-result.hbs";

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
    "systems/orc/templates/chat/roll-attribute-limited-result.hbs";

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

export const highlightSuccessFailure = function (message, html, data) {
  if (!message.isContentVisible) {
    return;
  }

  const attributeRoll = html.find(".orc.attribute-roll");
  if (!attributeRoll) {
    return;
  }

  let i = 0;

  for (const roll of message.rolls) {
    if (!roll.dice.length) continue;
    const d = roll.dice[0];

    // Ensure it is an un-modified d100 roll
    const isD100 = d.faces === 100 && d.values.length === 1;
    if (!isD100) return;

    // Highlight positive and negative excess
    const excess = roll.options.attributeValue - d.total;
    const excessHtml = html.find(`.dice-excess`)[i];
    if (excessHtml) {
      if (excess >= 0) {
        excessHtml.classList.add("positive");
      } else {
        excessHtml.classList.add("negative");
      }
    }

    // Highlight successes and failures
    const critical = roll.options.actorLimitCritical;
    const fumble = roll.options.actorLimitFumble;
    const totalHtml = html.find(`.dice-total`)[i];
    if (totalHtml) {
      if (d.total <= critical) {
        totalHtml.classList.add("critical");
      } else if (d.total >= fumble) {
         totalHtml.classList.add("fumble");
      }
    }
    i++;
  }
};

export async function StatusRollToCustomMessage(rollResult, extraData) {
  const template = "systems/orc/templates/chat/roll-status-result.hbs";

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

export async function DamageRollToCustomFullMessage(rollResult, extraData) {
  const template = "systems/orc/templates/chat/roll-damage-full-result.hbs";

  let templateContext = {
    ...extraData,
    roll: rollResult,
    tooltip: rollResult ? await rollResult.getTooltip() : null,
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


export async function DamageRollToCustomLimitedMessage(rollResult, extraData) {
  const template = "systems/orc/templates/chat/roll-damage-limited-result.hbs";

  let templateContext = {
    ...extraData,
    roll: rollResult,
    tooltip: rollResult ? await rollResult.getTooltip() : null,
  };

  let chatData = {
    user: game.user._id,
    speaker: ChatMessage.getSpeaker(),
    roll: rollResult,
    sound: CONFIG.sounds.dice,
    content: await renderTemplate(template, templateContext),
    type: CONST.CHAT_MESSAGE_TYPES.ROLL,
  };

  await ChatMessage.create(chatData);
}

export async function SpellRollToCustomFullMessage(
  rollResults = { costRoll: null, powerRoll: null, durationRoll: null },
  spellTypes = {base: null, shape: null, power: null, modif: null},
  extraData
) {
  const template = "systems/orc/templates/chat/roll-spell-full-result.hbs";

  let templateContext = {
    ...extraData,
    spellTypes: spellTypes,
    costRoll: rollResults.costRoll,
    powerRoll: rollResults.powerRoll,
    durationRoll: rollResults.durationRoll,
    costTooltip: rollResults.costRoll
      ? await rollResults.costRoll.getTooltip()
      : null,
    powerTooltip: rollResults.powerRoll
      ? await rollResults.powerRoll.getTooltip()
      : null,
    durationTooltip: rollResults.durationRoll
      ? await rollResults.durationRoll.getTooltip()
      : null,
  };

  let chatData = {
    user: game.user._id,
    speaker: ChatMessage.getSpeaker(),
    sound: CONFIG.sounds.dice,
    content: await renderTemplate(template, templateContext),
    type: CONST.CHAT_MESSAGE_TYPES.ROLL,
  };
  //only visible to the GM and GM assistants
  let visibleByPlayers = 1;
  if (rollResults.costRoll != null)
    visibleByPlayers = rollResults.costRoll.options.visibleByPlayers;
  else if (rollResults.powerRoll != null)
    visibleByPlayers = rollResults.powerRoll.options.visibleByPlayers;
  else if (rollResults.durationRoll != null)
    visibleByPlayers = rollResults.durationRoll.options.visibleByPlayers;
  if(visibleByPlayers == 0) {
    chatData.blind = true;
    chatData.whisper = game.users.filter(function (user) {
      return user.role > 2;
    });
    chatData.type = CONST.CHAT_MESSAGE_TYPES.BLIND;
  }

  await ChatMessage.create(chatData);
}

export async function SpellRollToCustomLimitedMessage(
  rollResults = { costRoll: null, powerRoll: null, durationRoll: null },
  extraData
) {
  const template = "systems/orc/templates/chat/roll-spell-limited-result.hbs";

  let templateContext = {
    ...extraData,
    costRoll: rollResults.costRoll,
    powerRoll: rollResults.powerRoll,
    durationRoll: rollResults.durationRoll,
    costTooltip: rollResults.costRoll
      ? await rollResults.costRoll.getTooltip()
      : null,
    powerTooltip: rollResults.powerRoll
      ? await rollResults.powerRoll.getTooltip()
      : null,
    durationTooltip: rollResults.durationRoll
      ? await rollResults.durationRoll.getTooltip()
      : null,
  };

  let chatData = {
    user: game.user._id,
    speaker: ChatMessage.getSpeaker(),
    sound: CONFIG.sounds.dice,
    content: await renderTemplate(template, templateContext),
    type: CONST.CHAT_MESSAGE_TYPES.ROLL,
  };

  await ChatMessage.create(chatData);
}

export async function EnchantRollToCustomMessage(rollResult, extraData) {
  const template = "systems/orc/templates/chat/roll-enchant-result.hbs";

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

export async function RollToSimpleCustomMessage({ roll = null }) {
  let chatData = {
    user: game.user._id,
    speaker: ChatMessage.getSpeaker(),
    roll: roll,
    sound: CONFIG.sounds.dice,
    type: CONST.CHAT_MESSAGE_TYPES.ROLL,
  };
  await ChatMessage.create(chatData);
}
