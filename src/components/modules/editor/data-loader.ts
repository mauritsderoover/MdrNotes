import {
  buildThing,
  createSolidDataset,
  createThing,
  getContainedResourceUrlAll,
  getSolidDataset,
  getThing,
  saveSolidDatasetAt,
  setThing,
  SolidDataset,
  Thing,
  ThingPersisted,
  WithResourceInfo,
} from "@inrupt/solid-client";
import { getData } from "@/components/genericcomponents/utils/utils";
import {
  getDistanceLeft,
  getDistanceTop,
  getEditorContent,
  getNoteBook,
  getNoteContentUrl,
  getPageText,
  getPageUrls,
  getPosition,
  getRootUrl,
  getSectionUrlFromNote,
  getSectionUrls,
  getThingFromSolidPod,
  getTitle,
  hasPage,
  hasPages,
  hasSection,
  isNoteBook,
  isPage,
  isPageGroup,
  isSection,
  isSectionGroup,
  makeId,
  retrieveIdentifier,
} from "@/components/modules/editor/DataModel";
import { DCTERMS, RDF } from "@inrupt/vocab-common-rdf";
import { fetch } from "@inrupt/solid-client-authn-browser";
import SCHEMA from "@/components/genericcomponents/vocabs/SCHEMA";
import NOTETAKING from "@/components/genericcomponents/vocabs/NOTETAKING";
import DataSynchronizer from "@/components/modules/editor/data-synchronizer";
import { Notebook } from "@/components/modules/editor/classes/notebook";
import { Page } from "@/components/modules/editor/classes/page";
import { Section } from "@/components/modules/editor/classes/section";
import { Note } from "@/components/modules/editor/classes/note";
import db from "@/components/modules/editor/MdrNotesDatabase";

export default class DataLoader {
  rootDataSet?: SolidDataset & WithResourceInfo;
  things: Record<string, ThingPersisted>;
  resourceUrls: string[];
  rootUrl: string;
  notebook?: Notebook;
  dataSynchronizer: DataSynchronizer;
  initialDataLoaded: boolean;
  highestPosition: number;
  positionTracker: Record<number, Section>;

  constructor() {
    this.things = {};
    this.resourceUrls = [];
    this.rootUrl = getRootUrl();
    this.initialDataLoaded = false;
    this.dataSynchronizer = new DataSynchronizer();
    this.initialize();
    this.highestPosition = 0;
    this.positionTracker = {};
    // this.getRootDataSet().then(() => this.getAllContainedUrls());
  }

  initialize(): void {
    this.getRootDataSet()
      .then(() => {
        this.getAllContainedUrls();
        this.loadData();
      })
      .catch(() => this.newNoteBook());
  }

  initialDataLoadedChecker(): Promise<void> {
    return new Promise<void>((resolve) => {
      (function checkRequirement(this: DataLoader) {
        if (this.initialDataLoaded) {
          resolve();
        } else setTimeout(checkRequirement.bind(this), 5);
      }.apply(this));
    });
  }

  // checkRequirements(): boolean {
  //   return (
  //     this.tabItems &&
  //     this.tabItems.length > 0 &&
  //     this.tabItems[0] !== undefined &&
  //     this.panelMenuItems &&
  //     this.panelMenuItems[this.tabItems[0].key] &&
  //     this.panelMenuItems[this.tabItems[0].key].length > 0
  //   );
  // }

  async getRootDataSet(): Promise<void> {
    if (this.rootUrl) {
      const value = await getData(this.rootUrl);
      if (!value) throw new Error("No root dataset has been found");
      this.rootDataSet = value;
    }
  }

  // cleanNotesContainer(): void {
  //   this.resourceUrls.forEach((resourceURL) => {
  //     getThingFromSolidPod(resourceURL).then((thing) => {
  //       if (thing) {
  //         if (isPage(thing)) {
  //           const sectionUrl = getSectionUrlFromNote(thing);
  //           getSolidDataset(sectionUrl, { fetch }).catch(() => {
  //             this.dataSynchronizer.deleteNoteResource(thing.url);
  //           });
  //         }
  //         if (isNoteBook(thing)) {
  //           const sectionsUrls = getSectionUrls(thing);
  //           sectionsUrls.forEach((sectionUrl) => {
  //             getSolidDataset(sectionUrl, { fetch }).catch(() => {
  //               if (this.notebook) {
  //                 this.dataSynchronizer.removeSectionFromNoteBook(
  //                   sectionUrl,
  //                   this.notebook.key
  //                 );
  //               }
  //             });
  //           });
  //         }
  //       }
  //     });
  //   });
  // }

