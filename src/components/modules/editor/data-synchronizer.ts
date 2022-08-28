import { getData } from "@/components/genericcomponents/utils/utils";
import {
  buildThing,
  deleteSolidDataset,
  getThing,
  saveSolidDatasetAt,
  setThing,
  ThingBuilder,
  ThingLocal,
  ThingPersisted,
} from "@inrupt/solid-client";
import SCHEMA from "@/components/genericcomponents/vocabs/SCHEMA";
import { fetch } from "@inrupt/solid-client-authn-browser";
import {
  getRootUrl,
  isPage,
  isSection,
  retrieveIdentifier,
} from "@/components/modules/editor/DataModel";
import { RDF } from "@inrupt/vocab-common-rdf";
import NOTETAKING from "@/components/genericcomponents/vocabs/NOTETAKING";
import { Note } from "@/components/modules/editor/classes/note";

export default class DataSynchronizer {
  rootUrl: string;
  changes: Record<string, Record<string, Array<Note>>>;
  activeSync: Record<string, Record<string, boolean>>;

  constructor() {
    this.rootUrl = getRootUrl();
    this.changes = {};
    this.activeSync = {};
  }

  addContentChange(pageUrl: string, note: Note) {
    if (!this.changes[pageUrl]) this.changes[pageUrl] = {};
    if (!this.changes[pageUrl][note.key]) this.changes[pageUrl][note.key] = [];
    if (!this.activeSync[pageUrl]) {
      this.activeSync[pageUrl] = {};
      this.activeSync[pageUrl][note.key] = false;
    } else if (this.activeSync[pageUrl][note.key] === undefined) {
      this.activeSync[pageUrl][note.key] = false;
    }
    this.changes[pageUrl][note.key].push(note);
    if (!this.activeSync[pageUrl][note.key]) {
      this.activeSync[pageUrl][note.key] = true;
      this.savePageContent(pageUrl, note);
    }
  }

  savePosition(identifier: string, position: number): void {
    let URL = this.rootUrl;
    if (identifier.includes("http")) URL = URL + retrieveIdentifier(identifier);
    else URL = URL + identifier;
    getData(URL).then(async (dataset) => {
      if (dataset) {
        let thing = getThing(dataset, URL);
        if (!thing) throw new Error("No thing could be retrieved");
        if (isPage(thing) || isSection(thing)) {
          thing = buildThing(thing)
            .setInteger(SCHEMA.position, position)
            .build();
          await saveSolidDatasetAt(URL, setThing(dataset, thing), {
            fetch,
          });
        } else {
          throw new Error("Thing is not a page or a section");
        }
      }
    });
  }

  deleteNoteResource(identifier: string): void {
    let URL = this.rootUrl;
    if (identifier.includes("http")) URL = URL + retrieveIdentifier(identifier);
    else URL = URL + identifier;
    deleteSolidDataset(URL, { fetch }).then(() => console.log("tob e done"));
  }

  getLastContent(pageIdentifier: string, contentIdentifier: string): Note {
    const length = this.changes[pageIdentifier][contentIdentifier].length;
    const changes = this.changes[pageIdentifier][contentIdentifier].splice(
      0,
      length
    );
    return changes[length - 1];
  }

  savePageContent(pageIdentifier: string, note: Note): void {
    const content = this.getLastContent(pageIdentifier, note.key);
    let URL = this.rootUrl;
    if (pageIdentifier.includes("http"))
      URL = URL + retrieveIdentifier(pageIdentifier);
    else URL = URL + pageIdentifier;
    if (content) {
      getData(URL).then((dataSet) => {
        if (dataSet) {
          let pageThing = getThing(dataSet, this.rootUrl + pageIdentifier);
          if (!pageThing || !isPage(pageThing)) {
            throw new Error("The thing is no page Thing or is null ");
          } else {
            let thing:
              | ThingPersisted
              | null
              | ThingBuilder<ThingLocal>
              | ThingBuilder<ThingPersisted> = getThing(
              dataSet,
              URL + `#${note.key}`
            );
            if (!thing) {
              thing = buildThing({ name: note.key });
              thing.setUrl(RDF.type, NOTETAKING.NoteContent);
              pageThing = buildThing(pageThing)
                .addUrl(NOTETAKING.hasPageContent, URL + `#${note.key}`)
                .build();
              dataSet = setThing(dataSet, pageThing);
            } else {
              thing = buildThing(thing);
            }
            thing = thing
              .setStringNoLocale(SCHEMA.Text, content.content)
              .setInteger(NOTETAKING.distanceTop, content.top)
              .setInteger(NOTETAKING.distanceLeft, content.left);
            saveSolidDatasetAt(URL, setThing(dataSet, thing.build()), {
              fetch,
            }).then(() => {
              if (this.changes[pageIdentifier][note.key].length === 0) {
                this.activeSync[pageIdentifier][note.key] = false;
              } else {
                this.savePageContent(pageIdentifier, note);
              }
            });
          }
        }
      });
    }
  }
}
