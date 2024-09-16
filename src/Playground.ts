import { Barbarian, Proficiencies } from "../impl/classes/Barbarian";
import { Elf } from "../impl/races/Elf";
import { Sheet } from "./dnd/Sheet";
import { Abilities, Skills } from "./dnd/Stats";

function m(val: number) {
  const label = val > 0 ? `+${val}` : val.toString();
  return `(${label})`;
}

function n(str: any, pad: number) {
  return `${str}`.padEnd(pad);
}

function debug(sheet: Sheet) {
  sheet.init();
  console.log(`-=-=- Abilities -=-=-`);
  for (const ability of Abilities) {
    const prof = `[${sheet.savingProficiencies.has(ability) ? "o" : " "}]`;
    const label = n(ability, 15);
    const score = n(sheet.abilityScores[ability], 3);
    const modifier = n(m(sheet.savingModifiers[ability]), 4);
    console.log(`${prof}${label}${score}${modifier}`);
  }

  console.log(`-=-=- Skills -=-=-`);
  for (const skill of Skills) {
    const prof = `[${sheet.skillProficiencies.has(skill) ? "o" : " "}]`;
    const label = n(skill, 15);
    const modifier = n(m(sheet.skillModifiers[skill]), 4);
    console.log(`${prof}${label} ${modifier}`);
  }
}

const sheet = new Sheet();
sheet.baseAbilityScores = {
  strength: 8,
  wisdom: 10,
  charisma: 12,
  dexterity: 13,
  constitution: 14,
  intelligence: 15,
};

sheet.race = new Elf();

const clazz = new Barbarian();
clazz.init();
const skills = (clazz.features[0] as Proficiencies).skills;
skills.select(0);
skills.select(1);
sheet.class = clazz;

debug(sheet);
