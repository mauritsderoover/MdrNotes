import db from "@/components/modules/editor/MdrNotesDatabase";

export interface IPageGroup {
  id?: number;
  key: string;
  label: string;
  sectionId: number;
}

export class PageGroup implements IPageGroup {
  id?: number;
  key: string;
  label: string;
  sectionId: number;

  constructor(key: string, label: string, sectionId: number, id?: number) {
    if (id) this.id = id;
    this.label = label;
    this.key = key;
    this.sectionId = sectionId;
  }
}

db.pageGroups.mapToClass(PageGroup);