  // deleteNotePage(
  //   sectionIdentifier: string,
  //   item: Page,
  //   sectionRemoval = true
  // ): void {
  //   const index = this.panelMenuItems[sectionIdentifier].findIndex(
  //     (value) => value.key === item.key
  //   );
  //
  //   this.panelMenuItems[sectionIdentifier].splice(index, 1);
  //   if (sectionRemoval)
  //     this.dataSynchronizer.removeNoteFromSection(item.key, sectionIdentifier);
  //   this.dataSynchronizer.deleteNoteResource(item.key);
  // }

  // deleteSection(item: Section): void {
  //   const index = this.tabItems.findIndex((value) => value.key === item.key);
  //   this.tabItems.splice(index, 1);
  //   this.dataSynchronizer.deleteNoteResource(item.key);
  //   if (this.notebook)
  //     this.dataSynchronizer.removeSectionFromNoteBook(
  //       item.key,
  //       this.notebook.key
  //     );
  //   for (const pageItem of this.panelMenuItems[item.key]) {
  //     this.deleteNotePage(item.key, pageItem, false);
  //   }
  //   delete this.panelMenuItems[item.key];
  // }

  getAllContainedUrls(): void {
    if (this.rootDataSet) {
      this.resourceUrls = getContainedResourceUrlAll(this.rootDataSet);
    }
  }

  async newNoteBook(): Promise<void> {
    this.notebook = new Notebook(makeId(), "Your first notebook");
    await this.notebook.saveToDatabase();
    const section = this.notebook.createSection();
    await section.saveToDatabase();
    const page = section.createPage();
    await page.saveToDatabase();

    this.initialDataLoaded = true;

    Promise.all([
      this.notebook.saveToSolid(),
      section.saveToSolid(),
      page.saveToSolid(),
    ]).then(() => {
      if (this.notebook) {
        Promise.all([
          section.linkSection(hasSection.NOTEBOOK, this.notebook.key),
          page.linkPage(hasPage.SECTION, section.key),
        ]);
      }
    });

    // this.panelMenuItems[section.key] = [page];
  }

  loadData(): void {
    if (this.resourceUrls && this.resourceUrls.length > 0) {
      getThingFromSolidPod(this.resourceUrls[0]).then((thing) => {
        this.processThing(thing);
      });
    }
  }

  processThing(thing: Thing): void {
    if (isNoteBook(thing)) this.processNoteBook(thing);
    else if (isSectionGroup(thing))
      throw new Error("Section groups are not supported");
    else if (isSection(thing) || isPage(thing))
      getNoteBook(thing).then((value) => this.processNoteBook(value));
    else if (isPageGroup(thing))
      throw new Error("This needs to be implemented");
    else throw new Error("No option has been reached");
  }

  /**
   * This functions processes and structures all information in a notebook.
   * Currently there is only support for sections.
   * We also only support one notebook currently but this can be increased in the future
   */
  processNoteBook(thing: Thing): void {
    db.notebooks
      .where("key")
      .equals(retrieveIdentifier(thing.url))
      .first()
      .then((notebook) => {
        if (!notebook) {
          this.notebook = new Notebook(
            retrieveIdentifier(thing.url),
            getTitle(thing)
          );
          this.notebook.saveToDatabase().then(() => {
            if (this.notebook) {
              const sectionUrls = getSectionUrls(thing);
              this.notebook.sections = [];
              for (const section of sectionUrls) {
                this.processSection(section).then();
              }
            }
          });
        } else {
          this.notebook = notebook;
          this.notebook.loadSectionsAndSectionGroups().then(() => {
            this.initialDataLoaded = true;
          });
        }
      });
  }

  /**
   * Sections can contain pages and page groups but currently only pages are supported
   * @param sectionUrl
   */
  async processSection(sectionUrl: string): Promise<void> {
    const sectionThing = await getThingFromSolidPod(sectionUrl);
    const position = Number(getPosition(sectionThing));
    if (this.notebook && this.notebook.id) {
      const section = new Section(
        retrieveIdentifier(sectionUrl),
        this.notebook.id,
        getTitle(sectionThing),
        this.notebook.sections.length
      );

      section.saveToDatabase().then(() => {
        if (this.notebook) {
          this.notebook.sections.splice(Number(position), 0, section);
        }

        // this.panelMenuItems[retrieveIdentifier(sectionUrl)] = [];
        if (hasPages(sectionThing)) {
          const pageUrls = getPageUrls(sectionThing);
          for (const page of pageUrls) {
            this.processPage(page, section);
          }
        } else {
          const pageIdentifier = makeId();
          this.createPage(pageIdentifier, "SomeRandomPage", 0).then(() => {
            this.linkPage(
              hasPage.SECTION,
              pageIdentifier,
              retrieveIdentifier(sectionUrl)
            );
          });
          const page = section.createPage();
          page.saveToDatabase();
          page.saveToSolid().then(() => {
            page.linkPage(hasPage.SECTION, section.key);
          });
        }
      });
    }
  }

