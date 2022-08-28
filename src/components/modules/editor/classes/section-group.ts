import db from "@/components/modules/editor/MdrNotesDatabase";
import { Section } from "@/components/modules/editor/classes/section";

export interface ISectionGroup {
  id?: number;
  key: string;
  notebookId: number;
  label: string;
  sections: Array<Section>;
}

export class SectionGroup implements ISectionGroup {
  id?: number;
  key: string;
  notebookId: number;
  label: string;
  sections!: Array<Section>;

  constructor(key: string, notebookId: number, label: string, id?: number) {
    this.key = key;
    this.notebookId = notebookId;
    this.label = label;
    if (id) this.id = id;

    Object.defineProperties(this, {
      sections: {
        value: new Array<Section>(),
        enumerable: false,
        writable: true,
      },
    });
  }

  async loadSections() {
    if (this.id) {
      [this.sections] = await Promise.all([
        db.sections.where("sectionGroupId").equals(this.id).toArray(),
      ]);
    }
  }
}

db.sectionGroups.mapToClass(SectionGroup);
