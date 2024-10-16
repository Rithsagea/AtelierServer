export const Abilities = [
  "strength",
  "dexterity",
  "intelligence",
  "wisdom",
  "charisma",
  "constitution",
] as const;
export type Ability = (typeof Abilities)[number];
export const AbilityLabels: Record<Ability, string> = {
  strength: "Strength",
  dexterity: "Dexterity",
  intelligence: "Intelligence",
  wisdom: "Wisdom",
  charisma: "Charisma",
  constitution: "Constitution",
};

export const Skills = [
  "acrobatics",
  "animal_handling",
  "arcana",
  "athletics",
  "deception",
  "history",
  "insight",
  "intimidation",
  "investigation",
  "medicine",
  "nature",
  "perception",
  "performance",
  "persuasion",
  "religion",
  "sleight_of_hand",
  "stealth",
  "survival",
] as const;
export type Skill = (typeof Skills)[number];
export const SkillLabels: Record<Skill, string> = {
  acrobatics: "Acrobatics",
  animal_handling: "Animal Handling",
  arcana: "Arcana",
  athletics: "Athletics",
  deception: "Deception",
  history: "History",
  insight: "Insight",
  intimidation: "Intimidation",
  investigation: "Investigation",
  medicine: "Medicine",
  nature: "Nature",
  perception: "Perception",
  performance: "Performance",
  persuasion: "Persuasion",
  religion: "Religion",
  sleight_of_hand: "Sleight of Hand",
  stealth: "Stealth",
  survival: "Survival",
};

export const AbilitySkills: {
  [key in Ability]: Skill[];
} = {
  strength: ["athletics"],
  dexterity: ["acrobatics", "sleight_of_hand", "stealth"],
  constitution: [],
  intelligence: ["arcana", "history", "investigation", "nature", "religion"],
  wisdom: ["animal_handling", "insight", "medicine", "perception", "survival"],
  charisma: ["deception", "intimidation", "performance", "persuasion"],
};
