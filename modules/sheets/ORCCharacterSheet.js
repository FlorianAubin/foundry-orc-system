import * as DiceOrc from "../commons/dice.js";
import * as ChatOrc from "../commons/chat.js";
import * as EnchantOrc from "../commons/enchant.js";
import * as ItemOrc from "../commons/item.js";
import * as ActorOrc from "../commons/actor.js";

export default class ORCCharacterSheet extends ActorSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      template: "systems/orc/templates/sheet/character-sheet.hbs",
      classes: ["orc", "sheet", "actor", "character"],
      tabs: [
        {
          navSelector: ".sheet-tabs",
          contentSelector: ".sheet-body",
          initial: "shortcut", //default tab
        },
      ],
    });
  }

  get template() {
    return `systems/orc/templates/sheets/character-sheet.hbs`;
  }

  getData(options = {}) {
    const data = super.getData(options);

    data.config = CONFIG.ORC;

    //Recover the onwed items
    data.weapons = data.items.filter(function (item) {
      return item.type == "weapon";
    });
    data.ammos = data.items.filter(function (item) {
      return item.type == "ammo";
    });
    data.armors = data.items.filter(function (item) {
      return item.type == "armor";
    });
    data.equipableitems = data.items.filter(function (item) {
      return item.type == "equipableitem";
    });
    data.foods = data.items.filter(function (item) {
      return item.type == "food";
    });
    data.consumables = data.items.filter(function (item) {
      return item.type == "consumable";
    });
    data.bags = data.items.filter(function (item) {
      return item.type == "bag";
    });
    data.generalitems = data.items.filter(function (item) {
      return item.type == "generalitem";
    });
    data.capacities = data.items.filter(function (item) {
      return item.type == "capacity";
    });
    data.spells = data.items.filter(function (item) {
      return item.type == "spell";
    });
    data.wounds = data.items.filter(function (item) {
      return item.type == "wound";
    });

    //Enrich the html to be able to link objects
    data.biographyHTML = TextEditor.enrichHTML(data.actor.system.biography, {
      secrets: this.actor.isOwner,
      async: false,
      relativeTo: this.actor,
    });

    data.unlocked = this.actor.getFlag(game.system.id, "SheetUnlocked");

    this._prepareCharacterData(data);

    //console.log(data);
    return data;
  }

  activateListeners(html) {
    html
      .find(".sheet-change-lock")
      .click(ActorOrc.onSheetChangelock.bind(this));

    html.find(".ap-deploy").click(this._onAPDeploy.bind(this));
    html.find(".nutrition-deploy").click(this._onNutritionDeploy.bind(this));

    html.find(".item-create").click(ItemOrc.onItemCreate.bind(this));
    html.find(".item-edit").click(ItemOrc.onItemEdit.bind(this));
    html.find(".item-delete").click(ItemOrc.onItemDelete.bind(this));
    html.find(".item-split").click(ItemOrc.onItemSplit.bind(this));

    html.find(".item-equipped").click(this._onItemEquipped.bind(this));
    html
      .find(".weapon-choose-ammo")
      .change(this._onWeaponChooseAmmo.bind(this));
    html.find(".update-stock").change(ItemOrc.onUpdateStock.bind(this));
    html.find(".armor-equipped").change(this._onArmorEquipped.bind(this));
    html.find(".armor-update-ap").change(this._onArmorUpdateAP.bind(this));

    html.find(".take-damage").click(this._onTakeDamage.bind(this));
    html.find(".take-damage-armor").click(this._onTakeDamageArmor.bind(this));
    html.find(".recover-hp").click(this._onRecoverHP.bind(this));
    html.find(".recover-mp").click(this._onRecoverMP.bind(this));

    html.find(".attribute-roll").click(this._onAttributeRoll.bind(this));
    html.find(".attack-roll").click(this._onAttackRoll.bind(this));
    html.find(".dodge-roll").click(this._onDodgeRoll.bind(this));

    html.find(".damage-roll").click(this._onDamageRoll.bind(this));

    html.find(".bleed-roll").click(this._onBleedRoll.bind(this));
    html.find(".bleed-off").click(this._onBleedOff.bind(this));
    html.find(".poison-roll").click(this._onPoisonRoll.bind(this));
    html.find(".poison-off").click(this._onPoisonOff.bind(this));
    html.find(".burn-roll").click(this._onBurnRoll.bind(this));
    html.find(".burn-damage").click(this._onBurnDamage.bind(this));
    html.find(".burn-off").click(this._onBurnOff.bind(this));

    html.find(".new-day").click(this._onNewDay.bind(this));

    html
      .find(".attack-with-weapon-roll")
      .click(this._onAttackWithWeaponRoll.bind(this));
    html.find(".enchant-deploy").click(EnchantOrc.onEnchantDeploy.bind(this));
    html.find(".enchant-roll").click(EnchantOrc.onEnchantRoll.bind(this));
    html
      .find(".enchant-activate")
      .click(EnchantOrc.onEnchantActivate.bind(this));
    html.find(".item-consume").click(this._onItemConsume.bind(this));
    html
      .find(".consumable-deactivate")
      .click(this._onConsumableDeactivate.bind(this));
    html
      .find(".consumable-activable-deploy")
      .click(ItemOrc.onConsumableDeploy.bind(this));
    html
      .find(".consumable-activable-reduce-duration")
      .click(this._onConsumableReduceDuration.bind(this));
    html
      .find(".enchant-reduce-duration")
      .click(EnchantOrc._onEnchantReduceDuration.bind(this));
    html
      .find(".capacity-activable-reduce-duration")
      .click(this._onCapacityReduceDuration.bind(this));
    html
      .find(".capacity-activable-activate")
      .click(this._onCapacityActivate.bind(this));
    html
      .find(".capacity-activable-deactivate")
      .click(this._onCapacityDeactivate.bind(this));
    html
      .find(".capacity-choose-weapon")
      .change(this._onCapacityChooseWeapon.bind(this));
    html
      .find(".capacity-status-resist-roll")
      .click(this._onCapacityStatusResistRoll.bind(this));

    html.find(".spell-memorized").click(this._onSpellMemorized.bind(this));
    html.find(".launch-spell-roll").click(this._onLaunchSpellRoll.bind(this));
    html.find(".control-invoc-roll").click(this._onControlInvocRoll.bind(this));

    html.find(".spell-invoc").click(this._onSpellInvoc.bind(this));

    html.find(".wound-deploy").click(ItemOrc.onWoundDeploy.bind(this));

    super.activateListeners(html);
  }

  async _onAPDeploy(event) {
    event.preventDefault();

    let actor = this.actor;
    actor.update({
      system: { ap: { optionDeploy: !actor.system.ap.optionDeploy } },
    });
  }

  async _onNutritionDeploy(event) {
    event.preventDefault();

    let actor = this.actor;
    actor.update({
      system: {
        nutrition: { optionDeploy: !actor.system.nutrition.optionDeploy },
      },
    });
  }

  _onItemEquipped(event) {
    event.preventDefault();
    let element = event.currentTarget;
    let itemId = element.closest(".item").dataset.itemId;
    let item = this.actor.items.get(itemId);
    if (item == null) return;

    //Check if the item can be equipped
    if (item.system.equipped == null) return;

    //If the item (weapon) needs ammo, if there is no linked ammo, and if the actor has ammo, use the first one by default
    if (item.system.useAmmo && item.system.ammo == "") {
      const defaultAmmo = this.getData().ammos[0];
      if (defaultAmmo) item.update({ system: { ammo: defaultAmmo._id } });
    }

    //Add the tag equipped to the item
    let newValue = !item.system.equipped;
    item.update({ system: { equipped: newValue } });

    //Activated the item enchant if the effect is not tagged as an active effect
    if (item.system.enchant != null) {
      item.update({
        system: {
          enchant: {
            activated:
              !item.system.enchant.activeEffect ||
              !item.system.enchant.use.perDay
                ? newValue
                : false,
          },
        },
      });
    }

    return;
  }

  _onSpellMemorized(event) {
    event.preventDefault();
    let element = event.currentTarget;
    let itemId = element.closest(".item").dataset.itemId;
    let actor = this.actor;
    let item = actor.items.get(itemId);
    if (item == null || item.type != "spell") return;

    //Add the tag equipped to the item
    let n;
    if (item.system.isRitual) {
    } else if (item.system.isInvoc) n = actor.system.magic.nInvoc;
    else n = actor.system.magic.nSpell;

    if (item.system.memorized) {
      item.update({ system: { memorized: false } });
      n.effective--;
    } else if (n.effective < n.value) {
      item.update({ system: { memorized: true } });
      n.effective++;
    }

    if (item.system.isRitual) {
    } else if (item.system.isInvoc)
      actor.update({
        system: { magic: { nInvoc: { effective: n.effective } } },
      });
    else
      actor.update({
        system: { magic: { nSpell: { effective: n.effective } } },
      });
    return;
  }

  _onSpellInvoc(event) {
    event.preventDefault();
    let element = event.currentTarget;
    let itemId = element.closest(".item").dataset.itemId;
    let actor = this.actor;
    let nInvoked = actor.system.magic.nInvoc.invoked;
    let item = actor.items.get(itemId);

    if (item == null || item.type != "spell" || !item.system.isInvoc) return;

    if (!item.system.ifInvoc.invoked) {
      nInvoked++;
      actor.update({
        system: {
          magic: { nInvoc: { invoked: nInvoked } },
        },
      });
      item.update({ system: { ifInvoc: { invoked: true } } });
    } else {
      nInvoked--;
      actor.update({
        system: {
          magic: { nInvoc: { invoked: nInvoked } },
        },
      });
      item.update({ system: { ifInvoc: { invoked: false } } });
    }

    return;
  }

  _onArmorEquipped(event) {
    event.preventDefault();
    let element = event.currentTarget;
    let itemId = element.value;
    let items = this.actor.items;

    //Un-equipped all armors related to this body part
    let slotBodyPart = element.slot;
    for (let it of items) {
      if (it.type == "armor")
        if (it.system.bodyPart == slotBodyPart) {
          it.update({
            system: { equipped: false, enchant: { activated: false } },
          });
        }
    }

    //Recover the armor to equipped
    let item = items.get(itemId);
    if (item == null) return;
    if (item.type != "armor") return;

    //Check if the item can be equipped
    if (item.system.equipped == null) return;

    item.update({
      system: {
        equipped: true,
        enchant: {
          activated:
            !item.system.enchant.activeEffect || !item.system.enchant.use.perDay
              ? true
              : false,
        },
      },
    });

    return;
  }

  _onWeaponChooseAmmo(event) {
    event.preventDefault();
    let element = event.currentTarget;
    let itemId = element.closest(".item").dataset.itemId;
    let item = this.actor.items.get(itemId);
    if (item.type != "weapon") return;

    let maj = { system: { ammo: event.currentTarget.value } };
    return item.update(maj);
  }

  _onArmorUpdateAP(event) {
    event.preventDefault();
    let element = event.currentTarget;
    let itemId = element.closest(".item").dataset.itemId;
    let item = this.actor.items.get(itemId);
    if (item.type != "armor") return;

    let maj = { system: { ap: parseFloat(event.currentTarget.value) } };
    return item.update(maj);
  }

  _onTakeDamage(event) {
    const damage = event.currentTarget.dataset.damage;
    const applyArmor = event.currentTarget.dataset.applyarmor === "true";
    const onMP = event.currentTarget.dataset.onmp === "true";
    if (!damage) return;
    this.takeDamage({
      damageFormula: damage,
      applyArmor: applyArmor,
      onMP: onMP,
    });
  }

  _onTakeDamageArmor(event) {
    const damage = event.currentTarget.dataset.damage;
    const armorId = event.currentTarget.dataset.armorid;
    if (!damage) return;
    this.takeDamage({
      damageFormula: damage,
      onArmor: { validate: true, armorId: armorId },
      limitValue: 0,
    });
  }

  _onRecoverHP(event) {
    const heal = event.currentTarget.dataset.heal;
    const multiplier = event.currentTarget.dataset.multiplier;
    if (!heal || !multiplier) return;
    this.takeHeal({ healFormula: heal, multiplier: multiplier });
  }

  _onRecoverMP(event) {
    const heal = event.currentTarget.dataset.heal;
    if (!heal) return;
    this.takeHeal({ healFormula: heal, onMP: true });
  }

  async _onAttributeRoll(event) {
    DiceOrc.AttributeRoll({
      actor: this.actor,
      attribute: event.currentTarget.dataset,
      modif: this.actor.system.modifAllAttributes,
    });

    //Consume enchant and capacity on roll
    this.consumeOnRoll({ onRoll: true });
  }

  async _onAttackRoll(event) {
    DiceOrc.AttackRoll({
      actor: this.actor,
      attribute: event.currentTarget.dataset,
      modif: this.actor.system.modifAllAttributes,
    });

    //Consume enchant and capacity on roll
    this.consumeOnRoll({ onAttack: true });

    return;
  }

  async _onDodgeRoll(event) {
    DiceOrc.DodgeRoll({
      actor: this.actor,
      attribute: event.currentTarget.dataset,
      modif: this.actor.system.modifAllAttributes,
    });

    //Consume enchant and capacity on roll
    this.consumeOnRoll({ onRoll: true });
  }

  async _onDamageRoll(event) {
    DiceOrc.DamageRoll({
      actor: this.actor,
      attribute: event.currentTarget.dataset,
    });
  }

  async _onPoisonRoll(event) {
    let damage = DiceOrc.BleedPoisonRoll({
      actor: this.actor,
      type: event.currentTarget.dataset.type,
    });
    await this.takeDamage({
      damageFormula: damage,
      limitValue: 1,
    });
  }

  async _onBleedRoll(event) {
    let damage = DiceOrc.BleedPoisonRoll({
      actor: this.actor,
      type: event.currentTarget.dataset.type,
    });
    await this.takeDamage({
      damageFormula: damage,
    });
  }

  async _onBurnRoll(event) {
    const rollResult = DiceOrc.BurnRoll({
      actor: this.actor,
    });

    //If it rolls a 100, the burn stacks are removed
    if (rollResult == 100) {
      this._onBurnOff(event);
      return;
      //If it rolls a value lower than the number of stacks, the character catches fire.
    } else if (rollResult <= this.actor.system.status.burn) {
      let maj = { system: { status: { onfire: true } } };
      await this.actor.update(maj);
    }
    return rollResult;
  }

  async _onBleedOff(event) {
    await this.actor.update({ system: { status: { bleed: 0 } } });
    return;
  }

  async _onPoisonOff(event) {
    await this.actor.update({ system: { status: { poison: 0 } } });
    return;
  }

  async _onBurnOff(event) {
    await this.actor.update({ system: { status: { burn: 0, onfire: false } } });
    return;
  }

  async _onBurnDamage(event) {
    let damage = this.actor.system.status.burn;
    await this.takeDamage({
      damageFormula: damage,
      applyArmor: true,
    });

    //Add 5 burn stacks
    await this.actor.update({ system: { status: { burn: damage + 5 } } });

    return;
  }

  async _onNewDay(event) {
    await this.newDay();
    return;
  }

  async _onAttackWithWeaponRoll(event) {
    const weapon = this.actor.items
      .filter(function (item) {
        return item.type == "weapon";
      })
      .filter(function (item) {
        return item._id == event.currentTarget.dataset.weaponid;
      })[0];
    if (
      weapon.system.useAmmo &&
      this.actor.items
        .filter(function (item) {
          return item.type == "ammo";
        })
        .filter(function (item) {
          return item._id == weapon.system.ammo;
        })[0] == null
    )
      return;

    await DiceOrc.AttackRoll({
      actor: this.actor,
      attribute: event.currentTarget.dataset,
      modif: this.actor.system.modifAllAttributes,
    });
    await DiceOrc.DamageRoll({
      actor: this.actor,
      attribute: event.currentTarget.dataset,
    });

    //Consume enchant and capacity on attack
    this.consumeOnRoll({ onAttack: true });

    return;
  }

  async _onLaunchSpellRoll(event) {
    let actor = this.actor;
    //Recover the spell
    const spell = actor.items
      .filter(function (item) {
        return item.type == "spell";
      })
      .filter(function (item) {
        return item._id == event.currentTarget.dataset.spellid;
      })[0];

    //Do the roll
    await DiceOrc.SpellRoll({
      actor: actor,
      attribute: event.currentTarget.dataset,
      modif: actor.system.modifAllAttributes,
      spell: spell,
    });

    //Consume enchant and capacity on spell
    this.consumeOnRoll({ onSpell: true });

    return;
  }

  async _onControlInvocRoll(event) {
    let actor = this.actor;
    //Do the roll
    await DiceOrc.SpellRoll({
      actor: actor,
      attribute: event.currentTarget.dataset,
      modif: actor.system.modifAllAttributes,
      spell: null,
    });

    //Consume enchant and capacity on spell
    this.consumeOnRoll({ onSpell: true });

    return;
  }

  async _onItemConsume(event) {
    event.preventDefault();
    //Retrive the actor and the item
    let element = event.currentTarget;
    let itemId = element.closest(".item").dataset.itemId;
    let actor = this.actor;
    let actorData = actor.system;
    let item = this.actor.items.get(itemId);
    let itemData = item.system;
    let weightIndiv = itemData.weight.indiv;
    let weightTotal = itemData.weight.total;
    let stock = itemData.stock;
    //Not enough items
    if (stock <= 0) {
      await item.delete();
      return;
    }

    //New values
    let newValues = {
      foodDay: actorData.nutrition.foodDay,
      drinkDay: actorData.nutrition.drinkDay,
      tipsiness: actorData.nutrition.tipsiness,
      poison: actorData.status.poison,
    };
    if (item.type == "food") {
      if (itemData.type.food) newValues.foodDay += 1;
      if (itemData.type.drink) newValues.drinkDay += 1;
    }
    //Do a physical roll and increase the actor tipsiness in case of failure
    if (itemData.tipsiness || itemData.poison) {
      let statusResistOut = DiceOrc.StatusResistRoll({
        actor: actor,
        modif: actorData.modifAllAttributes + actorData.status.modifResist,
      });

      //Consume enchant and capacity on roll
      this.consumeOnRoll({ onRoll: true });

      if (statusResistOut) {
        newValues.tipsiness += itemData.tipsiness;
        newValues.poison += itemData.poison;
      }
    }
    //Recover the HP and MP
    //HP or MP recovery through food only applies from excess meals
    if (
      item.type != "food" ||
      (itemData.type.food &&
        actorData.nutrition.foodDay >=
          actorData.nutrition.foodNeededDay.value) ||
      (itemData.type.drink &&
        actorData.nutrition.drinkDay >=
          actorData.nutrition.drinkNeededDay.value)
    ) {
      if (itemData.hp != "")
        await this.takeHeal({
          healFormula: itemData.hp,
          multiplier: actorData.recoverHP.multiplier.value,
        });
      if (itemData.mp != "")
        await this.takeHeal({ healFormula: itemData.mp, onMP: true });
    }
    //Apply the status healing
    if (itemData.healBleed) this._onBleedOff();
    if (itemData.healPoison) this._onPoisonOff();
    if (itemData.healBurn) this._onBurnOff();

    //Take the damage
    if (itemData.damage != null && itemData.damage != "")
      await this.takeDamage({ damageFormula: itemData.damage });
    if (itemData.damageMP != null && itemData.damageMP != "")
      await this.takeDamage({ damageFormula: itemData.damageMP, onMP: true });

    //Update the actor
    await actor.update({
      system: {
        nutrition: {
          tipsiness: newValues.tipsiness,
          foodDay: newValues.foodDay,
          drinkDay: newValues.drinkDay,
        },
        status: {
          poison: newValues.poison,
        },
      },
    });

    //Update the item
    //Update stock and weight
    await item.update({
      system: {
        stock: stock - 1,
        weight: {
          total: Math.floor(100 * (weightTotal - weightIndiv)) / 100,
        },
      },
    });

    //If the item is tagged as activable, create a copy tagged as activated
    if (itemData.isActivable) {
      //Roll the effective duration
      let durationFormula = itemData.ifActivable.duration;
      if (typeof durationFormula !== "string")
        durationFormula = durationFormula.toString();
      let roll = new Roll(durationFormula).roll({ async: false });
      let duration = roll.total;
      //If the formula is not trivial, display the roll in the chat
      if (durationFormula.includes("d") || durationFormula.includes("+"))
        ChatOrc.RollToSimpleCustomMessage({ roll: roll });

      //Create a copy of the item tagged as activated, with the proper duration and no weight
      await item.clone(
        {
          "system.ifActivable.activated": true,
          "system.ifActivable.duration": duration.toString(),
          "system.stock": 1,
          "system.weight.indiv": 0,
          "system.weight.total": 0,
        },
        { save: true }
      );
    }

    //Delete the item if the stock goes to 0
    if (item.system.stock <= 0) await item.delete();

    return;
  }

  async _onConsumableReduceDuration(event) {
    event.preventDefault();
    //Retrive the item
    let item = this.actor.items.get(event.currentTarget.dataset.itemid);
    //Does nothing if no item has been found
    if (item == null) return;
    //Does nothing if the item is not a consumable
    if (item.type != "consumable") return;
    let itemData = item.system;
    //Does nothing if the item is not tagged as activable
    if (!itemData.isActivable) return;

    let newDuration = itemData.ifActivable.duration - 1;
    if (newDuration <= 0) {
      this._onConsumableDeactivate(event);
      return;
    }

    await item.update({
      system: {
        ifActivable: { duration: newDuration },
      },
    });

    return;
  }

  async _onCapacityReduceDuration(event) {
    event.preventDefault();
    //Retrive the item
    let item = this.actor.items.get(event.currentTarget.dataset.itemid);
    //Does nothing if no item has been found
    if (item == null) return;
    //Does nothing if the item is not a capacity
    if (item.type != "capacity") return;
    let itemData = item.system;
    //Does nothing if the item is not tagged as activable
    if (!itemData.activeEffect || !itemData.ifActivable.activated) return;

    let newDuration = itemData.ifActivable.durationEffective - 1;
    if (newDuration <= 0) {
      this._onCapacityDeactivate(event);
      return;
    }
    await item.update({
      system: {
        ifActivable: { durationEffective: newDuration },
      },
    });
    return;
  }

  _onCapacityChooseWeapon(event) {
    event.preventDefault();
    let element = event.currentTarget;
    let itemId = element.closest(".item").dataset.itemId;
    let item = this.actor.items.get(itemId);
    if (item.type != "capacity") return;

    let maj = { system: { weaponLocal: event.currentTarget.value } };
    return item.update(maj);
  }

  _onCapacityStatusResistRoll(event) {
    let actor = this.actor;
    let actorData = actor.system;
    DiceOrc.StatusResistRoll({
      actor: actor,
      modif: actorData.modifAllAttributes + actorData.status.modifResist,
    });

    //Use enchant and capacity on roll
    this.consumeOnRoll({ onRoll: true });

    return;
  }

  async _onConsumableDeactivate(event) {
    event.preventDefault();
    //Retrive the item
    let element = event.currentTarget;
    let itemId = element.closest(".item").dataset.itemId;
    let item = this.actor.items.get(itemId);
    if (item.type != "consumable") return;
    let itemData = item.system;
    if (!itemData.isActivable || !itemData.ifActivable.activated) return;

    //Delete the item
    await item.delete();

    return;
  }

  async _onCapacityActivate(event) {
    event.preventDefault();

    let item = this.actor.items.get(event.currentTarget.dataset.itemid);
    //Does nothing if no item or no enchant has been found
    if (item == null) return;
    let itemData = item.system;
    if (!itemData.activeEffect == null) return;
    if (itemData.ifActivable.activated) return;

    //Roll the effective duration
    let durationEffective = 0;
    if (itemData.ifActivable.duration != "") {
      let durationFormula = itemData.ifActivable.duration;
      if (typeof durationFormula !== "string")
        durationFormula = durationFormula.toString();
      let roll = new Roll(durationFormula).roll({ async: false });
      durationEffective = roll.total;
      //If the formula is not trivial, display the roll in the chat
      if (durationFormula.includes("d") || durationFormula.includes("+"))
        ChatOrc.RollToSimpleCustomMessage({ roll: roll });
    }

    item.update({
      system: {
        ifActivable: { activated: true, durationEffective: durationEffective },
      },
    });

    return;
  }

  async _onCapacityDeactivate(event) {
    event.preventDefault();
    //Retrive the item
    let element = event.currentTarget;
    let itemId = element.closest(".item").dataset.itemId;
    let item = this.actor.items.get(itemId);

    if (item.type != "capacity") return;
    let itemData = item.system;
    if (!itemData.activeEffect || !itemData.ifActivable.activated) return;

    //Deactivate the item
    item.update({
      system: {
        ifActivable: { activated: false },
      },
    });
    return;
  }

  consumeOnRoll({ onRoll = false, onAttack = false, onSpell = false }) {
    let actor = this.actor;
    let items = this.getData().items;
    for (let [key, item] of Object.entries(items)) {
      let itemData = item.system;

      if (!itemData.equipped) continue;

      let enchant = itemData.enchant;
      if (
        enchant != null &&
        enchant.activeEffect &&
        enchant.activated &&
        ((onRoll && enchant.use.consumeOnRoll) ||
          (onAttack && enchant.use.consumeOnAttack) ||
          (onSpell && enchant.use.consumeOnSpell))
      ) {
        let newDuration = enchant.use.durationEffective - 1;
        if (newDuration <= 0)
          item.update(
            { system: { enchant: { activated: false } } },
            { render: false }
          );
        else
          item.update(
            {
              system: { enchant: { use: { durationEffective: newDuration } } },
            },
            { render: false }
          );
      }
      if (
        item.type == "capacity" &&
        itemData.activeEffect &&
        itemData.ifActivable.activated &&
        ((onRoll && itemData.ifActivable.consumeOnRoll) ||
          (onAttack && itemData.ifActivable.consumeOnAttack) ||
          (onSpell && itemData.ifActivable.consumeOnSpell))
      ) {
        let newDuration = itemData.ifActivable.durationEffective - 1;
        if (newDuration <= 0)
          item.update(
            { system: { ifActivable: { activated: false } } },
            { render: false }
          );
        else
          item.update(
            {
              system: { ifActivable: { durationEffective: newDuration } },
            },
            { render: false }
          );
      }
      if (
        item.type == "consumable" &&
        itemData.isActivable &&
        itemData.ifActivable.activated &&
        ((onRoll && itemData.ifActivable.consumeOnRoll) ||
          (onAttack && itemData.ifActivable.consumeOnAttack) ||
          (onSpell && itemData.ifActivable.consumeOnSpell))
      ) {
        let newDuration = itemData.ifActivable.duration - 1;
        if (newDuration <= 0)
          item.update(
            { system: { ifActivable: { activated: false } } },
            { render: false }
          );
        else
          item.update(
            {
              system: { ifActivable: { duration: newDuration } },
            },
            { render: false }
          );
      }
    }
    return;
  }

  async takeDamage({
    damageFormula,
    applyArmor = false,
    onMP = false,
    onArmor = { validate: false, armorId: "" },
    limitValue = -1000,
  }) {
    //Recover the actor informations
    let actor = this.actor;
    let actorData = actor.system;

    //Roll the damage
    if (typeof damageFormula !== "string")
      damageFormula = damageFormula.toString();
    let roll = new Roll(damageFormula).roll({ async: false });
    let damage = roll.total;
    //If the formula is not trivial, display the roll in the chat
    if (damageFormula.includes("d") || damageFormula.includes("+"))
      ChatOrc.RollToSimpleCustomMessage({ roll: roll });

    //Apply the armor
    if (applyArmor) damage -= actorData.ap.value;
    if (damage <= 0) return;

    //Apply damage on an owned armor piece
    if (onArmor.validate) {
      //Recover the armor
      let armor = actor.items.get(onArmor.armorId);
      if (armor == null || armor.type != "armor") return;
      let value = armor.system.ap;
      //Calculate the new ap value
      let newValue = value - damage;
      if (newValue < limitValue) newValue = limitValue;
      //Apply the damage
      await armor.update({ system: { ap: newValue } });
    }

    //Apply damage on HP or MP
    else {
      //Recover the actor values
      let value = actorData.hp.value;
      if (limitValue < actorData.hp.surplus) limitValue = actorData.hp.surplus;
      //If damage are applied on MP
      if (onMP) {
        value = actorData.mp.value;
        limitValue = actorData.mp.surplus;
        //MP cannot be negative, extra damages are reported on HP
        if (damage > value) {
          await this.takeDamage({
            damageFormula: damage - value,
            applyArmor: false,
            onMP: false,
          });
          damage = value;
        }
      }

      //Calculate the new value
      let newValue = value - damage;
      if (newValue < limitValue) newValue = limitValue;
      //Apply the damage
      let maj = {
        system: onMP
          ? { mp: { value: newValue } }
          : { hp: { value: newValue } },
      };
      await actor.update(maj);
    }

    return damage;
  }

  async takeHeal({ healFormula, multiplier = 1, onMP = false }) {
    //Recover the actor informations
    let actor = this.actor;
    let actorData = actor.system;
    let value, limitValue;
    value = actorData.hp.value;
    limitValue = actorData.hp.valueMax;
    if (onMP) {
      value = actorData.mp.value;
      limitValue = actorData.mp.valueMax;
    }

    //Roll the heal
    if (typeof healFormula !== "string") healFormula = healFormula.toString();
    let roll = new Roll(healFormula).roll({ async: false });
    let heal = roll.total;
    //If the formula is not trivial, display the roll in the chat
    if (healFormula.includes("d") || healFormula.includes("+"))
      ChatOrc.RollToSimpleCustomMessage({ roll: roll });
    //Apply the multiplier
    heal *= multiplier;

    //Calculate the new value
    let newValue = Math.floor(value + heal);
    if (newValue > limitValue) newValue = limitValue;

    //Apply the heal
    let maj = {
      system: onMP ? { mp: { value: newValue } } : { hp: { value: newValue } },
    };
    await actor.update(maj);

    return heal;
  }

  async newDay() {
    let actor = this.actor;
    let items = this.getData().items;

    //Update the actors
    //Add 10 MP
    const valueMP = actor.system.mp.value;
    const limitValueMP = actor.system.mp.valueMax;
    let newValueMP = valueMP + 10;
    if (newValueMP > limitValueMP) newValueMP = limitValueMP;

    //Update the foods and drinks
    const food = actor.system.nutrition.foodDay;
    const foodNeeded = actor.system.nutrition.foodNeededDay.value;
    let newFood = food >= foodNeeded ? 0 : food - foodNeeded;
    const drink = actor.system.nutrition.drinkDay;
    const drinkNeeded = actor.system.nutrition.drinkNeededDay.value;
    let newDrink = drink >= drinkNeeded ? 0 : drink - drinkNeeded;

    //Do the maj
    actor.update({
      system: {
        mp: { value: newValueMP },
        nutrition: {
          foodDay: newFood,
          drinkDay: newDrink,
          tipsiness: 0,
        },
      },
    });

    //Update the owned items
    for (let [key, it] of Object.entries(items)) {
      let item = actor.items.get(it._id);
      //Deactivate and reset enchants
      if (item.system.enchant != null) {
        if (
          item.system.enchant.activeEffect &&
          item.system.enchant.use.perDay > 0
        ) {
          await item.update(
            {
              system: {
                enchant: {
                  use: { available: item.system.enchant.use.perDay },
                  activated: item.system.enchant.use.disableOnNewDay
                    ? false
                    : true,
                },
              },
            },
            { render: false }
          );
        }
      }
      //Deactivate capacities
      if (
        item.type == "capacity" &&
        item.system.activeEffect &&
        item.system.ifActivable.activated
      ) {
        await item.update(
          {
            system: {
              ifActivable: {
                activated: item.system.ifActivable.disableOnNewDay
                  ? false
                  : true,
              },
            },
          },
          { render: false }
        );
      }

      //Delete activated consumables
      if (
        item.type == "consumable" &&
        item.system.ifActivable.activated &&
        item.system.ifActivable.disableOnNewDay
      ) {
        await item.delete();
      }
    }

    return;
  }

  /**
   * Calculate the actor derived values
   */
  async _prepareCharacterData(data) {
    this.initPrincipaleValues(data);

    this.applyItemsOnPrincipales(data);
    this.applyNutrition(data);
    this.applyCapacities(data);

    this.initEncumbranceLimit(data);
    this.applyItemsOnEncumbranceLimit(data);
    this.applyEncumbranceOnPrincipales(data);

    this.initDerivatedValues(data);
    this.applyItemsOnDerivated(data);
    this.applyEncumbranceOnDerivated(data);

    this.applyCombatStyle(data);

    //Calculate the HP and MP surplus
    this.calculateSurplus(data);

    //Check if some effective values are higher the minimal or the maximal allowed values
    this.checkExcessValues(data);

    //Update the owned weapon effective values (damage, effect and attack)
    this.updateWeaponsEffectiveValues(data);
    //Update the spell effective values (rolls, effect...)
    this.updateSpellEffectiveValues(data);

    //Calculate the initative bonus
    this.calculateInitiative(data);

    //Delete items with 0 stock
    ActorOrc.removeItemsWithoutStock(data);
  }

  initPrincipaleValues(data) {
    let actor = data.actor;
    let actorData = actor.system;

    //HP
    actorData.hp.valueMax = actorData.hp.valueMaxNative;
    //MP
    actorData.mp.valueMax = actorData.mp.valueMaxNative;
    //AP
    actorData.ap.value = actorData.ap.native;

    //Attributes
    for (let [key, attribut] of Object.entries(actorData.attributes))
      attribut.value = attribut.native;
    //All attributes roll modifier
    actorData.modifAllAttributes = 0;

    //Status resistance roll modifier
    actorData.status.modifResist = 0;

    //Encumbrance
    actorData.encumbrance.value = 0;

    //Defence
    actorData.defence.value = 0;
    //Is dodging possible?
    actorData.dodge.enable = false;

    //Damage bonus
    actorData.damageBonus.value = "";

    //Magic
    let magic = actorData.magic;
    //Number of memorized spells
    magic.nSpell.value = magic.nSpell.native;
    //Number of memorized invocations
    magic.nInvoc.value = magic.nInvoc.native;
    //Magic damage and heal bonus
    magic.power.value = "";
    //MP reduction
    magic.mpReduc.value = 0;
    //Ability to launch spells
    magic.canLaunchSpell = false;

    //Roll limits
    //Critical
    actorData.roll.limitCritical.value = 1;
    //Fumble
    actorData.roll.limitFumble.value = 100;

    //Healing multiplier
    actorData.recoverHP.multiplier.value =
      actorData.recoverHP.multiplier.native;

    //Nutrition need day
    //Food
    actorData.nutrition.foodNeededDay.value =
      actorData.nutrition.foodNeededDay.native;
    //Drink
    actorData.nutrition.drinkNeededDay.value =
      actorData.nutrition.drinkNeededDay.native;

    //Initiative
    actorData.ini.ndice = 0;
    actorData.ini.dice = 0;
    actorData.ini.flat = actorData.ini.flatNative;
  }

  applyCombatStyle(data) {
    let actor = data.actor;
    let actorData = actor.system;
    const style = actorData.combatStyle;

    if (style === "standard") {
      actorData.dodge.value += -20;
      actorData.damageBonus.value += "";
    } else if (style === "offensive") {
      actorData.attack.value += +10;
      actorData.defence.value += -15;
      actorData.dodge.value += -20;
    } else if (style === "defensive") {
      actorData.attack.value += -15;
      actorData.defence.value += +10;
      actorData.dodge.value += -20;
    } else if (style === "dodge") {
      actorData.attack.value += -15;
      actorData.defence.value += -5;
      actorData.dodge.value += -10;
      actorData.dodge.enable = true;
    } else if (style === "aggressive") {
      actorData.attack.value += -10;
      actorData.defence.value += -15;
      actorData.dodge.value += -20;
      actorData.damageBonus.value += "2d10";
    } else if (style === "ambidex") {
      actorData.attack.value += -20;
      actorData.dodge.value += -20;
    }
  }

  applyItemsOnPrincipales(data) {
    let actor = data.actor;
    let actorData = actor.system;

    const items = data.items;
    for (let [key, item] of Object.entries(items)) {
      const itemData = item.system;

      //Weapons
      if (item.type == "weapon" && itemData.equipped) {
        actorData.defence.value += itemData.defenceModif;
        if (itemData.allowMagic) actorData.magic.canLaunchSpell = true;
      }
      //Armors
      if (item.type == "armor" && itemData.equipped) {
        actorData.ap.value += itemData.ap;
      }

      //Equipable items
      if (item.type == "equipableitem" && itemData.equipped) {
        actorData.magic.nSpell.value += itemData.nSpell;
        actorData.magic.nInvoc.value += itemData.nInvoc;
        if (itemData.magicPower != "")
          if (actorData.magic.power.value == "")
            actorData.magic.power.value += itemData.magicPower;
          else actorData.magic.power.value += "+" + itemData.magicPower;
        actorData.magic.mpReduc.value += itemData.mpReduc;
      }

      //Activated consumables
      if (item.type == "consumable") {
        if (itemData.isActivable && itemData.ifActivable.activated) {
          const effect = itemData.ifActivable;
          actorData.attributes.physical.value += effect.physicalModif;
          actorData.attributes.social.value += effect.socialModif;
          actorData.attributes.intel.value += effect.intelModif;
          actorData.hp.valueMax += effect.hpMaxModif;
          actorData.mp.valueMax += effect.mpMaxModif;
          actorData.ap.value += effect.apModif;

          actorData.defence.value += effect.defenceModif;
          actorData.roll.limitCritical.value += effect.limitCriticalModif;
          actorData.roll.limitFumble.value += effect.limitFumbleModif;
          actorData.ini.flat += effect.initiativeModif;
          if (actorData.damageBonus.value == "")
            actorData.damageBonus.value += effect.damageBonusModif;
          else actorData.damageBonus.value += "+" + effect.damageBonusModif;
          if (actorData.magic.power.value == "")
            actorData.magic.power.value += effect.magicPower;
          else actorData.magic.power.value += "+" + effect.magicPower;
          actorData.magic.mpReduc.value += effect.mpReduc;
        }
      }
      //All items with weight
      if (itemData.weight) {
        actorData.encumbrance.value +=
          itemData.weight.total != null
            ? itemData.weight.total
            : itemData.weight;
      }
      //Add the enchant
      const enchant = itemData.enchant;
      if (enchant && enchant.activated) {
        actorData.attributes.physical.value += enchant.physicalModif;
        actorData.attributes.social.value += enchant.socialModif;
        actorData.attributes.intel.value += enchant.intelModif;
        actorData.hp.valueMax += enchant.hpMaxModif;
        actorData.mp.valueMax += enchant.mpMaxModif;
        actorData.ap.value += enchant.apModif;

        actorData.defence.value += enchant.defenceModif;
        actorData.roll.limitCritical.value += enchant.limitCriticalModif;
        actorData.roll.limitFumble.value += enchant.limitFumbleModif;
        actorData.ini.flat += enchant.initiativeModif;
        actorData.nutrition.foodNeededDay.value += enchant.foodNeededDayModif;
        actorData.nutrition.drinkNeededDay.value += enchant.drinkNeededDayModif;
        if (actorData.damageBonus.value == "")
          actorData.damageBonus.value += enchant.damageBonusModif;
        else actorData.damageBonus.value += "+" + enchant.damageBonusModif;
        actorData.magic.nSpell.value += enchant.nSpell;
        actorData.magic.nInvoc.value += enchant.nInvoc;
        if (actorData.magic.power.value == "")
          actorData.magic.power.value += enchant.magicPower;
        else actorData.magic.power.value += "+" + enchant.magicPower;
        actorData.magic.mpReduc.value += enchant.mpReduc;
      }

      //Wounds
      if (item.type == "wound") {
        actorData.attributes.physical.value += itemData.physicalModif;
        actorData.attributes.social.value += itemData.socialModif;
        actorData.attributes.intel.value += itemData.intelModif;
        actorData.hp.valueMax += itemData.hpMaxModif;
        actorData.mp.valueMax += itemData.mpMaxModif;
        actorData.nutrition.foodNeededDay.value += itemData.foodNeededDayModif;
        actorData.nutrition.drinkNeededDay.value +=
          itemData.drinkNeededDayModif;
        if (actorData.damageBonus.value == "")
          actorData.damageBonus.value += itemData.damageBonusModif;
        else actorData.damageBonus.value += "+" + itemData.damageBonusModif;
      }
    }

    //Round the encumbrance
    actorData.encumbrance.value =
      Math.floor(actorData.encumbrance.value * 100) / 100;
  }

  applyNutrition(data) {
    let actor = data.actor;
    let actorData = actor.system;

    const food = actorData.nutrition.foodDay;
    const foodNedeed = actorData.nutrition.foodNeededDay.value;
    if (food == foodNedeed + 4) {
      actorData.attributes.social.value += -5;
      actorData.attributes.intel.value += -5;
    } else if (food > foodNedeed + 4) {
      actorData.attributes.physical.value += -10 * (food - (foodNedeed + 4));
      actorData.attributes.social.value += -10;
      actorData.attributes.intel.value += -10 * (food - (foodNedeed + 4));
    } else if (food < 0) {
      if (food == -1) {
        actorData.attributes.physical.value += -5;
      } else if (food == -2) {
        actorData.attributes.physical.value += -10;
      } else if (food == -3) {
        actorData.attributes.physical.value += -20;
      } else if (food <= -4) {
        actorData.attributes.physical.value += -40;
        actorData.hp.valueMax += 10 * (food + 3);
      }
    }

    const drink = actorData.nutrition.drinkDay;
    const drinkNedeed = actorData.nutrition.drinkNeededDay.value;
    if (drink == drinkNedeed + 4)
      actorData.attributes.physical.value += -5 * (drink - (drinkNedeed + 3));
    else if (drink > drinkNedeed + 4) {
      actorData.attributes.intel.value += -10 * (drink - (drinkNedeed + 4));
      actorData.hp.valueMax += -10 * (drink - (drinkNedeed + 4));
    } else if (drink < 0) {
      if (drink == -1) {
        actorData.attributes.physical.value += -10;
        actorData.mp.valueMax += -1;
      } else if (drink == -2) {
        actorData.attributes.physical.value += -20;
        actorData.hp.valueMax += -10;
        actorData.mp.valueMax += -3;
      } else if (drink == -3) {
        actorData.attributes.physical.value += -30;
        actorData.hp.valueMax += -20;
        actorData.mp.valueMax += -5;
      } else if (drink <= -4) {
        actorData.attributes.physical.value += -100000;
        actorData.hp.valueMax = 1;
        actorData.mp.valueMax += -100000;
        this.takeDamage({ damageFormula: 100000 });
      }
    }

    const tipsiness = actorData.nutrition.tipsiness;
    if (tipsiness > 0) {
      if (tipsiness == 1) {
        actorData.attributes.social.value += +5;
        actorData.attributes.intel.value += -5;
      } else if (tipsiness == 2) {
        actorData.attributes.social.value += +10;
        actorData.attributes.intel.value += -10;
      } else if (tipsiness >= 3) {
        actorData.attributes.social.value += -5 * (tipsiness - 1);
        actorData.attributes.intel.value += -10 * (tipsiness - 1);
      }
    }
  }

  applyCapacities(data) {
    let actor = data.actor;
    let actorData = actor.system;
    const items = data.items;

    for (let [key, item] of Object.entries(items)) {
      let itemData = item.system;
      if (item.type != "capacity") continue;
      if (itemData.activeEffect && !itemData.ifActivable.activated) continue;
      if (itemData.isRageBerserk) {
        actorData.attributes.physical.value += Math.floor(
          (actorData.hp.valueMax - actorData.hp.value) / 10
        );
      }
      actorData.modifAllAttributes += itemData.modifAllAttributes;
      if (itemData.isStatusResistRoll)
        actorData.status.modifResist += itemData.modifStatusResist;

      if (itemData.dodgeEnable) actorData.dodge.enable = true;
      if (itemData.damageBonusModif != "")
        if (actorData.damageBonus.value == "")
          actorData.damageBonus.value += itemData.damageBonusModif;
        else actorData.damageBonus.value += "+" + itemData.damageBonusModif;
    }
  }

  initEncumbranceLimit(data) {
    let actor = data.actor;
    let actorData = actor.system;

    //Encumbrance limit
    actorData.encumbrance.limit = Math.floor(
      actorData.attributes.physical.value *
        actorData.encumbrance.limitMultiplier
    );
  }

  applyItemsOnEncumbranceLimit(data) {
    let actor = data.actor;
    let actorData = actor.system;

    const items = data.items;
    for (let [key, item] of Object.entries(items)) {
      const itemData = item.system;

      //Bag
      if (item.type == "bag")
        if (item.system.equipped)
          actorData.encumbrance.limit += itemData.capacity;

      //Activated consumables
      if (item.type == "consumable")
        if (itemData.isActivable && itemData.ifActivable.activated)
          actorData.encumbrance.limit += effect.encumbranceLimitModif;

      //Add the enchant
      const enchant = itemData.enchant;
      if (enchant && enchant.activated)
        actorData.encumbrance.limit += enchant.encumbranceLimitModif;

      //Wounds
      if (item.type == "wound")
        actorData.encumbrance.limit += itemData.encumbranceLimitModif;
    }
  }

  applyEncumbranceOnPrincipales(data) {
    //Ajouter les food et drink needed !!!!!!!!!!!!!!!!!!!
    let actor = data.actor;
    let actorData = actor.system;

    const encumbrance = actorData.encumbrance.value;
    const limit = actorData.encumbrance.limit;
    if (encumbrance > 1 * limit) {
      //Malus in physical
      actorData.attributes.physical.value +=
        -5 * Math.floor(10 * (encumbrance / limit - 1 + 0.1));
    }
    if (encumbrance > 1.2 * limit) {
      //Malus in defence
      actorData.defence.value +=
        -5 * Math.floor(10 * (encumbrance / limit - 1.2 + 0.1));
    }
    if (encumbrance > 1.4 * limit) {
      actorData.nutrition.drinkNeededDay.value += 1;
    }
    if (encumbrance > 1.6 * limit) {
      //Automatically hit
      actorData.defence.value = -100;
      actorData.nutrition.foodNeededDay.value += 1;
    }
    if (encumbrance > 1.8 * limit) {
      actorData.nutrition.drinkNeededDay.value += 1;
    }
  }

  initDerivatedValues(data) {
    let actor = data.actor;
    let actorData = actor.system;

    const physical = actorData.attributes.physical.value;
    const intel = actorData.attributes.intel.value;

    //Attack
    actorData.attack.native = physical;
    actorData.attack.value = physical;
    //Dodge
    actorData.dodge.native = physical;
    actorData.dodge.value = physical;

    //Roll spell value
    actorData.magic.roll.native = intel;
    actorData.magic.roll.value = intel;

    return;
  }

  applyItemsOnDerivated(data) {
    let actor = data.actor;
    let actorData = actor.system;

    const items = data.items;
    for (let [key, item] of Object.entries(items)) {
      const itemData = item.system;

      //Equipable items
      if (item.type == "equipableitem" && itemData.equipped)
        actorData.magic.roll.value += itemData.rollSpellBonus;

      //Activated consumables
      if (item.type == "consumable") {
        if (itemData.isActivable && itemData.ifActivable.activated) {
          const effect = itemData.ifActivable;
          actorData.attack.value += effect.attackModif;
          actorData.dodge.value += effect.dodgeModif;
          actorData.magic.roll.value += effect.rollSpellBonus;
        }
      }

      //Add the enchant
      const enchant = itemData.enchant;
      if (enchant && enchant.activated) {
        actorData.attack.value += enchant.attackModif;
        actorData.dodge.value += enchant.dodgeModif;
        actorData.magic.roll.value += enchant.rollSpellBonus;
      }
    }
  }

  applyEncumbranceOnDerivated(data) {
    let actor = data.actor;
    let actorData = actor.system;

    const encumbrance = actorData.encumbrance.value;
    const limit = actorData.encumbrance.limit;
    if (encumbrance > 1.4 * limit) {
      //No dodge
      actorData.dodge.value = -100;
    }
    if (encumbrance > 2 * limit) {
      //No attack possible
      actorData.attack.value = -100;
    }
  }

  /////////////////////

  calculateSurplus(data) {
    let actor = data.actor;
    let actorData = actor.system;

    actorData.hp.surplus = -Math.floor(actorData.hp.valueMaxNative / 5);
    actorData.mp.surplus = -Math.floor(actorData.mp.valueMaxNative / 5);
  }

  checkExcessValues(data) {
    let actor = data.actor;
    let actorData = actor.system;

    //HP
    if (actorData.hp.valueMax < 0) actorData.hp.valueMax = 0;
    if (actorData.hp.value > actorData.hp.valueMax)
      actorData.hp.value = actorData.hp.valueMax;
    //MP
    if (actorData.mp.valueMax < 0) actorData.mp.valueMax = 0;
    if (actorData.mp.value > actorData.mp.valueMax)
      actorData.mp.value = actorData.mp.valueMax;
    if (actorData.mp.value < 0) actorData.mp.value = 0;

    //Attributes
    for (let [key, attribut] of Object.entries(actorData.attributes)) {
      if (attribut.value < 0) attribut.value = 0;
      if (attribut.value > 100) attribut.value = 100;
    }

    //Attack
    if (actorData.attack.value < 0) actorData.attack.value = 0;
    if (actorData.attack.value > 100) actorData.attack.value = 100;
    //Defence
    if (actorData.defence.value < -100) actorData.defence.value = -100;
    if (actorData.defence.value > 100) actorData.defence.value = 100;
    //Dodge
    if (actorData.dodge.value < 0) actorData.dodge.value = 0;
    if (actorData.dodge.value > 100) actorData.dodge.value = 100;

    //Food
    if (actorData.nutrition.foodNeededDay.value < 0)
      actorData.nutrition.foodNeededDay.value = 0;
    //Drink
    if (actorData.nutrition.drinkNeededDay.value < 0)
      actorData.nutrition.drinkNeededDay.value = 0;
  }

  updateWeaponsEffectiveValues(data) {
    const actor = data.actor;
    const weapons = data.weapons;
    const ammos = data.ammos;

    let count = 0;

    for (let [key, weapon] of Object.entries(weapons)) {
      let item = actor.items.get(weapon._id);

      if (!item.system.equipped) continue;

      let effectiveDamage = item.system.damage;
      let effectiveEffect = item.system.effect;
      let effectiveAttack = actor.system.attack.value + item.system.attackModif;
      //if the weapon is tagged as twin, cancel the ambidex malus
      if (actor.system.combatStyle == "ambidex" && item.system.twin)
        effectiveAttack += 20;
      if (effectiveAttack > 100) effectiveAttack = 100;

      if (item.system.useAmmo) {
        let ammo = ammos.filter(function (i) {
          return i._id == item.system.ammo;
        })[0];
        if (ammo) {
          effectiveDamage += "+" + ammo.system.damage;
          effectiveEffect += " " + ammo.system.effect;
        }
      } else if (actor.system.damageBonus.value != "") {
        effectiveDamage += "+" + actor.system.damageBonus.value;
      }

      item.update(
        {
          system: {
            effective: {
              damage: effectiveDamage,
              effect: effectiveEffect,
              attack: effectiveAttack,
            },
          },
        },
        { render: false }
      );
      count++;
    }

    //Update that does nothing to force rendering
    if (count > 0)
      actor.update({
        system: { attack: { value: actor.system.attack.value } },
      });
  }

  updateSpellEffectiveValues(data) {
    const actor = data.actor;
    const spells = data.spells;

    let count = 0;

    for (let [key, spell] of Object.entries(spells)) {
      let item = actor.items.get(spell._id);

      if (!item.system.memorized) continue;

      let effectivePower = item.system.power;
      if (actor.system.magic.power.value != "") {
        effectivePower += "+" + actor.system.magic.power.value;
      }
      let effectiveEffect = item.system.effect;
      let effectiveCost = item.system.cost;
      if (!item.system.useHP && actor.system.magic.mpReduc.value != 0)
        effectiveCost += "+" + actor.system.magic.mpReduc.value.toString();
      let effectiveLaunchRoll =
        actor.system.magic.roll.value + item.system.difficulty;
      let effectiveControlRoll = effectiveLaunchRoll;
      if (actor.system.magic.nInvoc.invoked > 1)
        effectiveControlRoll -=
          (actor.system.magic.nInvoc.invoked - 1) *
          actor.system.magic.nInvoc.controlDiffIncrease;
      if (effectiveLaunchRoll > 100) effectiveLaunchRoll = 100;
      if (effectiveControlRoll > 100) effectiveControlRoll = 100;

      item.update(
        {
          system: {
            effective: {
              power: effectivePower,
              effect: effectiveEffect,
              cost: effectiveCost,
              rollLaunch: effectiveLaunchRoll,
              rollControl: effectiveControlRoll,
            },
          },
        },
        { render: false }
      );
      count++;
    }

    //Update that does nothing to force rendering
    if (count > 0)
      actor.update({
        system: { magic: { roll: { value: actor.system.magic.roll.value } } },
      });
  }

  calculateInitiative(data) {
    let actor = data.actor;
    let actorData = actor.system;

    const physMult = 1 / 10,
      intelMult = 1 / 5;
    actorData.ini.ndice += Math.floor(
      physMult * actorData.attributes.physical.value
    );
    actorData.ini.dice = 8;
    actorData.ini.flat += Math.floor(
      intelMult * actorData.attributes.intel.value
    );
  }

  async _onDropItem(event, data) {
    return ActorOrc.onDropItem(event, data, this);
  }
}
