import type { Sheet } from "../dnd/Sheet";
import { Abilities, AbilityLabels, Skills, SkillLabels } from "../dnd/Stats";
import type { View } from "./Views";

export interface AttributeListData {
  title: string;
  items: AttributeListItem[];
  attributeType: string;
}

export interface AttributeListItem {
  proficiency: boolean;
  modifier: number;
  label: string;
  attributeValue: string;
}

type AttributeType = "ability" | "saving" | "skill";

export function AttributeList(sheet: Sheet, type: AttributeType): View {
  switch (type) {
    case "saving":
      return {
        id: "AttributeList",
        data: {
          title: "Saving Throws",
          attributeType: "saving",
          items: Abilities.map((ability) => ({
            proficiency: sheet.savingProficiencies.has(ability),
            modifier: sheet.savingModifiers[ability],
            attributeValue: ability,
            label: AbilityLabels[ability],
          })),
        },
      };

    case "skill":
      return {
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
      };

    default:
      throw Error("unsupported attribute type");
  }
}
