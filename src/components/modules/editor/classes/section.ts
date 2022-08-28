import db from "@/components/modules/editor/MdrNotesDatabase";
import { PageGroup } from "@/components/modules/editor/classes/page-group";
import { Page } from "@/components/modules/editor/classes/page";
import {
  createNoteTakingElement,
  getRootUrl,
  hasSection,
  makeId,
  saveTitle,
} from "@/components/modules/editor/DataModel";
import NOTETAKING from "@/components/genericcomponents/vocabs/NOTETAKING";
import { getData } from "@/components/genericcomponents/utils/utils";
import {
  buildThing,
  deleteSolidDataset,
  getThing,
  saveSolidDatasetAt,
  setThing,
} from "@inrupt/solid-client";
import { fetch } from "@inrupt/solid-client-authn-browser";

export interface ISection {
  id?: number;
  key: string;
  notebookId: number;
  // sectionGroupId?: number;
  label: string;
  position: number;
  icon?: string;
  class?: string;
  command?: (arg0: any) => void;
  to?: string;
}

export class Section implements ISection {
  id?: number;
  key: string;
  notebookId: number;
  label: string;
  position: number;
  pages!: Array<Page>;
  pageGroups!: Array<PageGroup>;
  icon?: string;
  class?: string;
  command?: (arg0: unknown) => void;
  to?: string;

  constructor(
    key: string,
    notebookId: number,
    label: string,
    position: number,
    id?: number
  ) {
    if (id) this.id = id;
    this.key = key;
    this.notebookId = notebookId;
    this.label = label;
    this.position = position;
    Object.defineProperties(this, {
      pages: {
        value: new Array<Page>(),
        enumerable: false,
        writable: true,
      },
      pageGroups: {
        value: new Array<PageGroup>(),
        enumerable: false,
        writable: true,
      },
    });
  }

  async loadPagesAndPageGroups() {
    if (this.id) {
      [this.pages, this.pageGroups] = await Promise.all([
        db.pages.where("sectionId").equals(this.id).toArray(),
        db.pageGroups.where("sectionId").equals(this.id).toArray(),
      ]);
      for (const page of this.pages) {
        await page.loadNotes();
      }
    }
  }

  saveToDatabase() {
    return db.transaction(
      "rw",
      db.sections,
      db.pageGroups,
      db.pages,
      async () => {
        this.id = await db.sections.put(
          new Section(
            this.key,
            this.notebookId,
            this.label,
            this.position,
            this.id
          )
        );

        const [pageIds, pageGroupIds] = await Promise.all([
          Promise.all(
            this.pages.map((page) =>
              db.pages.put(
                new Page(
                  page.key,
                  page.label,
                  page.sectionId,
                  page.position,
                  page.id
                )
              )
            )
          ),
          Promise.all(
            this.pageGroups.map((pageGroup) => db.pageGroups.put(pageGroup))
          ),
        ]);
        await Promise.all([
          db.pages
            .where("sectionId")
            .equals(this.id)
            .and((page) => pageIds.indexOf(page.id!) === -1)
            .delete(),
          db.pageGroups
            .where("sectionId")
            .equals(this.id)
            .and((pageGroup) => pageGroupIds.indexOf(pageGroup.id!) === -1)
            .delete(),
        ]);
      }
    );
  }

  createPage(): Page {
    if (this.id) {
      const page = new Page(
        makeId(),
        "This is a page",
        this.id,
        this.pages.length
      );
      this.pages.push(page);
      return page;
    } else {
      throw new Error("An idea must exist, please save the section first");
    }
  }

  async saveToSolid(): Promise<void> {
    await createNoteTakingElement(
      this.key,
      this.label,
      NOTETAKING.Section,
      this.position
    );
  }

  saveTitle(): void {
    this.saveToDatabase();
    saveTitle(this.key, this.label);
  }

  /**
   * A section can be added to either a notebook or a section group
   * @param target: determines whether a section is added to a notebook or section group
   * @param sectionIdentifier: the section that is being linked
   * @param targetIdentifier: the target that is being linked
   */
  async linkSection(target: hasSection, targetIdentifier: string) {
    const sectionURL = `${getRootUrl()}${this.key}`;
    const targetURL = `${getRootUrl()}${targetIdentifier}`;
    const sectionDataset = await getData(sectionURL);
    const targetDataset = await getData(targetURL);
    if (sectionDataset) {
      let thing = getThing(sectionDataset, sectionURL);
      if (thing) {
        if (target === hasSection.NOTEBOOK) {
          thing = buildThing(thing)
            .addUrl(NOTETAKING.partOfNoteBook, targetURL)
            .build();
          await saveSolidDatasetAt(
            sectionURL,
            setThing(sectionDataset, thing),
            {
              fetch,
            }
          );
        } else if (target === hasSection.SECTIONGROUP) {
          thing = buildThing(thing)
            .addUrl(NOTETAKING.partOfSectionGroup, targetURL)
            .build();
          await saveSolidDatasetAt(
            sectionURL,
            setThing(sectionDataset, thing),
            {
              fetch,
            }
          );
        }
      }
    }

    if (targetDataset) {
      let thing = getThing(targetDataset, targetURL);
      if (thing) {
        thing = buildThing(thing)
          .addUrl(NOTETAKING.hasSection, sectionURL)
          .build();
        await saveSolidDatasetAt(targetURL, setThing(targetDataset, thing), {
          fetch,
        });
      }
    }
  }

  removeSectionFromSolid(): void {
    deleteSolidDataset(getRootUrl() + this.key).then();
  }

  removeSectionFromNoteBook(notebookIdentifier: string): void {
    const notebookURL = getRootUrl() + notebookIdentifier;
    getData(notebookURL).then(async (dataset) => {
      if (dataset) {
        let thing = getThing(dataset, notebookURL);

        if (!thing) throw new Error("No thing could be retrieved");
        thing = buildThing(thing)
          .removeUrl(NOTETAKING.hasSection, getRootUrl() + this.key)
          .build();
        await saveSolidDatasetAt(notebookURL, setThing(dataset, thing), {
          fetch,
        });
      }
    });
  }

  removePage(page: Page): void {
    if (page.id) {
      const index = this.pages.indexOf(page);
      db.pages.delete(page.id);
      this.pages.splice(index, 1);
      page.removePageFromSection(this.key);
      page.removePageFromSolid();
    }
  }

  createPageGroup(): PageGroup {
    throw new Error("TO be implemented");
  }
}

db.sections.mapToClass(Section);
