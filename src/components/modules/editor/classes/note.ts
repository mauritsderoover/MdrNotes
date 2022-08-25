import db from "@/components/modules/editor/MdrNotesDatabase";
import {
  getIdentifierUrl,
  getRootUrl,
} from "@/components/modules/editor/DataModel";
import { getData } from "@/components/genericcomponents/utils/utils";
import {
  buildThing,
  getThing,
  removeThing,
  saveSolidDatasetAt,
  setThing,
} from "@inrupt/solid-client";
import NOTETAKING from "@/components/genericcomponents/vocabs/NOTETAKING";
import { fetch } from "@inrupt/solid-client-authn-browser";

export interface INote {
  id: number;
  key: string;
  pageId: number;
  left: number;
  top: number;
  content: string;
}

export class Note implements INote {
  id!: number;
  key: string;
  pageId: number;
  left: number;
  top: number;
  content: string;

  constructor(
    key: string,
    pageId: number,
    left: number,
    top: number,
    content: string,
    id?: number
  ) {
    if (id) this.id = id;
    this.key = key;
    this.pageId = pageId;
    this.left = left;
    this.top = top;
    this.content = content;
  }

  setLeft(left: number): void {
    this.left = left;
  }

  setTop(top: number): void {
    this.top = top;
  }

  setContent(content: string): void {
    this.content = content;
  }

  saveToDatabase() {
    return db.transaction("rw", db.notes, async () => {
      this.id = await db.notes.put(
        new Note(
          this.key,
          this.pageId,
          this.left,
          this.top,
          this.content,
          this.id
        )
      );
    });
  }

  deleteFromDatabase() {
    return db.transaction("rw", db.notes, async () => {
      await db.notes.delete(this.id);
    });
  }

  removeNoteFromPage(pageIdentifier: string) {
    const pageURL = getRootUrl() + pageIdentifier;
    const noteThingUrl = getIdentifierUrl(pageURL, this.key);
    getData(pageURL).then(async (dataset) => {
      if (dataset) {
        dataset = removeThing(dataset, noteThingUrl);
        let thing = getThing(dataset, pageURL);
        if (!thing) throw new Error("No thing could be found");
        thing = buildThing(thing)
          .removeUrl(NOTETAKING.hasPageContent, noteThingUrl)
          .build();
        await saveSolidDatasetAt(pageURL, setThing(dataset, thing), { fetch });
      }
    });
  }
}

db.notes.mapToClass(Note);
