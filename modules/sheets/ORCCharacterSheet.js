import * as DiceOrc from "../commons/dice.js";
import * as ChatOrc from "../commons/chat.js";
import * as EnchantOrc from "../commons/enchant.js";
import * as ItemOrc from "../commons/item.js";
import * as ActorOrc from "../commons/actor.js";
import { ORC } from "../commons/config.js";


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
    html.find(".sheet-change-lock").click(ActorOrc.onSheetChangelock.bind(this));

    html.find(".ap-deploy").click(this._onAPDeploy.bind(this));
    html.find(".nutrition-deploy").click(this._onNutritionDeploy.bind(this));

    html.find(".spell-add").click(this._onSpellAdd.bind(this));
    html.find(".spell-remove").click(this._onSpellRemove.bind(this));
    html.find(".spell-activate").change(this._onSpellActivate.bind(this));
    html.find(".spell-increase-nmax").change(this._onSpellIncreaseMax.bind(this));
    
    html.find(".item-create").click(ItemOrc.onItemCreate.bind(this));
    html.find(".item-edit").click(ItemOrc.onItemEdit.bind(this));
    html.find(".item-delete").click(ItemOrc.onItemDelete.bind(this));
    html.find(".item-split").click(ItemOrc.onItemSplit.bind(this));

    html.find(".item-equipped").click(this._onItemEquipped.bind(this));
    html.find(".weapon-choose-ammo").change(this._onWeaponChooseAmmo.bind(this));
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

    html.find(".modifier-deploy").click(this._onModifierDeploy.bind(this));

    html.find(".bleed-roll").click(this._onBleedRoll.bind(this));
    html.find(".bleed-off").click(this._onBleedOff.bind(this));
    html.find(".poison-roll").click(this._onPoisonRoll.bind(this));
    html.find(".poison-off").click(this._onPoisonOff.bind(this));
    html.find(".burn-roll").click(this._onBurnRoll.bind(this));
    html.find(".burn-damage").click(this._onBurnDamage.bind(this));
    html.find(".burn-off").click(this._onBurnOff.bind(this));

    html.find(".new-day").click(this._onNewDay.bind(this));

    html.find(".attack-with-weapon-roll").click(this._onAttackWithWeaponRoll.bind(this));
    html.find(".enchant-deploy").click(EnchantOrc.onEnchantDeploy.bind(this));
    html.find(".enchant-roll").click(EnchantOrc.onEnchantRoll.bind(this));
    html.find(".enchant-activate").click(EnchantOrc.onEnchantActivate.bind(this));
    html.find(".item-consume").click(this._onItemConsume.bind(this));
    html.find(".consumable-deactivate").click(this._onConsumableDeactivate.bind(this));
    html.find(".consumable-activable-deploy").click(ItemOrc.onConsumableDeploy.bind(this));
    html.find(".consumable-activable-reduce-duration").click(this._onConsumableReduceDuration.bind(this));
    html.find(".enchant-reduce-duration").click(EnchantOrc._onEnchantReduceDuration.bind(this));
    html.find(".capacity-activable-reduce-duration").click(this._onCapacityReduceDuration.bind(this));
    html.find(".capacity-activable-activate").click(this._onCapacityActivate.bind(this));
    html.find(".capacity-activable-deactivate").click(this._onCapacityDeactivate.bind(this));
    html.find(".capacity-choose-weapon").change(this._onCapacityChooseWeapon.bind(this));
    html.find(".weapon-choose-attribute").change(this._onWeaponChooseAttribute.bind(this));

    html.find(".capacity-status-resist-roll").click(this._onCapacityStatusResistRoll.bind(this));

    html.find(".launch-spell-roll").click(this._onLaunchSpellRoll.bind(this));

    html.find(".wound-deploy").click(ItemOrc.onWoundDeploy.bind(this));

    super.activateListeners(html);
  }

  async _onAPDeploy(event) {
    event.preventDefault();

    let actor = this.actor;
    let data = this.getData();   //Ensure that the actor is correclty initialized

    return actor.update({
      system: { ap: { optionDeploy: !actor.system.ap.optionDeploy } },
    });
  }

  async _onModifierDeploy(event) {
    event.preventDefault();

    let actor = this.actor;
    let data = this.getData();   //Ensure that the actor is correclty initialized

    return actor.update({
      system: { modifiers: { deploy: !actor.system.modifiers.deploy } },
    });
  }

  async _onNutritionDeploy(event) {
    event.preventDefault();

    let actor = this.actor;
    let data = this.getData();   //Ensure that the actor is correclty initialized

    return actor.update({
      system: {
        nutrition: { optionDeploy: !actor.system.nutrition.optionDeploy },
      },
    });
  }

  _onSpellAdd(event) {
    event.preventDefault();
    let actor = this.actor;
    let data = this.getData();   //Ensure that the actor is correclty initialized
    let type = event.currentTarget.dataset.type;

    if(type == ORC.spellType.base){
      let array = actor.system.magic.actives.bases.array;
      if(array.length >= actor.system.magic.actives.bases.nmax) return;
      array.push("");
      return actor.update({system: {magic: {actives: {bases: {array: array}}}}});
    }
    if(type == ORC.spellType.shape){
      let array = actor.system.magic.actives.shapes.array;
      if(array.length >= actor.system.magic.actives.shapes.nmax) return;
      array.push("");
      return actor.update({system: {magic: {actives: {shapes: {array: array}}}}});
    }
    if(type == ORC.spellType.power){
      let array = actor.system.magic.actives.powers.array;
      if(array.length >= actor.system.magic.actives.powers.nmax) return;
      array.push("");
      return actor.update({system: {magic: {actives: {powers: {array: array}}}}});
    }
    if(type == ORC.spellType.modif){
      let array = actor.system.magic.actives.modifs.array;
      if(array.length >= actor.system.magic.actives.modifs.nmax) return;
      array.push("");
      return actor.update({system: {magic: {actives: {modifs: {array: array}}}}});
    }
  }

  _onSpellRemove(event) {
    event.preventDefault();
    let actor = this.actor;
    let data = this.getData();   //Ensure that the actor is correclty initialized
    let type = event.currentTarget.dataset.type;

    if(type == ORC.spellType.base){
      let array = actor.system.magic.actives.bases.array;
      array.pop();
      return actor.update({system: {magic: {actives: {bases: {array: array}}}}});
    }
    if(type == ORC.spellType.shape){
      let array = actor.system.magic.actives.shapes.array;
      array.pop();
      return actor.update({system: {magic: {actives: {shapes: {array: array}}}}});
    }
    if(type == ORC.spellType.power){
      let array = actor.system.magic.actives.powers.array;
      array.pop();
      return actor.update({system: {magic: {actives: {powers: {array: array}}}}});
    }
    if(type == ORC.spellType.modif){
      let array = actor.system.magic.actives.modifs.array;
      array.pop();
      return actor.update({system: {magic: {actives: {modifs: {array: array}}}}});
    }
  }

  _onSpellIncreaseMax(event) {
    event.preventDefault();
    let actor = this.actor;
    let data = this.getData();   //Ensure that the actor is correclty initialized
    let type = event.currentTarget.dataset.type;

    let nmax = event.currentTarget.value;

    if(type == ORC.spellType.base){
      return actor.update({system: {magic: {actives: {bases: {nmax: nmax}}}}});
    }
    if(type == ORC.spellType.shape){
      return actor.update({system: {magic: {actives: {shapes: {nmax: nmax}}}}});
    }
    if(type == ORC.spellType.power){
      return actor.update({system: {magic: {actives: {powers: {nmax: nmax}}}}});
    }
    if(type == ORC.spellType.modif){
      return actor.update({system: {magic: {actives: {modifs: {nmax: nmax}}}}});
    }
  }


  _onSpellActivate(event){
    event.preventDefault();
    let actor = this.actor;
    let data = this.getData();   //Ensure that the actor is correclty initialized
    let type = event.currentTarget.name;
    let value = event.currentTarget.value;

    if(type == ORC.spellType.base){
      let array = actor.system.magic.actives.bases.array;
      let length = array.length;
      array[length-1] = value;
      return actor.update({system: {magic: {actives: {bases: {array: array}}}}});
    }
    if(type == ORC.spellType.shape){
      let array = actor.system.magic.actives.shapes.array;
      let length = array.length;
      array[length-1] = value;
      return actor.update({system: {magic: {actives: {shapes: {array: array}}}}});
    }
    if(type == ORC.spellType.power){
      let array = actor.system.magic.actives.powers.array;
      let length = array.length;
      array[length-1] = value;
      return actor.update({system: {magic: {actives: {powers: {array: array}}}}});
    }
    if(type == ORC.spellType.modif){
      let array = actor.system.magic.actives.modifs.array;
      let length = array.length;
      array[length-1] = value;
      return actor.update({system: {magic: {actives: {modifs: {array: array}}}}});
    }
  }

  _onWeaponChooseAttribute(event) {
    event.preventDefault();
    let actor = this.actor;
    let data = this.getData();   //Ensure that the actor is correclty initialized
    let element = event.currentTarget;
    let weaponid = event.currentTarget.dataset.weaponid;
    if(weaponid == null)
      weaponid = element.closest(".item").dataset.itemId;
    let item = actor.items.get(weaponid);
    if (item.type != "weapon") return;

    let maj = { system: { effective: { attribut: event.currentTarget.value } } };
    return item.update(maj);
  }

  _onItemEquipped(event) {
    event.preventDefault();
    let actor = this.actor;
    let data = this.getData();   //Ensure that the actor is correclty initialized
    let element = event.currentTarget;
    let itemId = element.closest(".item").dataset.itemId;
    let item = actor.items.get(itemId);
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

  _onArmorEquipped(event) {
    event.preventDefault();
    let actor = this.actor;
    let data = this.getData();   //Ensure that the actor is correclty initialized
    let element = event.currentTarget;
    let itemId = element.value;
    let items = actor.items;

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
    let actor = this.actor;
    let data = this.getData();   //Ensure that the actor is correclty initialized
    let element = event.currentTarget;
    let weaponid = event.currentTarget.dataset.weaponid;
    if(weaponid == null)
      weaponid = element.closest(".item").dataset.itemId;
    let item = actor.items.get(weaponid);
    if (item.type != "weapon") return;

    let maj = { system: { ammo: event.currentTarget.value } };
    return item.update(maj);
  }

  _onArmorUpdateAP(event) {
    event.preventDefault();
    let actor = this.actor;
    let data = this.getData();   //Ensure that the actor is correclty initialized
    let element = event.currentTarget;
    let itemId = element.closest(".item").dataset.itemId;
    let item = actor.items.get(itemId);
    if (item.type != "armor") return;

    let maj = { system: { ap: parseFloat(event.currentTarget.value) } };
    return item.update(maj);
  }

  _onTakeDamage(event) {
    event.preventDefault();
    let actor = this.actor;
    let data = this.getData();   //Ensure that the actor is correclty initialized
    
    const damage = event.currentTarget.dataset.damage;
    const applyArmor = event.currentTarget.dataset.applyarmor === "true";
    const applyNativeArmor = event.currentTarget.dataset.applynativearmor === "true";
    const onMP = event.currentTarget.dataset.onmp === "true";
    if (!damage) return;
    this.takeDamage({
      damageFormula: damage,
      applyArmor: applyArmor,
      applyNativeArmor: applyNativeArmor,
      onMP: onMP,
      resistance: actor.system.resistances.general, 
      vulnerability: actor.system.vulnerabilities.general,
    });
  }

  _onTakeDamageArmor(event) {
    event.preventDefault();
    let actor = this.actor;
    let data = this.getData();   //Ensure that the actor is correclty initialized

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
    event.preventDefault();
    let actor = this.actor;
    let data = this.getData();   //Ensure that the actor is correclty initialized

    const heal = event.currentTarget.dataset.heal;
    const multiplier = event.currentTarget.dataset.multiplier;
    if (!heal || !multiplier) return;
    this.takeHeal({ healFormula: heal, multiplier: multiplier });
  }

  _onRecoverMP(event) {
    event.preventDefault();
    let actor = this.actor;
    let data = this.getData();   //Ensure that the actor is correclty initialized

    const heal = event.currentTarget.dataset.heal;
    if (!heal) return;
    this.takeHeal({ healFormula: heal, onMP: true });
  }

  async _onAttributeRoll(event) {
    event.preventDefault();
    let actor = this.actor;
    let data = this.getData();   //Ensure that the actor is correclty initialized

    let costmp = event.currentTarget.dataset.costmp;
    if(costmp != null){
      let newMP = actor.system.mp.value - costmp;
      if (newMP < 0) return;
      actor.update({system: {mp: {value: newMP}}});
    }

    DiceOrc.AttributeRoll({
      actor: this.actor,
      attribute: event.currentTarget.dataset,
      modif: this.actor.system.modifAllAttributes,
    });

    //Consume enchant and capacity on roll
    this.consumeOnRoll({ onRoll: true });
  }

  async _onAttackRoll(event) {
    event.preventDefault();
    let actor = this.actor;
    let data = this.getData();   //Ensure that the actor is correclty initialized

    let costmp = event.currentTarget.dataset.costmp;
    if(costmp != null){
      let newMP = actor.system.mp.value - costmp;
      if (newMP < 0) return;
      actor.update({system: {mp: {value: newMP}}});
    }

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
    event.preventDefault();
    let actor = this.actor;
    let data = this.getData();   //Ensure that the actor is correclty initialized

    DiceOrc.DodgeRoll({
      actor: this.actor,
      attribute: event.currentTarget.dataset,
      modif: this.actor.system.modifAllAttributes,
    });

    //Consume enchant and capacity on roll
    this.consumeOnRoll({ onRoll: true });
  }

  async _onDamageRoll(event) {
    event.preventDefault();
    let actor = this.actor;
    let data = this.getData();   //Ensure that the actor is correclty initialized
    
    DiceOrc.DamageRoll({
      actor: actor,
      attribute: event.currentTarget.dataset,
    });
  }

  async _onPoisonRoll(event) {
    event.preventDefault();
    let actor = this.actor;
    let data = this.getData();   //Ensure that the actor is correclty initialized
    
    let damage = DiceOrc.BleedPoisonRoll({
      actor: actor,
      type: event.currentTarget.dataset.type,
    });
    await this.takeDamage({
      damageFormula: damage,
      resistance: actor.system.resistances.poison, 
      vulnerability: actor.system.vulnerabilities.poison,
    });
    await actor.update({ system: { status: { poison: this.actor.system.status.poison - 1 } } });
  }

  async _onBleedRoll(event) {
    event.preventDefault();
    let actor = this.actor;
    let data = this.getData();   //Ensure that the actor is correclty initialized
    
    let damage = DiceOrc.BleedPoisonRoll({
      actor: actor,
      type: event.currentTarget.dataset.type,
    });
    await this.takeDamage({
      damageFormula: damage,
      resistance: actor.system.resistances.bleed, 
      vulnerability: actor.system.vulnerabilities.bleed,
    });
  }

  async _onBurnRoll(event) {
    event.preventDefault();
    let actor = this.actor;
    let data = this.getData();   //Ensure that the actor is correclty initialized
    
    const rollResult = DiceOrc.BurnRoll({
      actor: actor,
    });

    //If it rolls a 100, the burn stacks are removed
    if (rollResult == 100) {
      this._onBurnOff(event);
      return;
      //If it rolls a value lower than the number of stacks, the character catches fire.
    } else if (rollResult <= actor.system.status.burn) {
      let maj = { system: { status: { onfire: true } } };
      await actor.update(maj);
    }
    return rollResult;
  }

  async _onBleedOff(event) {
    event.preventDefault();
    let actor = this.actor;
    let data = this.getData();   //Ensure that the actor is correclty initialized

    await actor.update({ system: { status: { bleed: 0 } } });
    return;
  }

  async _onPoisonOff(event) {
    event.preventDefault();
    let actor = this.actor;
    let data = this.getData();   //Ensure that the actor is correclty initialized

    await actor.update({ system: { status: { poison: 0 } } });
    return;
  }

  async _onBurnOff(event) {
    event.preventDefault();
    let actor = this.actor;
    let data = this.getData();   //Ensure that the actor is correclty initialized

    await actor.update({ system: { status: { burn: 0, onfire: false } } });
    return;
  }

  async _onBurnDamage(event) {
    event.preventDefault();
    let actor = this.actor;
    let data = this.getData();   //Ensure that the actor is correclty initialized
    
    let damage = actor.system.status.burn;
    await this.takeDamage({
      damageFormula: damage,
      applyArmor: true,
      resistance: actor.system.resistances.fire, 
      vulnerability: actor.system.vulnerabilities.fire,
    });

    //Add 5 burn stacks
    await this.actor.update({ system: { status: { burn: damage + 5 } } });

    return;
  }

  async _onNewDay(event) {
    event.preventDefault();

    this.newDay();
    return;
  }

  async _onAttackWithWeaponRoll(event) {
    event.preventDefault();
    let actor = this.actor;
    let data = this.getData();   //Ensure that the actor is correclty initialized

    let costmp = event.currentTarget.dataset.costmp;
    if(costmp != null){
      let newMP = actor.system.mp.value - costmp;
      if (newMP < 0) return;
      actor.update({system: {mp: {value: newMP}}});
    }

    //Recover the weapon
    const weapon = actor.items
      .filter(function (item) {
        return item.type == "weapon";
      })
      .filter(function (item) {
        return item._id == event.currentTarget.dataset.weaponid;
      })[0];

    //Recover the ammo
    const ammo = actor.items
    .filter(function (item) {
      return item.type == "ammo";
    })
    .filter(function (item) {
      return item._id == weapon.system.ammo;
    })[0];
    if(weapon.system.useAmmo){
      if(ammo == null) //Range weapon without ammo
        return;
      else if(ammo.system.stock < event.currentTarget.dataset.nammo)  //Range weapon with not enough ammo in stock
        return;
    }

    //Do the rolls
    let critical = null;
    if (await DiceOrc.AttackRoll({
          actor: actor,
          attribute: event.currentTarget.dataset,
          modif: actor.system.modifAllAttributes,
        }) 
        <= actor.system.roll.limitCritical)
      critical = 1;
    await DiceOrc.DamageRoll({
      actor: actor,
      attribute: event.currentTarget.dataset,
      critical: critical
    });
    
    //Consume enchant and capacity on attack
    this.consumeOnRoll({ onAttack: true });

    return;
  }

  async _onLaunchSpellRoll(event) {
    event.preventDefault();
    let actor = this.actor;
    let data = this.getData();   //Ensure that the actor is correclty initialized

    //Do the roll
    await DiceOrc.SpellRoll({
      actor: actor,
      attribute: event.currentTarget.dataset,
      modif: actor.system.modifAllAttributes,
    });

    //Consume enchant and capacity on spell
    this.consumeOnRoll({ onSpell: true });

    return;
  }

  async _onItemConsume(event) {
    event.preventDefault();
    let actor = this.actor;
    let data = this.getData();   //Ensure that the actor is correclty initialized
    
    //Retrive the actor and the item
    let element = event.currentTarget;
    let itemId = element.closest(".item").dataset.itemId;
    let actorData = actor.system;
    let item = actor.items.get(itemId);
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
      tipsiness: actorData.nutrition.tips.value,
      poison: actorData.status.poison,
    };
    if (item.type == "food") {
      if (itemData.type.food) newValues.foodDay += 1;
      if (itemData.type.drink) newValues.drinkDay += 1;
    }
    //Do a strengh roll and increase the actor tipsiness in case of failure
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
      await this.takeDamage({ damageFormula: itemData.damage});
    if (itemData.damageMP != null && itemData.damageMP != "")
      await this.takeDamage({ damageFormula: itemData.damageMP, onMP: true });

    //Update the actor
    await actor.update({
      system: {
        nutrition: {
          tips: {value: newValues.tipsiness},
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
    let actor = this.actor;
    let data = this.getData();   //Ensure that the actor is correclty initialized
    
    //Retrive the item
    let item = actor.items.get(event.currentTarget.dataset.itemid);
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
    let actor = this.actor;
    let data = this.getData();   //Ensure that the actor is correclty initialized
    //Retrive the item
    let item = actor.items.get(event.currentTarget.dataset.itemid);
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
    let actor = this.actor;
    let data = this.getData();   //Ensure that the actor is correclty initialized
    let element = event.currentTarget;
    let itemId = element.closest(".item").dataset.itemId;
    let item = actor.items.get(itemId);
    if (item.type != "capacity") return;

    let maj = { system: { weaponLocal: event.currentTarget.value } };
    return item.update(maj);
  }

  _onCapacityStatusResistRoll(event) {
    let actor = this.actor;
    let data = this.getData();   //Ensure that the actor is correclty initialized
    let actorData = actor.system;

    let costmp = event.currentTarget.dataset.costmp;
    if(costmp != null){
      let newMP = actor.system.mp.value - costmp;
      if (newMP < 0) return;
      actor.update({system: {mp: {value: newMP}}});
    }

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
    let actor = this.actor;
    let data = this.getData();   //Ensure that the actor is correclty initialized
    //Retrive the item
    let element = event.currentTarget;
    let itemId = element.closest(".item").dataset.itemId;
    let item = actor.items.get(itemId);
    if (item.type != "consumable") return;
    let itemData = item.system;
    if (!itemData.isActivable || !itemData.ifActivable.activated) return;

    //Delete the item
    await item.delete();

    return;
  }

  async _onCapacityActivate(event) {
    event.preventDefault();
    let actor = this.actor;
    let data = this.getData();   //Ensure that the actor is correclty initialized
    let item = actor.items.get(event.currentTarget.dataset.itemid);
    //Does nothing if no item or no enchant has been found
    if (item == null) return;
    let itemData = item.system;
    if (!itemData.activeEffect == null) return;
    if (itemData.activated) return;

    let newMP = actor.system.mp.value - itemData.costMP;
    if (newMP < 0) return;
    actor.update({system: {mp: {value: newMP}}});

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
    let actor = this.actor;
    let data = this.getData();   //Ensure that the actor is correclty initialized
    //Retrive the item
    let element = event.currentTarget;
    let itemId = element.closest(".item").dataset.itemId;
    let item = actor.items.get(itemId);

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
    for (let [key, it] of Object.entries(items)) {
      let item = actor.items.get(it._id);
      let itemData = item.system;

      let enchant = itemData.enchant;
      if (
        itemData.equipped &&
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
          );
        else
          item.update(
            {
              system: { enchant: { use: { durationEffective: newDuration } } },
            },
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
          );
        else
          item.update(
            {
              system: { ifActivable: { durationEffective: newDuration } },
            },
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
          //item.update( { system: { ifActivable: { activated: false } } } );
          item.delete();
        else
         item.update(
            {
              system: { ifActivable: { duration: newDuration } },
            },
          );
      }
    }

    return;
  }

  async takeDamage({
    damageFormula,
    applyArmor = false,
    applyNativeArmor = false,
    onMP = false,
    onArmor = { validate: false, armorId: "" },
    limitValue = -1000,
    resistance = false,
    vulnerability = false,
  }) {
    //Recover the actor informations
    let actor = this.actor;
    let actorData = actor.system;
    let data = this.getData();   //Ensure that the actor is correclty initialized

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
    else if(applyNativeArmor) damage -= actorData.ap.native;
    if (damage <= 0) return;

    //Apply possible resistance or vulnerability
    if(resistance)
      damage /= 2;
    else if(vulnerability)
      damage *= 2; 


    //Take the lowest integer 
    damage = Math.floor(damage);

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
            applyNativeArmor: false,
            onMP: false,
            resistance: resistance,
            vulnerability: vulnerability,
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
    let data = this.getData();   //Ensure that the actor is correclty initialized
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

  newDay() {
    let actor = this.actor;
    let items = this.getData().items;

    //Update the owned items
    for (let [key, it] of Object.entries(items)) {
      let item = actor.items.get(it._id);
      //Deactivate and reset enchants
      if (item.system.enchant != null) {
        if (
          item.system.enchant.activeEffect &&
          item.system.enchant.use.perDay > 0
        ) {
          item.update(
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
          );
        }
      }
      //Deactivate capacities
      if (
        item.type == "capacity" &&
        item.system.activeEffect &&
        item.system.ifActivable.activated
      ) {
        item.update(
          {
            system: {
              ifActivable: {
                activated: item.system.ifActivable.disableOnNewDay
                  ? false
                  : true,
              },
            },
          },
        );
      }

      //Delete activated consumables
      if (
        item.type == "consumable" &&
        item.system.ifActivable.activated &&
        item.system.ifActivable.disableOnNewDay
      ) {
        item.delete();
      }
    }

    //Update the actor
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
          tips: {value: 0},
        },
      },
    });

    return;
  }

  /**
   * Calculate the actor derived values
   */
  async _prepareCharacterData(data) {
    this.initPrincipaleValues(data);

    this.applyAttributModifiers(data);

    this.applyItemsOnPrincipales(data);
    this.applyNutrition(data);
    this.applyCapacities(data);

    this.initEncumbrance(data);
    this.applyItemsOnEncumbranceLimit(data);
    this.applyEncumbranceOnPrincipales(data);

    this.initDerivatedValues(data);
    this.applyItemsOnDerivated(data);
    this.applyEncumbranceOnDerivated(data);

    this.applyCombatStyle(data);
    this.applyModifiers(data);

    //Calculate the HP and MP surplus
    this.calculateSurplus(data);

    //Check if some effective values are higher the minimal or the maximal allowed values
    this.checkExcessValues(data);

    //Update the owned weapon effective values (damage, effect and attack)
    this.updateWeaponsEffectiveValues(data);

    //Update the current spell effective values (damage, effect and attack)
    this.updateSpellEffectiveValues(data);

    //Calculate the initative bonus
    this.calculateInitiative(data);

    //Delete items with 0 stock
    ActorOrc.removeItemsWithoutStock(data);

    return;
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
    for (let [key, attribut] of Object.entries(actorData.attributes)){
      attribut.value = attribut.native;
    }
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
    //Magic damage and heal bonus
    magic.powerModif = "";
    //MP reduction
    magic.mpReduc = 0;

    //Roll limits
    //Critical
    actorData.roll.limitCritical = 1;
    //Fumble
    actorData.roll.limitFumble = 100;

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

  applyAttributModifiers(data){
    let actor = data.actor;
    let actorData = actor.system;

    actorData.attributes.strengh.value += actorData.modifiers.attr.strengh;
    actorData.attributes.dexterity.value += actorData.modifiers.attr.dexterity;
    actorData.attributes.perception.value += actorData.modifiers.attr.perception;
    actorData.attributes.social.value += actorData.modifiers.attr.social;
    actorData.attributes.intel.value += actorData.modifiers.attr.intel;
  }

  applyCombatStyle(data) {
    let actor = data.actor;
    let actorData = actor.system;
    const style = actorData.combatStyle.style;

    actorData.combatStyle.attack = 0;
    actorData.combatStyle.defence = 0;
    actorData.combatStyle.dodge = 0;
    actorData.combatStyle.damageBonus = "";

    if (style === "standard") {
      actorData.damageBonus.value += "";
    } else if (style === "offensive") {
      actorData.combatStyle.attack = 10;
      actorData.combatStyle.defence = -15;
    } else if (style === "defensive") {
      actorData.combatStyle.attack = -15;
      actorData.combatStyle.defence = 10;
    } else if (style === "dodge") {
      actorData.combatStyle.attack = -15;
      actorData.combatStyle.defence = -10;
      actorData.dodge.enable = true;
    } else if (style === "aggressive") {
      actorData.combatStyle.attack = -10;
      actorData.combatStyle.defence = -15;
      actorData.combatStyle.damageBonus = "2d10";
    } else if (style === "ambidex") {
      actorData.combatStyle.attack = -20;
    }

    actorData.attack.value += actorData.combatStyle.attack;
    actorData.defence.value += actorData.combatStyle.defence;
    actorData.dodge.value += actorData.combatStyle.dodge;
    if(actorData.combatStyle.damageBonus != "")
      if(actorData.damageBonus.value == "")
        actorData.damageBonus.value += actorData.combatStyle.damageBonus;
      else
        actorData.damageBonus.value += "+" + actorData.combatStyle.damageBonus;
  }

  applyModifiers(data) {
    let actor = data.actor;
    let actorData = actor.system;

    actorData.attack.value += actorData.modifiers.attack;
    actorData.magic.roll.value += actorData.modifiers.magicRoll;
    actorData.defence.value += actorData.modifiers.defence;
    actorData.dodge.value += actorData.modifiers.dodge;

    if(actorData.modifiers.damageBonus != "")
      if(actorData.damageBonus.value == "")
        actorData.damageBonus.value += actorData.modifiers.damageBonus;
      else
        actorData.damageBonus.value += "+" + actorData.modifiers.damageBonus;

    if(actorData.modifiers.powerBonus != "")
      if(actorData.magic.powerModif == "")
        actorData.magic.powerModif += actorData.modifiers.powerBonus;
      else
        actorData.magic.powerModif += "+" + actorData.modifiers.powerBonus;

    actorData.ini.flat += actorData.modifiers.initiative;
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
          if (actorData.magic.powerModif == "")
            actorData.magic.powerModif += itemData.magicPower;
          else actorData.magic.powerModif += "+" + itemData.magicPower;
        actorData.magic.mpReduc += itemData.mpReduc;
      }

      //Activated consumables
      if (item.type == "consumable") {
        if (itemData.isActivable && itemData.ifActivable.activated) {
          const effect = itemData.ifActivable;
          actorData.attributes.strengh.value += effect.strenghModif;
          actorData.attributes.dexterity.value += effect.dexterityModif;
          actorData.attributes.perception.value += effect.perceptionModif;
          actorData.attributes.social.value += effect.socialModif;
          actorData.attributes.intel.value += effect.intelModif;
          actorData.hp.valueMax += effect.hpMaxModif;
          actorData.mp.valueMax += effect.mpMaxModif;
          actorData.ap.value += effect.apModif;

          actorData.defence.value += effect.defenceModif;
          actorData.roll.limitCritical += effect.limitCriticalModif;
          actorData.roll.limitFumble += effect.limitFumbleModif;
          actorData.ini.flat += effect.initiativeModif;

          if(effect.damageBonusModif !== "") {
            if (actorData.damageBonus.value == "")
              actorData.damageBonus.value += effect.damageBonusModif;
            else actorData.damageBonus.value += "+" + effect.damageBonusModif;
          }
          if(effect.magicPower!== "") {
            if (actorData.magic.powerModif == "")
              actorData.magic.powerModif += effect.magicPower;
            else actorData.magic.powerModif += "+" + effect.magicPower;
          }
          actorData.magic.mpReduc += effect.mpReduc;
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
        if(enchant.strenghModif)
          actorData.attributes.strengh.value += enchant.strenghModif;
        if(enchant.dexterityModif)
         actorData.attributes.dexterity.value += enchant.dexterityModif;
        if(enchant.perceptionModif)
          actorData.attributes.perception.value += enchant.perceptionModif;
        if(enchant.socialModif)
          actorData.attributes.social.value += enchant.socialModif;
        if(enchant.intelModif)
          actorData.attributes.intel.value += enchant.intelModif;
        if(enchant.hpMaxModif)
        actorData.hp.valueMax += enchant.hpMaxModif;
        if(enchant.mpMaxModif)
        actorData.mp.valueMax += enchant.mpMaxModif;
        if(enchant.apModif)
          actorData.ap.value += enchant.apModif;

        if(enchant.dexterityModif)
        actorData.defence.value += enchant.defenceModif;

        if(enchant.limitCriticalModif)
          actorData.roll.limitCritical += enchant.limitCriticalModif;

        if(enchant.limitFumbleModif)
          actorData.roll.limitFumble += enchant.limitFumbleModif;

        if(enchant.initiativeModif)
          actorData.ini.flat += enchant.initiativeModif;
        if(enchant.foodNeededDayModif)
          actorData.nutrition.foodNeededDay.value += enchant.foodNeededDayModif;
        if(enchant.drinkNeededDayModif)
          actorData.nutrition.drinkNeededDay.value += enchant.drinkNeededDayModif;
        if(enchant.damageBonusModif !== ""){
          if (actorData.damageBonus.value == "")
            actorData.damageBonus.value += enchant.damageBonusModif;
          else actorData.damageBonus.value += "+" + enchant.damageBonusModif;
        }

        if(enchant.magicPower !== ""){
          if (actorData.magic.powerModif == "")
            actorData.magic.powerModif += enchant.magicPower;
          else actorData.magic.powerModif += "+" + enchant.magicPower;
        }
        if(enchant.mpReduc)
          actorData.magic.mpReduc += enchant.mpReduc;
      }

      //Wounds
      if (item.type == "wound") {
        if(itemData.strenghModif)
          actorData.attributes.strengh.value += itemData.strenghModif;
        if(itemData.dexterityModif)
          actorData.attributes.dexterity.value += itemData.dexterityModif;
        if(itemData.perceptionModif)
          actorData.attributes.perception.value += itemData.perceptionModif;
        if(itemData.socialModif)
          actorData.attributes.social.value += itemData.socialModif;
        if(itemData.intelModif)
          actorData.attributes.intel.value += itemData.intelModif;
        if(itemData.hpMaxModif)
          actorData.hp.valueMax += itemData.hpMaxModif;
        if(itemData.mpMaxModif)
          actorData.mp.valueMax += itemData.mpMaxModif;
        if(itemData.foodNeededDayModif)
          actorData.nutrition.foodNeededDay.value += itemData.foodNeededDayModif;
        if(itemData.drinkNeededDayModif)
          actorData.nutrition.drinkNeededDay.value += itemData.drinkNeededDayModif;
        if(itemData.damageBonusModif != ""){
          if (actorData.damageBonus.value == "")
            actorData.damageBonus.value += itemData.damageBonusModif;
          else actorData.damageBonus.value += "+" + itemData.damageBonusModif;
        }
      }
    }

    //Round the encumbrance
    actorData.encumbrance.value =
      Math.floor(actorData.encumbrance.value * 100) / 100;
  }

  applyNutrition(data) {
    this.initNutritionMalus(data);

    let actor = data.actor;
    let actorData = actor.system;

    const food = actorData.nutrition.foodDay;
    const foodNedeed = actorData.nutrition.foodNeededDay.value;
    if (food == foodNedeed + 4) {
      actorData.nutrition.foodNeededDay.malus.social = -5;
      actorData.nutrition.foodNeededDay.malus.intel = -5;
    } else if (food > foodNedeed + 4) {
      actorData.nutrition.foodNeededDay.malus.strengh = -10 * (food - (foodNedeed + 4));
      actorData.nutrition.foodNeededDay.malus.dexterity = -10 * (food - (foodNedeed + 4));
      actorData.nutrition.foodNeededDay.malus.social = -10;
      actorData.nutrition.foodNeededDay.malus.intel = -10 * (food - (foodNedeed + 4));
    } else if (food < 0) {
      if (food == -1) {
        actorData.nutrition.foodNeededDay.malus.strengh = -5;
        actorData.nutrition.foodNeededDay.malus.dexterity = -5;
      } else if (food == -2) {
        actorData.nutrition.foodNeededDay.malus.strengh = -10;
        actorData.nutrition.foodNeededDay.malus.dexterity = -10;
      } else if (food == -3) {
        actorData.nutrition.foodNeededDay.malus.strengh = -20;
        actorData.nutrition.foodNeededDay.malus.dexterity = -20;
      } else if (food <= -4) {
        actorData.nutrition.foodNeededDay.malus.strengh = -40;
        actorData.nutrition.foodNeededDay.malus.dexterity = -40;
        actorData.nutrition.foodNeededDay.malus.hpMax = 10 * (food + 3);
      }
    }
    actorData.attributes.strengh.value += actorData.nutrition.foodNeededDay.malus.strengh;
    actorData.attributes.dexterity.value += actorData.nutrition.foodNeededDay.malus.dexterity;
    actorData.attributes.perception.value += actorData.nutrition.foodNeededDay.malus.perception;
    actorData.attributes.social.value += actorData.nutrition.foodNeededDay.malus.social;
    actorData.attributes.intel.value += actorData.nutrition.foodNeededDay.malus.intel;
    actorData.hp.valueMax += actorData.nutrition.foodNeededDay.malus.hpMax;
    actorData.mp.valueMax += actorData.nutrition.foodNeededDay.malus.mpMax;

    const drink = actorData.nutrition.drinkDay;
    const drinkNedeed = actorData.nutrition.drinkNeededDay.value;
    if (drink >= drinkNedeed + 4){
      actorData.nutrition.drinkNeededDay.malus.strengh = -5 * (drink - (drinkNedeed + 3));
      actorData.nutrition.drinkNeededDay.malus.dexterity = -5 * (drink - (drinkNedeed + 3));
    }
    if (drink > drinkNedeed + 4) {
      actorData.nutrition.drinkNeededDay.malus.intel = -10 * (drink - (drinkNedeed + 4));
      actorData.nutrition.drinkNeededDay.malus.hpMax = -10 * (drink - (drinkNedeed + 4));
    } else if (drink < 0) {
      if (drink == -1) {
        actorData.nutrition.drinkNeededDay.malus.strengh = -10;
        actorData.nutrition.drinkNeededDay.malus.dexterity = -10;
        actorData.nutrition.drinkNeededDay.malus.mpMax = -2;
      } else if (drink == -2) {
        actorData.nutrition.drinkNeededDay.malus.strengh = -20;
        actorData.nutrition.drinkNeededDay.malus.dexterity = -20;
        actorData.nutrition.drinkNeededDay.malus.hpMax = -10;
        actorData.nutrition.drinkNeededDay.malus.mpMax = -5;
      } else if (drink == -3) {
        actorData.nutrition.drinkNeededDay.malus.strengh = -30;
        actorData.nutrition.drinkNeededDay.malus.dexterity = -30;
        actorData.nutrition.drinkNeededDay.malus.hpMax = -20;
        actorData.nutrition.drinkNeededDay.malus.mpMax = -10;
      } else if (drink <= -4) {
        actorData.hp.value = actorData.hp.surplus;
      }
    }
    actorData.attributes.strengh.value += actorData.nutrition.drinkNeededDay.malus.strengh;
    actorData.attributes.dexterity.value += actorData.nutrition.drinkNeededDay.malus.dexterity;
    actorData.attributes.perception.value += actorData.nutrition.drinkNeededDay.malus.perception;
    actorData.attributes.social.value += actorData.nutrition.drinkNeededDay.malus.social;
    actorData.attributes.intel.value += actorData.nutrition.drinkNeededDay.malus.intel;
    actorData.hp.valueMax += actorData.nutrition.drinkNeededDay.malus.hpMax;
    actorData.mp.valueMax += actorData.nutrition.drinkNeededDay.malus.mpMax;

    const tipsiness = actorData.nutrition.tips.value;
    if (tipsiness > 0) {
      if (tipsiness == 1) {
        actorData.nutrition.tips.malus.social = +5;
        actorData.nutrition.tips.malus.perception = -5;
        actorData.nutrition.tips.malus.intel = -5;
      } else if (tipsiness == 2) {
        actorData.nutrition.tips.malus.social = +10;
        actorData.nutrition.tips.malus.perception = -10;
        actorData.nutrition.tips.malus.intel = -10;
      } else if (tipsiness >= 3) {
        actorData.nutrition.tips.malus.social = -5 * (tipsiness - 1);
        actorData.nutrition.tips.malus.perception = -10 * (tipsiness - 1);
        actorData.nutrition.tips.malus.intel = -10 * (tipsiness - 1);
      }
    }
    actorData.attributes.strengh.value += actorData.nutrition.tips.malus.strengh;
    actorData.attributes.dexterity.value += actorData.nutrition.tips.malus.dexterity;
    actorData.attributes.perception.value += actorData.nutrition.tips.malus.perception;
    actorData.attributes.social.value += actorData.nutrition.tips.malus.social;
    actorData.attributes.intel.value += actorData.nutrition.tips.malus.intel;
    actorData.hp.valueMax += actorData.nutrition.tips.malus.hpMax;
    actorData.mp.valueMax += actorData.nutrition.tips.malus.mpMax;
  }

  initNutritionMalus(data){
    let actor = data.actor;
    let actorData = actor.system;
    let foodNeededDayMalus = actorData.nutrition.foodNeededDay.malus;
    let drinkNeededDayMalus = actorData.nutrition.drinkNeededDay.malus;
    let tipsinessMalus = actorData.nutrition.tips.malus;

    foodNeededDayMalus.strengh = 0;
    foodNeededDayMalus.dexterity = 0;
    foodNeededDayMalus.perception = 0;
    foodNeededDayMalus.social = 0;
    foodNeededDayMalus.intel = 0;
    foodNeededDayMalus.hpMax = 0;
    foodNeededDayMalus.mpMax = 0;

    drinkNeededDayMalus.strengh = 0;
    drinkNeededDayMalus.dexterity = 0;
    drinkNeededDayMalus.perception = 0;
    drinkNeededDayMalus.social = 0;
    drinkNeededDayMalus.intel = 0;
    drinkNeededDayMalus.hpMax = 0;
    drinkNeededDayMalus.mpMax = 0;

    tipsinessMalus.strengh = 0;
    tipsinessMalus.dexterity = 0;
    tipsinessMalus.perception = 0;
    tipsinessMalus.social = 0;
    tipsinessMalus.intel = 0;
    tipsinessMalus.hpMax = 0;
    tipsinessMalus.mpMax = 0;
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
        actorData.attributes.strengh.value += Math.floor(
          (actorData.hp.valueMax - actorData.hp.value) / 10
        );
        actorData.attributes.dexterity.value += Math.floor(
          (actorData.hp.valueMax - actorData.hp.value) / 10
        );
        //actorData.modifiers.attack += Math.floor(
        //  (actorData.hp.valueMax - actorData.hp.value) / 10
        //);
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

  initEncumbrance(data) {
    let actor = data.actor;
    let actorData = actor.system;

    //Encumbrance limit
    actorData.encumbrance.limit = Math.floor(
      actorData.attributes.strengh.value *
        actorData.encumbrance.limitMultiplier
    );
    //Minimal limit
    if (actorData.encumbrance.limit < 1)
      actorData.encumbrance.limit = 1

    //Malus
    actorData.encumbrance.malus.strengh = 0;
    actorData.encumbrance.malus.dexterity = 0;
    actorData.encumbrance.malus.perception = 0;
    actorData.encumbrance.malus.social = 0;
    actorData.encumbrance.malus.intel = 0;
    actorData.encumbrance.malus.defence = 0;
    actorData.encumbrance.malus.attack = 0;
    actorData.encumbrance.malus.dodge = 0;
    actorData.encumbrance.malus.foodNeededDay = 0;
    actorData.encumbrance.malus.drinkNeededDay = 0;
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
            actorData.encumbrance.limit += itemData.ifActivable.encumbranceLimitModif;

      //Add the enchant
      const enchant = itemData.enchant;
      if (enchant && enchant.activated)
          actorData.encumbrance.limit += enchant.encumbranceLimitModif;

      //Wounds
      if (item.type == "wound")
          actorData.encumbrance.limit += itemData.encumbranceLimitModif;
    }

    //Minimal limit
    if (actorData.encumbrance.limit < 1)
      actorData.encumbrance.limit = 1
  }

  applyEncumbranceOnPrincipales(data) {
    let actor = data.actor;
    let actorData = actor.system;

    const encumbrance = actorData.encumbrance.value;
    const limit = actorData.encumbrance.limit;
    if (encumbrance > 1 * limit) {
      //Malus in dexterity
      actorData.encumbrance.malus.dexterity = -5 * Math.floor(10 * (encumbrance / limit - 1 + 0.1));
    }
    if (encumbrance > 1.2 * limit) {
      //Malus in defence
      actorData.encumbrance.malus.defence =  -5 * Math.floor(10 * (encumbrance / limit - 1.2 + 0.1));
    }
    if (encumbrance > 1.4 * limit) {
      actorData.encumbrance.malus.drinkNeededDay = 1;    
    }
    if (encumbrance > 1.6 * limit) {
      //Automatically hit
      actorData.encumbrance.malus.defence =  -100;    
      actorData.encumbrance.malus.foodNeededDay = 1;    
    }
    if (encumbrance > 1.8 * limit) {
      actorData.encumbrance.malus.drinkNeededDay = 2;    
    }

    actorData.attributes.strengh.value += actorData.encumbrance.malus.strengh;
    actorData.attributes.dexterity.value += actorData.encumbrance.malus.dexterity;
    actorData.attributes.perception.value += actorData.encumbrance.malus.perception;
    actorData.attributes.social.value += actorData.encumbrance.malus.social;
    actorData.attributes.intel.value += actorData.encumbrance.malus.intel;
    actorData.defence.value += actorData.encumbrance.malus.defence;
    actorData.nutrition.foodNeededDay.value += actorData.encumbrance.malus.foodNeededDay;
    actorData.nutrition.drinkNeededDay.value += actorData.encumbrance.malus.drinkNeededDay;
  }

  initDerivatedValues(data) {
    let actor = data.actor;
    let actorData = actor.system;

    const strengh = actorData.attributes.strengh.value;
    const dexterity = actorData.attributes.dexterity.value;
    const perception = actorData.attributes.perception.value;
    const intel = actorData.attributes.intel.value;
    const social = actorData.attributes.social.value;

    //Attack
    actorData.attack.value = actorData.attack.native;

    //Dodge
    actorData.dodge.native = dexterity;
    actorData.dodge.value = actorData.dodge.native;

    //Roll spell value
    if (actorData.magic.roll.attribut === "orc.character.attributes.strengh") 
      actorData.magic.roll.native = strengh;
    else if (actorData.magic.roll.attribut === "orc.character.attributes.dexterity") 
      actorData.magic.roll.native = dexterity;
    else if (actorData.magic.roll.attribut === "orc.character.attributes.perception") 
      actorData.magic.roll.native = perception;
    else if (actorData.magic.roll.attribut === "orc.character.attributes.intel") 
      actorData.magic.roll.native = intel;
    else if (actorData.magic.roll.attribut === "orc.character.attributes.social") 
      actorData.magic.roll.native = social;
    actorData.magic.roll.value = actorData.magic.roll.native;

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
      actorData.encumbrance.malus.dodge = -100;
    }
    if (encumbrance > 2 * limit) {
      //No attack possible
      actorData.encumbrance.malus.attack = -100;
    }

    actorData.dodge.value += actorData.encumbrance.malus.dodge;
    actorData.attack.value += actorData.encumbrance.malus.attack;
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
      //if (attribut.value > 100) attribut.value = 100;
    }

    //Attack
    if (actorData.attack.value < 0) actorData.attack.value = 0;
    //if (actorData.attack.value > 100) actorData.attack.value = 100;
    //Defence
    if (actorData.defence.value < -100) actorData.defence.value = -100;
    //if (actorData.defence.value > 100) actorData.defence.value = 100;
    //Dodge
    if (actorData.dodge.value < 0) actorData.dodge.value = 0;
    //if (actorData.dodge.value > 100) actorData.dodge.value = 100;

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

    for (let [key, weapon] of Object.entries(weapons)) {
      let item = actor.items.get(weapon._id);

      if (!item.system.equipped) continue;  //Skip unequipped weapons

      let attackModif = 0;
      if (item.system.effective.attribut === "orc.character.attributes.strengh") 
        attackModif += actor.system.attributes.strengh.value + item.system.attributes.strengh.attackModif;
      else if (item.system.effective.attribut === "orc.character.attributes.dexterity") 
        attackModif += actor.system.attributes.dexterity.value + item.system.attributes.dexterity.attackModif;
      else if (item.system.effective.attribut === "orc.character.attributes.perception") 
        attackModif += actor.system.attributes.perception.value + item.system.attributes.perception.attackModif;
      else if (item.system.effective.attribut === "orc.character.attributes.intel") 
        attackModif += actor.system.attributes.intel.value + item.system.attributes.intel.attackModif;
      else if (item.system.effective.attribut === "orc.character.attributes.social") 
        attackModif += actor.system.attributes.social.value + item.system.attributes.social.attackModif;

      let effectiveDamage = item.system.damage;
      let effectiveEffect = item.system.effect;
      let effectiveAttack = actor.system.attack.value + attackModif;
      //if the weapon is tagged as twin, cancel the ambidex malus
      if (actor.system.combatStyle.style == "ambidex" && item.system.twin)
        effectiveAttack += 20;
      //if (effectiveAttack > 100) effectiveAttack = 100;

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
        { render: item._id == weapons[weapons.length-1]._id ? true : false }    //Render only the last item (to avoid huge loop)
      );
    }

    return;
  }

  updateSpellEffectiveValues(data){
    let actor = data.actor;

    //Set defaut values
    actor.system.magic.effective.difficulty = ""
    actor.system.magic.effective.power = ""
    actor.system.magic.effective.powerMult = 1
    actor.system.magic.effective.effect = ""
    actor.system.magic.effective.range = 0;
    actor.system.magic.effective.cost = ""
    actor.system.magic.effective.costMult = 1
    actor.system.magic.effective.useHP = false
    actor.system.magic.effective.duration = ""
    actor.system.magic.effective.precise = false

    //Loop over all active spells
    let bases = actor.system.magic.actives.bases.array;
    let shapes = actor.system.magic.actives.shapes.array;
    let powers = actor.system.magic.actives.powers.array;
    let modifs = actor.system.magic.actives.modifs.array;
    let spells = bases.concat(shapes, powers, modifs);
    for (const id of spells){
      let item = actor.items.get(id);

      if(item == null)         continue;
      if(item.type != "spell") continue;
      
      if (item.system.power != "" && item.system.power != "0"){
        if(actor.system.magic.effective.power == "") actor.system.magic.effective.power = item.system.power;
        else if(item.system.power[0] == "-") actor.system.magic.effective.power += item.system.power;
        else                                         actor.system.magic.effective.power += " + " + item.system.power;
      } 
      if (item.system.effect != ""){
        if(actor.system.magic.effective.effect == "") actor.system.magic.effective.effect = item.system.effect;
        else                                          actor.system.magic.effective.effect += ", " + item.system.effect; 
      }
      if (item.system.cost != "" && item.system.cost != "0"){
        if(actor.system.magic.effective.cost == "") actor.system.magic.effective.cost = item.system.cost;
        else if(item.system.cost[0] == "-") actor.system.magic.effective.cost += item.system.cost;
        else                                        actor.system.magic.effective.cost += " + " + item.system.cost; 
      }
      if (item.system.difficulty != "" && item.system.difficulty != "0"){
        if(actor.system.magic.effective.difficulty == "") actor.system.magic.effective.difficulty = item.system.difficulty;
        else if(item.system.difficulty[0] == "-") actor.system.magic.effective.difficulty += item.system.difficulty;
        else                                              actor.system.magic.effective.difficulty += " + " + item.system.difficulty; 
      }
      if (item.system.duration != "" && item.system.duration != "0"){
        if(actor.system.magic.effective.duration == "") actor.system.magic.effective.duration = item.system.duration;
        else if(item.system.duration[0] == "-") actor.system.magic.effective.duration += item.system.duration;
        else                                            actor.system.magic.effective.duration += " + " + item.system.duration; 
      }
      actor.system.magic.effective.powerMult *= item.system.powerMult;
      actor.system.magic.effective.costMult *= item.system.costMult;
      actor.system.magic.effective.useHP += item.system.useHP;
      actor.system.magic.effective.precise += item.system.precise;
      actor.system.magic.effective.range += item.system.range;
    }

    //Apply modificators
    if (actor.system.magic.effective.modif.power != "" && actor.system.magic.effective.modif.power != "0"){
      if(actor.system.magic.effective.power == "") actor.system.magic.effective.power = actor.system.magic.effective.modif.power;
      else if(actor.system.magic.effective.modif.power[0] == "-") actor.system.magic.effective.power += actor.system.magic.effective.modif.power;
      else                                         actor.system.magic.effective.power += " + " + actor.system.magic.effective.modif.power;
    } 
    if (actor.system.magic.powerModif != "" && actor.system.magic.powerModif != "0"){ 
      if(actor.system.magic.effective.power == "") actor.system.magic.effective.power = actor.system.magic.powerModif;
      else if(actor.system.magic.powerModif[0] == "-") actor.system.magic.effective.power += actor.system.magic.powerModif;
      else                                         actor.system.magic.effective.power += " + " + actor.system.magic.powerModif;
    }
    if (actor.system.magic.effective.modif.effect != ""){
      if(actor.system.magic.effective.effect == "") actor.system.magic.effective.effect = actor.system.magic.effective.modif.effect;
      else                                          actor.system.magic.effective.effect += ", " + actor.system.magic.effective.modif.effect; 
    }
    if (actor.system.magic.effective.modif.cost != "" && actor.system.magic.effective.modif.cost != "0"){
      if(actor.system.magic.effective.cost == "") actor.system.magic.effective.cost = actor.system.magic.effective.modif.cost;
      else if(actor.system.magic.effective.modif.cost[0] == "-") actor.system.magic.effective.cost += actor.system.magic.effective.modif.cost;
      else                                        actor.system.magic.effective.cost += " + " + actor.system.magic.effective.modif.cost; 
    }
    if (actor.system.magic.mpReduc != 0){
      if(actor.system.magic.mpReduc > 0) actor.system.magic.effective.power += " + " + (actor.system.magic.mpReduc).toString();
      if(actor.system.magic.mpReduc < 0) actor.system.magic.effective.power += (actor.system.magic.mpReduc).toString();
    }
    if (actor.system.magic.effective.modif.difficulty != "" && actor.system.magic.effective.modif.difficulty != "0"){
      if(actor.system.magic.effective.difficulty == "") actor.system.magic.effective.difficulty = actor.system.magic.effective.modif.difficulty;
      else if(actor.system.magic.effective.modif.difficulty[0] == "-") actor.system.magic.effective.difficulty += actor.system.magic.effective.modif.difficulty;
      else                                              actor.system.magic.effective.difficulty += " + " + actor.system.magic.effective.modif.difficulty; 
    }
    if (actor.system.magic.effective.modif.duration != "" && actor.system.magic.effective.modif.duration != "0"){
      if(actor.system.magic.effective.duration == "") actor.system.magic.effective.duration = actor.system.magic.effective.modif.duration;
      else if(actor.system.magic.effective.modif.duration[0] == "-") actor.system.magic.effective.duration += actor.system.magic.effective.modif.duration;    
      else                                            actor.system.magic.effective.duration += " + " + actor.system.magic.effective.modif.duration; 
    }
    if(actor.system.magic.effective.modif.powerMult)
      actor.system.magic.effective.powerMult *= actor.system.magic.effective.modif.powerMult;
    if(actor.system.magic.effective.modif.costMult)
      actor.system.magic.effective.costMult *= actor.system.magic.effective.modif.costMult;
    if(actor.system.magic.effective.modif.range)
      actor.system.magic.effective.range += actor.system.magic.effective.modif.range;

    //Set default values
    //if (actor.system.magic.effective.power == "")  //Default power is 0
    //actor.system.magic.effective.power = "0";
    if (actor.system.magic.effective.cost == "") //Default cost is 0
    actor.system.magic.effective.cost = "0";
    if (actor.system.magic.effective.difficulty == "") //Default difficulty is 0
    actor.system.magic.effective.difficulty = "0";
    //if (actor.system.magic.effective.duration == "") //Default difficulty is 1 tr
    //actor.system.magic.effective.duration = "1";
    if (actor.system.magic.effective.range < 0)
      actor.system.magic.effective.range = 0;

    //Add braket if necessary
    const regex = /[+]/;  
    if(actor.system.magic.effective.cost != "" && actor.system.magic.effective.cost.search(regex) >= 0)
      actor.system.magic.effective.cost = "(" + actor.system.magic.effective.cost + ")";
    if(actor.system.magic.effective.power != "" && actor.system.magic.effective.power.search(regex) >= 0)
      actor.system.magic.effective.power = "(" + actor.system.magic.effective.power + ")";
    if(actor.system.magic.effective.difficulty != "" && actor.system.magic.effective.difficulty.search(regex) >= 0)
      actor.system.magic.effective.difficulty = "(" + actor.system.magic.effective.difficulty + ")";    
    if(actor.system.magic.effective.duration != "" && actor.system.magic.effective.duration.search(regex) >= 0)
      actor.system.magic.effective.duration = "(" + actor.system.magic.effective.duration + ")";   

    if (!actor.system.magic.effective.difficulty.startsWith("+") && !actor.system.magic.effective.difficulty.startsWith("-")) 
      actor.system.magic.roll.formula = actor.system.magic.roll.value.toString() + "+" + actor.system.magic.effective.difficulty;
    else
      actor.system.magic.roll.formula = actor.system.magic.roll.value.toString() + actor.system.magic.effective.difficulty;

    //Avoid too many digits
    actor.system.magic.effective.costMult = Math.floor(actor.system.magic.effective.costMult * 100) / 100
    actor.system.magic.effective.powerMult = Math.floor(actor.system.magic.effective.powerMult * 100) / 100
    actor.system.magic.effective.range = Math.floor(actor.system.magic.effective.range * 100) / 100

    
    //Calculate min, mean and max values
    actor.system.magic.effective.costValues = DiceOrc.CalculateValuesFromDiceFormula({formula: actor.system.magic.effective.cost, mult: actor.system.magic.effective.costMult})
    actor.system.magic.effective.powerValues = DiceOrc.CalculateValuesFromDiceFormula({formula: actor.system.magic.effective.power, mult: actor.system.magic.effective.powerMult,  useMedian: actor.system.magic.effective.precise})
    actor.system.magic.effective.difficultyValues = DiceOrc.CalculateValuesFromDiceFormula({formula: actor.system.magic.effective.difficulty})
    actor.system.magic.roll.formulaValues = DiceOrc.CalculateValuesFromDiceFormula({formula: actor.system.magic.roll.formula})
    actor.system.magic.effective.durationValues = DiceOrc.CalculateValuesFromDiceFormula({formula: actor.system.magic.effective.duration})

    return;
  }

  calculateInitiative(data) {
    let actor = data.actor;
    let actorData = actor.system;

    const dextMult = 1 / 10,
      intelMult = 1 / 5;
    actorData.ini.ndice += Math.floor(
      dextMult * actorData.attributes.dexterity.value
    );
    actorData.ini.dice = 8;
    actorData.ini.flat += Math.floor(
      intelMult * actorData.attributes.intel.value
    );

    //Ini min = 1
    if(  (actorData.ini.ndice == 0 || actorData.ini.dice == 0)
      && (actorData.ini.flat == 0) )
      actorData.ini.flat = 1;
  }

  async _onDropItem(event, data) {
    return ActorOrc.onDropItem(event, data, this);
  }
}
