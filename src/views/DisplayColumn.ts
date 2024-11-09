import type { View } from "./Views";

export interface DisplayColumnData {
  items: View[];
}

export function DisplayColumn(...items: View[]): View {
  return {
    id: "DisplayColumn",
    data: {
      items: items,
    },
  };
}
