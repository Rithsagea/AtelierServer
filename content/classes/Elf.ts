import { Register } from "../../src/lib/Data";
import { Race, Races } from "../../src/dnd/Race";
import { LoadEffectsEvent, type Effect } from "../../src/dnd/Sheet";
import { Subscribe } from "../../src/lib/Event";

@Register(Races)
export class Elf extends Race {
  @Subscribe(LoadEffectsEvent)
  loadEffects(effects: Effect[]) {
    effects.push((s) => {
      s.abilityScores.dexterity += 2;
      s.abilityScores.charisma += 1;
    });
  }
}
