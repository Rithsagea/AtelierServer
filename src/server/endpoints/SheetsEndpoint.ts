import { InitializeObjectEvent } from "../../lib/Data";
import { SheetSchema } from "../Database";
import { Sheet } from "../../dnd/Sheet";
import { call } from "../../lib/Event";
import { sanitize } from "../../lib/Util";
import type { View } from "../../views/Views";
import { DisplayColumn } from "../../views/DisplayColumn";
import { AttributeTable } from "../../views/AttributeTable";
import { AttributeList } from "../../views/AttributeList";

function listSheets() {
  return Object.values(SheetSchema.data).map(sanitize);
}

function getSheet(id: string) {
  const sheet = SheetSchema.data[id];
  const views: View[] = [
    DisplayColumn(AttributeTable(sheet, "ability")),
    DisplayColumn(AttributeList(sheet, "saving")),
    DisplayColumn(AttributeList(sheet, "skill")),
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
