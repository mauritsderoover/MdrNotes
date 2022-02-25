import {
  getContainedResourceUrlAll,
  SolidDataset,
  Thing,
  ThingPersisted,
  WithResourceInfo,
} from "@inrupt/solid-client";
import { getData } from "@/components/genericcomponents/utils/utils";
import {
  createPage,
  getEditorContent,
  getNoteBook,
  getPageText,
  getPageUrls,
  getSectionUrls,
  getThingFromSolidPod,
  getTitle,
  hasPage,
  hasPages,
  isNoteBook,
  isPage,
  isPageGroup,
  isSection,
  isSectionGroup,
  linkPage,
  retrieveIdentifier,
} from "@/components/modules/editor/DataModel";
import {
  PanelMenuItems,
  TabItems,
} from "@/components/modules/editor/editor-interfaces";
import { PageItem, TabItem } from "@/components/modules/editor/editor-classes";

export default class DataLoader {
  rootDataSet?: SolidDataset & WithResourceInfo;
  things: Record<string, ThingPersisted>;
  resourceUrls: string[];
  rootUrl: string;
  panelMenuItems: PanelMenuItems;
  tabItems: TabItems;

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
    this.getRootDataSet().then(() => this.getAllContainedUrls());
  }

  async getRootDataSet(): Promise<void> {
    if (this.rootUrl) {
      const value = await getData(this.rootUrl);
      if (!value) throw new Error("No root dataset has been found");
      this.rootDataSet = value;
    }
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
    const sectionUrls = getSectionUrls(thing);
    for (const section of sectionUrls) {
      this.processSection(section).then();
    }
  }

  /**
   * Sections can contain pages and page groups but currently only pages are supported
   * @param sectionUrl
   */
  async processSection(sectionUrl: string): Promise<void> {
    const sectionThing = await getThingFromSolidPod(sectionUrl);
    this.tabItems.push(
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
      const pageIdentifier = await createPage("SomeRandomPage");
      await linkPage(
        hasPage.SECTION,
        pageIdentifier,
        retrieveIdentifier(sectionUrl)
      );
      this.panelMenuItems[retrieveIdentifier(sectionUrl)].push(
        new PageItem({
          key: pageIdentifier,
          url: `${this.rootUrl} + ${pageIdentifier}`,
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
}
