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
