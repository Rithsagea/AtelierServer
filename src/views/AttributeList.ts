export interface AttributeListData {
  title: string;
  items: AttributeListItem[];
  attributeType: string;
}

export interface AttributeListItem {
  proficiency: boolean;
  modifier: number;
  label: string;
  attributeValue: string;
}
