import { enumMap } from "../Util";
import { Property } from "../db/Data";
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

  load() {
    for (const ability of Abilities) {
      this.abilityScores[ability] = this.baseAbilityScores[ability];
      this.abilityModifiers[ability] = Math.floor(
        (this.abilityScores[ability] - 10) / 2,
      );
      this.savingModifiers[ability] = this.abilityModifiers[ability];
    }
  }
}
