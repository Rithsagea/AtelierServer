import type { AttributeListData } from "./AttributeList";
import type { AttributeTableData } from "./AttributeTable";
import type { DisplayColumnData } from "./DisplayColumn";

export type ViewTypes = {
  AttributeList: AttributeListData;
  AttributeTable: AttributeTableData;
  DisplayColumn: DisplayColumnData;
};

export type View = {
  [key in keyof ViewTypes]: {
    id: key;
    data: ViewTypes[key];
  };
}[keyof ViewTypes];
