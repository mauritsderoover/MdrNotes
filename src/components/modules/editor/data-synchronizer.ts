import { getData } from "@/components/genericcomponents/utils/utils";
import {
  buildThing,
  getThing,
  saveSolidDatasetAt,
  setThing,
} from "@inrupt/solid-client";
import SCHEMA from "@/components/genericcomponents/vocabs/SCHEMA";
import { fetch } from "@inrupt/solid-client-authn-browser";
import {
  isPage,
  isSection,
  retrieveIdentifier,
} from "@/components/modules/editor/DataModel";
import { DCTERMS } from "@inrupt/vocab-common-rdf";

export default class DataSynchronizer {
  rootUrl: string;
  changes: Record<string, string[]>;
  activeSync: Record<string, boolean>;

  constructor(rootUrl: string) {
    this.rootUrl = rootUrl;
    this.changes = {};
    this.activeSync = {};
  }

  addContentChange(pageUrl: string, content: string) {
    if (!this.changes[pageUrl]) this.changes[pageUrl] = [];
    if (this.activeSync[pageUrl] === undefined)
      this.activeSync[pageUrl] = false;
    this.changes[pageUrl].push(content);
    if (!this.activeSync[pageUrl]) {
      this.activeSync[pageUrl] = true;
      this.savePageContent(pageUrl);
    }
  }

  saveTitle(identifier: string, newTitle: string): void {
    let URL = this.rootUrl;
    if (identifier.includes("http")) URL = URL + retrieveIdentifier(identifier);
    else URL = URL + identifier;
    getData(URL).then(async (dataSet) => {
      if (dataSet) {
        let thing = getThing(dataSet, URL);
        if (!thing) throw new Error("No thing could be retrieved");
        if (isPage(thing) || isSection(thing)) {
          thing = buildThing(thing)
            .setStringNoLocale(DCTERMS.title, newTitle)
            .build();
          await saveSolidDatasetAt(URL, setThing(dataSet, thing), {
            fetch,
          });
        } else {
          throw new Error("Thing is not a page or a section");
        }
      }
    });
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

  savePageContent(pageIdentifier: string): void {
    const content = this.changes[pageIdentifier].shift();
    let URL = this.rootUrl;
    if (pageIdentifier.includes("http"))
      URL = URL + retrieveIdentifier(pageIdentifier);
    else URL = URL + pageIdentifier;
    if (content) {
      getData(URL).then((dataSet) => {
        if (dataSet) {
          let thing = getThing(dataSet, URL);
          if (!thing) throw new Error("No thing could be retrieved");
          if (!isPage(thing)) throw new Error("The thing is no page Thing");
          thing = buildThing(thing)
            .setStringNoLocale(SCHEMA.Text, content)
            .build();
          saveSolidDatasetAt(URL, setThing(dataSet, thing), {
            fetch,
          }).then(() => {
            if (this.changes[pageIdentifier].length === 0) {
              this.activeSync[pageIdentifier] = false;
            } else {
              this.savePageContent(pageIdentifier);
            }
          });
        }
      });
    }
  }
}
