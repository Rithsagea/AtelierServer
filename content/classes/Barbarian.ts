import { Property, Register, TypeMap } from "../../src/lib/Data";
import { Class, Classes, Feature } from "../../src/dnd/Class";
import { Option } from "../../src/dnd/Option";
import { LoadEffectsEvent, type Effect } from "../../src/dnd/Sheet";
import type { Skill } from "../../src/dnd/Stats";
import { Subscribe } from "../../src/lib/Event";

const BarbarianFeatures = new TypeMap<Feature>();

@Register(Classes)
export class Barbarian extends Class {
  @Property(BarbarianFeatures)
  features: Feature[] = [];

  init() {
    this.features.push(new Proficiencies());
  }
}

export class BarbarianSkillProficiencies extends Option<Skill> {
  getOptions(): Skill[] {
    return [
      "animal_handling",
      "athletics",
      "intimidation",
      "nature",
      "perception",
      "survival",
    ];
  }

  maxSelected() {
    return 2;
  }
}

@Register(BarbarianFeatures)
export class Proficiencies extends Feature {
  @Property(BarbarianSkillProficiencies)
  public skills = new BarbarianSkillProficiencies();

  @Subscribe(LoadEffectsEvent)
  loadEffects(effects: Effect[]) {
    effects.push((s) => {
      s.savingProficiencies.add("strength");
      s.savingProficiencies.add("constitution");

      this.skills
        .getSelected()
        .forEach((skill) => s.skillProficiencies.add(skill));
    });
  }
}
