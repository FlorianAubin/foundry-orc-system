export async function AttributeRollToCustomFullMessage(rollResult, extraData) {
  const template = "systems/orc/templates/chat/roll-attribute-full-result.hbs";
  rollResult = await rollResult;

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
  rollResult = await rollResult;

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
  rollResult = await rollResult;

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


export async function DamageRollToCustomFullMessage(
  rollResult,
  extraData = {}
) {
  const template =
    "systems/orc/templates/chat/roll-damage-full-result.hbs";

  rollResult = await rollResult;

  const templateContext = {
    ...extraData,
    roll: rollResult,
    tooltip: rollResult
      ? await rollResult.getTooltip()
      : null,
  };

  const chatData = {
    user: game.user.id,
    speaker: ChatMessage.getSpeaker(),
    roll: rollResult,
    sound: CONFIG.sounds.dice,
    content: await renderTemplate(template, templateContext),
    type: CONST.CHAT_MESSAGE_TYPES.ROLL,
  };

  // Message visible uniquement par le MJ et les assistants MJ
  if (rollResult?.options?.visibleByPlayers == 0) {
    chatData.blind = true;
    chatData.whisper = game.users
      .filter(user => user.role > 2)
      .map(user => user.id);

    chatData.type = CONST.CHAT_MESSAGE_TYPES.BLIND;
  }

  await ChatMessage.create(chatData);
}


export async function DamageRollToCustomLimitedMessage(rollResult, extraData) {
  const template = "systems/orc/templates/chat/roll-damage-limited-result.hbs";
  rollResult = await rollResult;

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
  rollResults = { costroll: null, powerroll: null, durationroll: null },
  spellTypes = {base: null, shape: null, power: null, modif: null},
  extraData
) {
  const template = "systems/orc/templates/chat/roll-spell-full-result.hbs";
  console.log(rollResults)
  console.log(rollResults.costroll)


  let templateContext = {
    ...extraData,
    spellTypes: spellTypes,
    costRoll: rollResults.costroll,
    powerRoll: rollResults.powerroll,
    durationRoll: rollResults.durationroll,
    costTooltip: rollResults.costroll
      ? await rollResults.costroll.getTooltip()
      : null,
    powerTooltip: rollResults.powerroll
      ? await rollResults.powerroll.getTooltip()
      : null,
    durationTooltip: rollResults.durationroll
      ? await rollResults.durationroll.getTooltip()
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
  if (rollResults.costroll != null)
    visibleByPlayers = rollResults.costroll.options.visibleByPlayers;
  else if (rollResults.powerroll != null)
    visibleByPlayers = rollResults.powerroll.options.visibleByPlayers;
  else if (rollResults.durationroll != null)
    visibleByPlayers = rollResults.durationroll.options.visibleByPlayers;
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
  rollResults = { costroll: null, powerroll: null, durationroll: null },
  extraData
) {
  const template = "systems/orc/templates/chat/roll-spell-limited-result.hbs";
  rollResult = await rollResult;

  let templateContext = {
    ...extraData,
    costRoll: rollResults.costroll,
    powerRoll: rollResults.powerroll,
    durationRoll: rollResults.durationroll,
    costTooltip: rollResults.costroll
      ? await rollResults.costroll.getTooltip()
      : null,
    powerTooltip: rollResults.powerroll
      ? await rollResults.powerroll.getTooltip()
      : null,
    durationTooltip: rollResults.durationroll
      ? await rollResults.durationroll.getTooltip()
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
  const template = "systems/orc/templates/chat/enchant-roll.hbs"
  rollResult = await rollResult;

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

export async function RollToSimpleCustomMessage({ roll = null }, extraData = null) {
  const template = "systems/orc/templates/chat/std.hbs"

  let templateContext = {
    ...extraData,
    roll: roll,
    tooltip: await roll.getTooltip(),
  };


  console.log(roll)
  let chatData = {
    user: game.user._id,
    speaker: ChatMessage.getSpeaker(),
    roll: roll,
    sound: CONFIG.sounds.dice,
    content: await renderTemplate(template, templateContext),
    type: CONST.CHAT_MESSAGE_TYPES.ROLL,
  };
  //only visible to the GM and GM assistants
  if (roll.options.visibleByPlayers == 0) {
    chatData.blind = true;
    chatData.whisper = game.users.filter(function (user) {
      return user.role > 2;
    });
    chatData.type = CONST.CHAT_MESSAGE_TYPES.BLIND;
  }
  await ChatMessage.create(chatData);
}


export async function createNewDayCustomMessage(report) {
  const content = await renderTemplate(
    "systems/orc/templates/chat/new_day.hbs",
    report
  );

  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor: this.actor }),
    content,
    style: CONST.CHAT_MESSAGE_STYLES.OTHER,
  });
}


export async function createConsumeCustomMessage(data) {
  const content = await renderTemplate(
    "systems/orc/templates/chat/consume.hbs",
    data
  );

  return ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor: data.actor }),
    content,
    style: CONST.CHAT_MESSAGE_STYLES.OTHER,
  });
}


export async function createDeactivateCustomMessage({
  actor,
  itemName,
  itemType,
  duration = null,
  effects = [],
}) {
  const content = await renderTemplate(
    "systems/orc/templates/chat/deactivate.hbs",
    {
      actor,
      actorName: actor.name,
      itemName,
      itemType,
      duration,
      effects,
    }
  );

  return ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content,
    style: CONST.CHAT_MESSAGE_STYLES.OTHER,
  });
}

export async function createReduceDurationMessage({
  actor,
  itemName,
  itemType,
  durationBefore,
  durationAfter,
  durationUnit,
  deactivated = false,
}) {
  const content = await renderTemplate(
    "systems/orc/templates/chat/reduce-duration.hbs",
    {
      actorName: actor.name,
      itemName,
      itemType,
      durationBefore,
      durationAfter,
      durationUnit,
      deactivated,
    }
  );

  return ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content,
    style: CONST.CHAT_MESSAGE_STYLES.OTHER,
  });
}

export async function createActivateCapacityMessage(data) {
  const content = await renderTemplate(
    "systems/orc/templates/chat/capacity-activate.hbs",
    data
  );

  return ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor: data.actor }),
    content,
    style: CONST.CHAT_MESSAGE_STYLES.OTHER,
  });
}

export async function  createEnchantActivateMessage  (data) {
  const content = await renderTemplate(
    "systems/orc/templates/chat/enchant-activate.hbs",
    data
  );

  return ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor: data.actor }),
    content,
    style: CONST.CHAT_MESSAGE_STYLES.OTHER,
  });
};