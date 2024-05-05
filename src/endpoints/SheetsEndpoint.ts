import { sanitize } from "../Util";
import { SheetSchema } from "../db/Database";
import { Sheet } from "../dnd/Sheet";

function listSheets() {
  return Object.values(SheetSchema.data).map(sanitize);
}

function getSheet(id: string) {
  return sanitize(SheetSchema.data[id]);
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
  sheet.load();
  SheetSchema.data[sheet.id] = sheet;

  return sanitize(sheet);
}

export default { listSheets, getSheet, newSheet };
