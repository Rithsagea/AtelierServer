import { enumMap } from "../lib/Util";
import { InitializeObjectEvent, Property } from "../lib/Data";
import { createEvent, Emitter, Subscribe } from "../lib/Event";
import {
  Abilities,
  AbilitySkills,
  Skills,
  type Ability,
  type Skill,
} from "./Stats";
import { Races, type Race } from "./Race";
import { Class, Classes } from "./Class";

export class Sheet {
  @Property
  id: string = "";

  @Property
  baseAbilityScores = enumMap(Abilities, () => 0);

  @Property(Races)
  race?: Race;

  @Property(Classes)
  class?: Class;

  // computed fields
  abilityScores = enumMap(Abilities, () => 0);
  abilityModifiers = enumMap(Abilities, () => 0);
  savingModifiers = enumMap(Abilities, () => 0);
  skillModifiers = enumMap(Skills, () => 0);

  savingProficiencies = new Set<Ability>();
  skillProficiencies = new Set<Skill>();
  proficiencyBonus = 100; // TODO implement level

  // meta
  emitter: Emitter = new Emitter();
  effects: Effect[] = [];

  @Subscribe(InitializeObjectEvent)
  init() {
    for (const ability of Abilities) {
      this.abilityScores[ability] = this.baseAbilityScores[ability];
    }

    this.savingProficiencies.clear();
    this.skillProficiencies.clear();

    this.emitter.clearHandlers();
    this.emitter.addListeners(this.race, ...(this.class?.features ?? []));

    this.effects = [];
    this.emitter.call(LoadEffectsEvent, this.effects);
    this.effects.forEach((e) => e(this));

    for (const ability of Abilities) {
      this.abilityModifiers[ability] = Math.floor(
        (this.abilityScores[ability] - 10) / 2,
      );
      this.savingModifiers[ability] =
        this.abilityModifiers[ability] +
        (this.savingProficiencies.has(ability) ? this.proficiencyBonus : 0);

      for (const skill of AbilitySkills[ability]) {
        this.skillModifiers[skill] =
          this.abilityModifiers[ability] +
          (this.skillProficiencies.has(skill) ? this.proficiencyBonus : 0);
      }
    }
  }
}

export const LoadEffectsEvent = createEvent<Effect[]>("LoadEffectsEvent");

export type Effect = (sheet: Sheet) => void;
