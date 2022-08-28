import db from "@/components/modules/editor/MdrNotesDatabase";
import { Section } from "@/components/modules/editor/classes/section";
import { SectionGroup } from "@/components/modules/editor/classes/section-group";
import NOTETAKING from "@/components/genericcomponents/vocabs/NOTETAKING";
import {
  createNoteTakingElement,
  getRootUrl,
  makeId,
} from "@/components/modules/editor/DataModel";

export interface INotebook {
  id?: number;
  key: string;
  label: string;
}

export class Notebook implements INotebook {
  id!: number;
  key: string;
  label: string;
  sections!: Array<Section>;
  sectionGroups!: Array<SectionGroup>;

  constructor(key: string, label: string, id?: number) {
    this.key = key;
    this.label = label;
    if (id) {
      this.id = id;
    }
    Object.defineProperties(this, {
      sections: {
        value: new Array<Section>(),
        enumerable: false,
        writable: true,
      },
      sectionGroups: {
        value: new Array<SectionGroup>(),
        enumerable: false,
        writable: true,
      },
    });
  }

  getUrl(): string {
    return getRootUrl() + this.key;
  }

  // async loadExistingNotebook() {
  //   if (this.key) {
  //     const notebook = await db.notebooks
  //       .where("key")
  //       .equals(this.key)
  //       .first()
  //     if (notebook) {
  //       this.id = notebook.id;
  //       this.sections = notebook.sections;
  //       this.
  //     }
  //   }
  // }

  async loadSectionsAndSectionGroups() {
    if (this.id) {
      [this.sections, this.sectionGroups] = await Promise.all([
        db.sections.where("notebookId").equals(this.id).toArray(),
        db.sectionGroups.where("notebookId").equals(this.id).toArray(),
      ]);
      for (const section of this.sections) {
        await section.loadPagesAndPageGroups();
      }
      for (const sectionGroup of this.sectionGroups) {
        await sectionGroup.loadSections();
      }
    }
  }

  saveToDatabase() {
    return db.transaction(
      "rw",
      db.notebooks,
      db.sectionGroups,
      db.sections,
      async () => {
        this.id = await db.notebooks.put(
          new Notebook(this.key, this.label, this.id)
        );

        const [sectionIds, sectionGroupIds] = await Promise.all([
          Promise.all(
            this.sections.map((section) => {
              section.notebookId = this.id;
              return db.sections.put(section);
            })
          ),
          Promise.all(
            this.sectionGroups.map((sectionGroup) =>
              db.sectionGroups.put(sectionGroup)
            )
          ),
        ]);

        await Promise.all([
          db.sections
            .where("notebookId")
            .equals(this.id)
            .and((section) => sectionIds.indexOf(section.id!) === -1)
            .delete(),
          db.sectionGroups
            .where("notebookId")
            .equals(this.id)
            .and(
              (sectionGroup) => sectionGroupIds.indexOf(sectionGroup.id!) === -1
            )
            .delete(),
        ]);
      }
    );
  }

  async saveToSolid(): Promise<void> {
    await createNoteTakingElement(this.key, this.label, NOTETAKING.NoteBook);
  }

  /**
   * Creating a sections means:
   *    => to create it in indexedDB
   *    => create a SectionResource in a solidPod
   *    => link that section resource to a notebook or sectionGroup
   *    => ensure that all steps have succeeded and if not execute fallback
   */
  createSection(): Section {
    if (this.id) {
      const section = new Section(
        makeId(),
        this.id,
        "A new section",
        this.sections.length
      );
      this.sections.push(section);
      return section;
    }
    throw new Error("An ID must exist, please save the notebook first");
  }

  removeSection(section: Section): void {
    if (section.id) {
      const index = this.sections.indexOf(section);
      if (index) {
        this.sections.splice(index, 1);
        db.sections.delete(section.id);
        section.removeSectionFromNoteBook(this.key);
        section.removeSectionFromSolid();
        section.pages.forEach((page) => {
          page.removePageFromSolid();
        });
      }
    }
  }

  /**
   * Creating a sectionGroup means:
   *    => to create it in indexedDB
   *    => create a SectionResource in a solidPod
   *    => link that section resource to a notebook
   *  => A section needs to be created as well and a link to that section needs to be made
   *    => ensure that all steps have succeeded and if not execute fallback
   */
  createSectionGroup(): void {
    throw new Error("To be implemented");
  }
}

db.notebooks.mapToClass(Notebook);
