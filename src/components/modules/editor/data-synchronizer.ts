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
import { DCTERMS, LDP, RDF } from "@inrupt/vocab-common-rdf";
import NOTETAKING from "@/components/genericcomponents/vocabs/NOTETAKING";
import { PageContent } from "@/components/modules/editor/editor-classes";

export default class DataSynchronizer {
  rootUrl: string;
  changes: Record<string, Record<string, Array<PageContent>>>;
  activeSync: Record<string, Record<string, boolean>>;

  constructor() {
    this.rootUrl = getRootUrl();
    this.changes = {};
    this.activeSync = {};
  }

  addContentChange(pageUrl: string, pageContent: PageContent) {
    if (!this.changes[pageUrl]) this.changes[pageUrl] = {};
    if (!this.changes[pageUrl][pageContent.identifier])
      this.changes[pageUrl][pageContent.identifier] = [];
    if (!this.activeSync[pageUrl]) {
      this.activeSync[pageUrl] = {};
      this.activeSync[pageUrl][pageContent.identifier] = false;
    } else if (this.activeSync[pageUrl][pageContent.identifier] === undefined) {
      this.activeSync[pageUrl][pageContent.identifier] = false;
    }
    this.changes[pageUrl][pageContent.identifier].push(pageContent);
    if (!this.activeSync[pageUrl][pageContent.identifier]) {
      this.activeSync[pageUrl][pageContent.identifier] = true;
      this.savePageContent(pageUrl, pageContent);
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

  removeNoteFromSection(
    pageIdentifier: string,
    sectionIdentifier: string
  ): void {
    const sectionURL = this.getURL(sectionIdentifier);
    getData(sectionURL).then(async (dataset) => {
      if (dataset) {
        let thing = getThing(dataset, sectionURL);
        if (!thing) throw new Error("No thing could be retrieved");
        thing = buildThing(thing)
          .removeUrl(NOTETAKING.hasPage, this.getURL(pageIdentifier))
          .build();
        await saveSolidDatasetAt(sectionURL, setThing(dataset, thing), {
          fetch,
        });
      }
    });
  }

  removeSectionFromNoteBook(
    sectionIdentifier: string,
    notebookIdentifier: string
  ): void {
    const notebookURL = this.getURL(notebookIdentifier);
    getData(notebookURL).then(async (dataset) => {
      if (dataset) {
        let thing = getThing(dataset, notebookURL);

        if (!thing) throw new Error("No thing could be retrieved");
        thing = buildThing(thing)
          .removeUrl(NOTETAKING.hasSection, this.getURL(sectionIdentifier))
          .build();
        await saveSolidDatasetAt(notebookURL, setThing(dataset, thing), {
          fetch,
        });
      }
    });
  }

  storeMiniEditor(pageIdentifier: string): void {
    getData(this.getURL(pageIdentifier)).then(async (value) => {
      console.log("this is the solidDataSet", value);
      const miniEditor = buildThing()
        .setUrl(RDF.type, NOTETAKING.NoteContent)
        .setInteger(NOTETAKING.distanceTop, 300)
        .setInteger(NOTETAKING.distanceLeft, 300)
        .setStringNoLocale(SCHEMA.Text, "")
        .build();
      if (value) {
        const response = await saveSolidDatasetAt(
          this.getURL(pageIdentifier),
          setThing(value, miniEditor),
          {
            fetch,
          }
        );
        console.log("this is the response", response);
      }
    });
  }

  getURL(identifier: string): string {
    let URL = this.rootUrl;
    if (identifier.includes("http")) URL = URL + retrieveIdentifier(identifier);
    else URL = URL + identifier;
    return URL;
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

  getLastContent(
    pageIdentifier: string,
    contentIdentifier: string
  ): PageContent {
    const length = this.changes[pageIdentifier][contentIdentifier].length;
    const changes = this.changes[pageIdentifier][contentIdentifier].splice(
      0,
      length
    );
    return changes[length - 1];
  }

  // saveNoteEditorPosition(): void {}

  savePageContent(pageIdentifier: string, pageContent: PageContent): void {
    console.log("this is pageIdentifier", pageIdentifier);
    console.log("this is pageContent", pageContent);
    const content = this.getLastContent(pageIdentifier, pageContent.identifier);
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
              URL + `#${pageContent.identifier}`
            );
            if (!thing) {
              thing = buildThing({ name: pageContent.identifier });
              thing.setUrl(RDF.type, NOTETAKING.NoteContent);
              pageThing = buildThing(pageThing)
                .addUrl(
                  NOTETAKING.hasPageContent,
                  URL + `#${pageContent.identifier}`
                )
                .build();
              dataSet = setThing(dataSet, pageThing);
            } else {
              thing = buildThing(thing);
            }
            thing = thing
              .setStringNoLocale(SCHEMA.Text, content.content)
              .setInteger(NOTETAKING.distanceTop, content.top)
              .setInteger(NOTETAKING.distanceLeft, content.left);
            console.log("this is dataset before saving", dataSet);
            saveSolidDatasetAt(URL, setThing(dataSet, thing.build()), {
              fetch,
            }).then(() => {
              if (
                this.changes[pageIdentifier][pageContent.identifier].length ===
                0
              ) {
                this.activeSync[pageIdentifier][pageContent.identifier] = false;
              } else {
                this.savePageContent(pageIdentifier, pageContent);
              }
            });
          }
        }
      });
    }
  }
}
