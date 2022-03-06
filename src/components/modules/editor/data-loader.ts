import {
  buildThing,
  createSolidDataset,
  createThing,
  getContainedResourceUrlAll,
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
  getEditorContent,
  getNoteBook,
  getPageText,
  getPageUrls,
  getPosition,
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
import {
  PanelMenuItems,
  TabItems,
} from "@/components/modules/editor/editor-interfaces";
import { PageItem, TabItem } from "@/components/modules/editor/editor-classes";
import { DCTERMS, RDF } from "@inrupt/vocab-common-rdf";
import { fetch } from "@inrupt/solid-client-authn-browser";
import SCHEMA from "@/components/genericcomponents/vocabs/SCHEMA";
import NOTETAKING from "@/components/genericcomponents/vocabs/NOTETAKING";
import DataSynchronizer from "@/components/modules/editor/data-synchronizer";

export default class DataLoader {
  rootDataSet?: SolidDataset & WithResourceInfo;
  things: Record<string, ThingPersisted>;
  resourceUrls: string[];
  rootUrl: string;
  panelMenuItems: PanelMenuItems;
  tabItems: TabItems;
  notebook?: string;
  dataSynchronizer: DataSynchronizer;

  constructor(
    rootUrl: string,
    panelMenuItems: PanelMenuItems,
    tabItems: TabItems
  ) {
    this.things = {};
    this.panelMenuItems = panelMenuItems;
    this.tabItems = tabItems;
    this.resourceUrls = [];
    this.rootUrl = rootUrl;
    this.dataSynchronizer = new DataSynchronizer(this.rootUrl);
    this.getRootDataSet().then(() => this.getAllContainedUrls());
  }

  async getRootDataSet(): Promise<void> {
    if (this.rootUrl) {
      const value = await getData(this.rootUrl);
      if (!value) throw new Error("No root dataset has been found");
      this.rootDataSet = value;
    }
  }

  cleanNotesContainer(): void {
    this.resourceUrls.forEach((resourceURL) => {
      getThingFromSolidPod(resourceURL).then((thing) => {
        if (thing) {
          if (isPage(thing)) {
            const sectionUrl = getSectionUrlFromNote(thing);
            getSolidDataset(sectionUrl, { fetch }).catch(() => {
              this.dataSynchronizer.deleteNoteResource(thing.url);
            });
          }
          if (isNoteBook(thing)) {
            const sectionsUrls = getSectionUrls(thing);
            sectionsUrls.forEach((sectionUrl) => {
              getSolidDataset(sectionUrl, { fetch }).catch(() => {
                if (this.notebook) {
                  this.dataSynchronizer.removeSectionFromNoteBook(
                    sectionUrl,
                    this.notebook
                  );
                }
              });
            });
          }
        }
      });
    });
  }

  deleteNotePage(sectionIdentifier: string, item: PageItem): void {
    const index = this.panelMenuItems[sectionIdentifier].findIndex(
      (value) => value.key === item.key
    );
    console.log("this is index", index);
    this.panelMenuItems[sectionIdentifier].splice(index, 1);
    this.dataSynchronizer.removeNoteFromSection(item.key, sectionIdentifier);
    this.dataSynchronizer.deleteNoteResource(item.key);
  }

  deleteSection(item: BaseItem): void {
    const index = this.tabItems.findIndex((value) => value.key === item.key);
    this.tabItems.splice(index, 1);
    this.dataSynchronizer.deleteNoteResource(item.key);
    if (this.notebook)
      this.dataSynchronizer.removeSectionFromNoteBook(item.key, this.notebook);
    for (const pageItem of this.panelMenuItems[item.key]) {
      this.deleteNotePage(item.key, pageItem);
    }
    delete this.panelMenuItems[item.key];
  }

  getAllContainedUrls(): void {
    if (this.rootDataSet) {
      this.resourceUrls = getContainedResourceUrlAll(this.rootDataSet);
    }
  }

  loadData(): void {
    console.log("this is panelMenuItems", this.panelMenuItems);
    console.log("this is tabItems", this.tabItems);
    console.log("loadData in DataLoader has been called", new Date());
    console.log("this is things", this.things);
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
    this.notebook = thing.url;
    console.log("this is notebook in data-loader", this.notebook);
    const sectionUrls = getSectionUrls(thing);
    for (const section of sectionUrls) {
      this.processSection(section).then();
    }
  }

  saveAllPositions(): void {
    for (const tabPosition in this.tabItems) {
      this.dataSynchronizer.savePosition(
        this.tabItems[tabPosition].key,
        Number(tabPosition)
      );
      const menuItems = this.panelMenuItems[this.tabItems[tabPosition].key];
      for (const pagePosition in menuItems) {
        this.dataSynchronizer.savePosition(
          menuItems[pagePosition].key,
          Number(pagePosition)
        );
      }
    }
  }

  /**
   * Sections can contain pages and page groups but currently only pages are supported
   * @param sectionUrl
   */
  async processSection(sectionUrl: string): Promise<void> {
    const sectionThing = await getThingFromSolidPod(sectionUrl);
    const position = getPosition(sectionThing);

    this.tabItems.splice(
      Number(position),
      0,
      new TabItem({
        key: retrieveIdentifier(sectionUrl),
        label: getTitle(sectionThing),
        url: sectionUrl,
      })
    );
    this.panelMenuItems[retrieveIdentifier(sectionUrl)] = [];
    if (hasPages(sectionThing)) {
      const pageUrls = getPageUrls(sectionThing);
      for (const page of pageUrls) {
        this.processPage(page, retrieveIdentifier(sectionUrl));
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
      this.panelMenuItems[retrieveIdentifier(sectionUrl)].push(
        new PageItem({
          key: pageIdentifier,
          url: `${this.rootUrl}${pageIdentifier}`,
          label: "SomeRandomPage",
          editor: "",
        })
      );
    }
  }

  processPage(url: string, sectionIdentifier: string): void {
    getThingFromSolidPod(url).then((value) => {
      this.panelMenuItems[sectionIdentifier].push(
        new PageItem({
          label: getTitle(value),
          key: retrieveIdentifier(url),
          url: url,
          editor: getEditorContent(getPageText(value)),
        })
      );
    });
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

  newSection(): string {
    if (this.notebook) {
      const sectionIdentifier = makeId();
      const pageIdentifier = makeId();

      this.createSection(
        sectionIdentifier,
        "New Section",
        this.tabItems.length
      ).then(() => {
        if (this.notebook)
          this.linkSection(
            hasSection.NOTEBOOK,
            sectionIdentifier,
            retrieveIdentifier(this.notebook)
          ).then();
        this.createPage(pageIdentifier, "New Page", 0).then(() => {
          this.linkPage(
            hasPage.SECTION,
            pageIdentifier,
            sectionIdentifier
          ).then();
        });
      });
      this.tabItems.push(
        new TabItem({
          label: "Untitled",
          url: this.rootUrl + sectionIdentifier,
          key: sectionIdentifier,
        })
      );
      this.panelMenuItems[sectionIdentifier] = [
        new PageItem({
          label: "New Page",
          url: this.rootUrl + pageIdentifier,
          key: pageIdentifier,
          editor: "",
        }),
      ];
      return sectionIdentifier;
    }
    throw new Error("A notebook has not yet been identifier");
  }

  newPage(sectionIdentifier: string): void {
    const pageIdentifier = makeId();
    this.createPage(
      pageIdentifier,
      "New Page",
      this.panelMenuItems[sectionIdentifier].length
    ).then(() => {
      this.linkPage(hasPage.SECTION, pageIdentifier, sectionIdentifier).then();
    });
    this.panelMenuItems[sectionIdentifier].push(
      new PageItem({
        label: "New Page",
        url: this.rootUrl + pageIdentifier,
        key: pageIdentifier,
        editor: "",
      })
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
    console.log("this is sectionURL", sectionURL);
    console.log("this is targetUrl", targetURL);
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
    console.log("this has been called in linkPage");
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
