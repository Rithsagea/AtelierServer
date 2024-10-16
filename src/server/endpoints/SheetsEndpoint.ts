import { InitializeObjectEvent } from "../../lib/Data";
import { SheetSchema } from "../Database";
import { Sheet } from "../../dnd/Sheet";
import { call } from "../../lib/Event";
import { sanitize } from "../../lib/Util";
import type { View } from "../../views/Views";
import { AbilityLabels, Abilities, Skills, SkillLabels } from "../../dnd/Stats";

function listSheets() {
  return Object.values(SheetSchema.data).map(sanitize);
}

function getSheet(id: string) {
  const sheet = SheetSchema.data[id];
  const views: View[] = [
    {
      id: "AttributeTable",
      data: {
        title: "Ability Scores",
        attributeType: "ability",
        items: Abilities.map((ability) => ({
          modifier: sheet.abilityModifiers[ability],
          value: sheet.abilityScores[ability],
          attributeValue: ability,
          label: AbilityLabels[ability],
        })),
      },
    },
    {
      id: "AttributeList",
      data: {
        title: "Ability Scores",
        attributeType: "saving",
        items: Abilities.map((ability) => ({
          proficiency: sheet.savingProficiencies.has(ability),
          modifier: sheet.savingModifiers[ability],
          attributeValue: ability,
          label: AbilityLabels[ability],
        })),
      },
    },
    {
      id: "AttributeList",
      data: {
        title: "Skill Scores",
        attributeType: "skill",
        items: Skills.map((skill) => ({
          proficiency: sheet.skillProficiencies.has(skill),
          modifier: sheet.skillModifiers[skill],
          attributeValue: skill,
          label: SkillLabels[skill],
        })),
      },
    },
  ];

  return {
    id: sheet.id,
    abilityScores: sheet.abilityScores,
    abilityModifiers: sheet.abilityModifiers,
    savingModifiers: sheet.savingModifiers,
    savingProficiencies: [...sheet.savingProficiencies],
    skillModifiers: sheet.skillModifiers,
    skillProficiencies: [...sheet.skillProficiencies],
    views: views,
  };
}

function newSheet() {
  const sheet = new Sheet();
  sheet.id = crypto.randomUUID();
  sheet.baseAbilityScores = {
    strength: 15,
    dexterity: 14,
    intelligence: 13,
    wisdom: 12,
    charisma: 10,
    constitution: 9,
  };
  call(sheet, InitializeObjectEvent);
  SheetSchema.data[sheet.id] = sheet;

  return sanitize(sheet);
}

export default { listSheets, getSheet, newSheet };
