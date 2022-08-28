import db from "@/components/modules/editor/MdrNotesDatabase";
import { Note } from "@/components/modules/editor/classes/note";
import {
  createNoteTakingElement,
  getRootUrl,
  hasPage,
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

export interface IPage {
  id: number;
  key: string;
  label: string;
  sectionId: number;
  position: number;
  // pageGroupId?: number;
}

export class Page implements IPage {
  id!: number;
  key: string;
  label: string;
  sectionId: number;
  position: number;
  notes!: Array<Note>;

  constructor(
    key: string,
    label: string,
    sectionId: number,
    position: number,
    id?: number
  ) {
    this.key = key;
    this.label = label;
    this.sectionId = sectionId;
    this.position = position;
    if (id) this.id = id;

    Object.defineProperties(this, {
      notes: {
        value: new Array<Note>(),
        enumerable: false,
        writable: true,
      },
    });
  }

  async loadNotes() {
    if (this.id) {
      [this.notes] = await Promise.all([
        db.notes.where("pageId").equals(this.id).toArray(),
      ]);
    }
  }

  saveToDatabase() {
    return db.transaction("rw", db.pages, db.notes, async () => {
      this.id = await db.pages.put(
        new Page(this.key, this.label, this.sectionId, this.position, this.id)
      );

      const [noteIds] = await Promise.all([
        Promise.all(
          this.notes.map((note) => {
            return db.notes.put(
              new Note(
                note.key,
                note.pageId,
                note.left,
                note.top,
                note.content,
                note.id
              )
            );
          })
        ),
      ]);

      await Promise.all([
        db.notes
          .where("pageId")
          .equals(this.id)
          .and((note) => noteIds.indexOf(note.id) === -1)
          .delete(),
      ]);
    });
  }

  removeNote(note: Note): void {
    const index = this.notes.indexOf(note);
    if (index !== -1) {
      this.notes.splice(index, 1);
      note.deleteFromDatabase();
      note.removeNoteFromPage(this.key);
    }
  }

  createNote(left = 100, top = 50, content = ""): Note {
    if (this.id) {
      const note = new Note(makeId(), this.id, left, top, content);
      if (this.notes) {
        this.notes.push(note);
      } else {
        this.notes = [note];
      }
      this.notes.push(note);
      note.saveToDatabase().then();
      return note;
    } else {
      throw new Error(
        "Please save the page resource before creating a note. " +
          "Or make sure to load all required fields"
      );
    }
  }

  async saveToSolid(): Promise<void> {
    await createNoteTakingElement(
      this.key,
      this.label,
      NOTETAKING.Note,
      this.position
    );
  }

  saveTitle(): void {
    this.saveToDatabase();
    saveTitle(this.key, this.label);
  }

  removePageFromSolid(): void {
    deleteSolidDataset(getRootUrl() + this.key).then();
  }

  removePageFromSection(sectionIdentifier: string): void {
    const sectionURL = getRootUrl() + sectionIdentifier;
    getData(sectionURL).then(async (dataset) => {
      if (dataset) {
        let thing = getThing(dataset, sectionURL);
        if (!thing) throw new Error("No thing could be retrieved");
        thing = buildThing(thing)
          .removeUrl(NOTETAKING.hasPage, getRootUrl() + this.key)
          .build();
        await saveSolidDatasetAt(sectionURL, setThing(dataset, thing), {
          fetch,
        });
      }
    });
  }

  async linkPage(target: hasPage, targetIdentifier: string) {
    const pageURL = `${getRootUrl()}${this.key}`;
    const targetURL = `${getRootUrl()}${targetIdentifier}`;
    const dataset = await getData(pageURL);
    const targetDataset = await getData(targetURL);
    if (dataset) {
      let thing = getThing(dataset, pageURL);
      if (thing) {
        if (target === hasPage.SECTION) {
          thing = buildThing(thing)
            .addUrl(NOTETAKING.partOfSection, targetURL)
            .build();
          await saveSolidDatasetAt(pageURL, setThing(dataset, thing), {
            fetch,
          });
        } else if (target === hasPage.PAGE_GROUP) {
          thing = buildThing(thing)
            .addUrl(NOTETAKING.partOfPageGroup, targetURL)
            .build();
          await saveSolidDatasetAt(pageURL, setThing(dataset, thing), {
            fetch,
          });
        }
      }
    }

    if (targetDataset) {
      let thing = getThing(targetDataset, targetURL);
      if (thing) {
        thing = buildThing(thing).addUrl(NOTETAKING.hasPage, pageURL).build();
        await saveSolidDatasetAt(targetURL, setThing(targetDataset, thing), {
          fetch,
        });
      }
    }
  }
}

db.pages.mapToClass(Page);
