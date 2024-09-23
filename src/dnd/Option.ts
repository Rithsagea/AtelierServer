import { Property } from "../lib/Data";

export abstract class Option<T> {
  @Property
  public selected: number[] = [];

  abstract getOptions(): T[];
  abstract maxSelected(): number;

  select(index: number) {
    if (this.selected.length < this.maxSelected()) {
      this.selected.push(index);
      return true;
    }
    return false;
  }

  getSelected() {
    const options = this.getOptions();
    return this.selected.map((i) => options[i]);
  }
}
