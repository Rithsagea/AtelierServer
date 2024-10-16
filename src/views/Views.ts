import type { AttributeListData } from "./AttributeList";
import type { AttributeTableData } from "./AttributeTable";

export type ViewTypes = {
  AttributeList: AttributeListData;
  AttributeTable: AttributeTableData;
};

export type View = {
  [key in keyof ViewTypes]: {
    id: key;
    data: ViewTypes[key];
  };
}[keyof ViewTypes];
