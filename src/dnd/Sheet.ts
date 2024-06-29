import { enumMap } from "../Util";
import { InitializeObjectEvent, Property } from "../db/Data";
import { Subscribe } from "../lib/Event";
import { Abilities, type Ability } from "./Ability";

export class Sheet {
  @Property
  id: string = "";

  @Property
  baseAbilityScores = enumMap(Abilities, () => 0);

  // computed fields
  abilityScores = enumMap(Abilities, () => 0);
  abilityModifiers = enumMap(Abilities, () => 0);
  savingModifiers = enumMap(Abilities, () => 0);

  savingProficiencies: Ability[] = [];

  @Subscribe(InitializeObjectEvent)
  init() {
    for (const ability of Abilities) {
      this.abilityScores[ability] = this.baseAbilityScores[ability];
      this.abilityModifiers[ability] = Math.floor(
        (this.abilityScores[ability] - 10) / 2,
      );
      this.savingModifiers[ability] = this.abilityModifiers[ability];
    }
  }
}
