import type { Sheet } from "../dnd/Sheet";
import { Abilities, AbilityLabels } from "../dnd/Stats";
import type { View } from "./Views";

export interface AttributeTableData {
  title: string;
  items: AttributeTableItem[];
  attributeType: AttributeType;
}

type AttributeType = "ability" | "saving" | "skill";

export interface AttributeTableItem {
  value: number;
  modifier: number;
  label: string;
  attributeValue: string;
}

export function AttributeTable(sheet: Sheet, type: AttributeType): View {
  switch (type) {
    case "ability":
      return {
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
      };

    default:
      throw Error("unsupported attribute type");
  }
}