  processPage(url: string, section: Section): void {
    getData(url).then((dataSet) => {
      if (!dataSet) throw new Error("No dataset could be found");
      const pageThing = getThing(dataSet, url);
      if (!pageThing) throw new Error("No PageThing could be found");
      const position = parseInt(getPosition(pageThing));
      if (section.id) {
        const page = new Page(
          retrieveIdentifier(url),
          getTitle(pageThing),
          section.id,
          position
        );
        page.saveToDatabase().then(() => {
          page.notes = this.getEditorContentArray(pageThing, dataSet, page);
          page.saveToDatabase().then();
        });

        section.pages.splice(position, 0, page);
        this.initialDataLoaded = true;
      }
    });
  }

  getEditorContentArray(
    thing: ThingPersisted,
    dataset: SolidDataset,
    page: Page
  ): Note[] {
    const editorContentArray = new Array<Note>();
    const noteContentUrls = getNoteContentUrl(thing);
    for (const noteContentUrl of noteContentUrls) {
      const editorContentThing = getThing(dataset, noteContentUrl);
      if (editorContentThing && page.id) {
        editorContentArray.push(
          new Note(
            retrieveIdentifier(noteContentUrl),
            page.id,
            getDistanceTop(editorContentThing),
            getDistanceLeft(editorContentThing),
            getEditorContent(getPageText(editorContentThing))
          )
        );
      }
    }
    return editorContentArray;
  }

  async createNoteTakingElement(
    identifier: string,
    title: string,
    URI: string,
    position?: number
  ): Promise<void> {
    const url = `${this.rootUrl}${identifier}`;
    const thing = buildThing(createThing({ url: url }))
      .addUrl(RDF.type, URI)
      .addStringNoLocale(DCTERMS.title, title);

    if (position !== undefined) thing.addInteger(SCHEMA.position, position);

    await saveSolidDatasetAt(
      url,
      setThing(createSolidDataset(), thing.build()),
      {
        fetch,
      }
    );
  }

  /**
   * A section can be added to either a notebook or a section group
   * @param target: determines whether a section is added to a notebook or section group
   * @param sectionIdentifier: the section that is being linked
   * @param targetIdentifier: the target that is being linked
   */
  async linkSection(
    target: hasSection,
    sectionIdentifier: string,
    targetIdentifier: string
  ) {
    const sectionURL = `${this.rootUrl}${sectionIdentifier}`;
    const targetURL = `${this.rootUrl}${targetIdentifier}`;
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

  async linkPage(
    target: hasPage,
    pageIdentifier: string,
    targetIdentifier: string
  ) {
    const pageURL = `${this.rootUrl}${pageIdentifier}`;
    const targetURL = `${this.rootUrl}${targetIdentifier}`;
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

  async createSection(
    sectionIdentifier: string,
    title: string,
    position: number
  ): Promise<void> {
    await this.createNoteTakingElement(
      sectionIdentifier,
      title,
      NOTETAKING.Section,
      position
    );
  }

  async createPage(
    pageIdentifier: string,
    title: string,
    position: number
  ): Promise<void> {
    await this.createNoteTakingElement(
      pageIdentifier,
      title,
      NOTETAKING.Note,
      position
    );
  }

  async createSectionGroup(
    sectionGroupIdentifier: string,
    title: string,
    position: number
  ): Promise<void> {
    await this.createNoteTakingElement(
      sectionGroupIdentifier,
      title,
      NOTETAKING.SectionGroup,
      position
    );
  }

  async createPageGroup(
    pageGroupIdentifier: string,
    title: string,
    position: number
  ): Promise<void> {
    await this.createNoteTakingElement(
      pageGroupIdentifier,
      title,
      NOTETAKING.PageGroup,
      position
    );
  }

  async createNoteBook(
    notebookIdentifier: string,
    title: string
  ): Promise<void> {
    await this.createNoteTakingElement(
      notebookIdentifier,
      title,
      NOTETAKING.NoteBook
    );
  }
}
