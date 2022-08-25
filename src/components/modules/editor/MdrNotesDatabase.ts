import Dexie from "dexie";
import { Section } from "@/components/modules/editor/classes/section";
import { Page } from "@/components/modules/editor/classes/page";
import { Note } from "@/components/modules/editor/classes/note";
import { Notebook } from "@/components/modules/editor/classes/notebook";
import { SectionGroup } from "@/components/modules/editor/classes/section-group";
import { PageGroup } from "@/components/modules/editor/classes/page-group";

class MdrNotesDatabase extends Dexie {
  notebooks!: Dexie.Table<Notebook, number>;
  sectionGroups!: Dexie.Table<SectionGroup, number>;
  sections!: Dexie.Table<Section, number>;
  pageGroups!: Dexie.Table<PageGroup, number>;
  pages!: Dexie.Table<Page, number>;
  notes!: Dexie.Table<Note, number>;

  constructor() {
    super("MdrNotesDatabase");

    this.version(3).stores({
      notebooks: "++id, &key, label",
      sectionGroups: "++id, &key, notebookId, label, position",
      sections: "++id, &key, notebookId, sectionGroupId, position, label",
      pageGroups: "++id, &key, sectionId, position, label",
      pages: "++id, &key, label, position, sectionId",
      notes: "++id, &key, pageId, left, top, content",
    });
  }
}

const db = new MdrNotesDatabase();

export default db;
