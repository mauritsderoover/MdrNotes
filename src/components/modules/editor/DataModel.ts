/**
 *  A notebook is the base entity and holds a collection of Sections and/or
 *  SectionGroups
 */
// import { containerExists } from "@/components/genericcomponents/utils/utils";

// export interface NoteBook {
//   hasSection: Array<Section>;
//   hasSectionGroup: Array<SectionGroup>;
// }

// export interface Note {}
//
// export interface PageGroup {}
//
// export interface Section {}
//
// export interface SectionGroup {}

import {
  buildThing,
  createSolidDataset,
  createThing,
  getContainedResourceUrlAll,
  getThing,
  getThingAll,
  Iri,
  saveSolidDatasetAt,
  setThing,
  Thing,
  ThingPersisted,
} from "@inrupt/solid-client";
import { DCTERMS, RDF } from "@inrupt/vocab-common-rdf";
import NOTETAKING from "@/components/genericcomponents/vocabs/NOTETAKING";
import { fetch } from "@inrupt/solid-client-authn-browser";
import { getData } from "@/components/genericcomponents/utils/utils";
import { VocabTerm } from "@inrupt/solid-common-vocab";
import {
  BaseItem,
  PanelMenuItem,
  PanelMenuItems,
  TabItems,
} from "@/components/modules/editor/editor-interfaces";
// import { XmlSchemaTypeIri } from "@inrupt/solid-client/src/datatypes";
// import { IriString } from "@inrupt/solid-client/src/interfaces";
import SCHEMA from "@/components/genericcomponents/vocabs/SCHEMA";
import { PageItem, TabItem } from "@/components/modules/editor/editor-classes";

const ROOT_URL = `https://mauritsderoover.solidcommunity.net/notes/`;

export type XmlSchemaTypeIri =
  typeof xmlSchemaTypes[keyof typeof xmlSchemaTypes];

export const xmlSchemaTypes = {
  boolean: "http://www.w3.org/2001/XMLSchema#boolean",
  dateTime: "http://www.w3.org/2001/XMLSchema#dateTime",
  date: "http://www.w3.org/2001/XMLSchema#date",
  time: "http://www.w3.org/2001/XMLSchema#time",
  decimal: "http://www.w3.org/2001/XMLSchema#decimal",
  integer: "http://www.w3.org/2001/XMLSchema#integer",
  string: "http://www.w3.org/2001/XMLSchema#string",
  langString: "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString",
} as const;

export async function loadData(): Promise<[string, TabItems, PanelMenuItems]> {
  const rootDataSet = await getData(ROOT_URL);
  const urls = rootDataSet
    ? getContainedResourceUrlAll(rootDataSet)
    : undefined;
  const dataSet = urls ? await getData(urls[0]) : undefined;
  const thingList = dataSet ? getThingAll(dataSet) : undefined;
  const thing = thingList ? thingList[0] : undefined;

  if (thing) {
    const toBeReturned = await processThing(thing);
    return toBeReturned;
  }
  throw new Error("No thing was found");
}

export async function saveTitle(
  identifier: string,
  newTitle: string
): Promise<void> {
  const URL = retrieveUrl(identifier);
  const dataSet = await getData(URL);
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
}

function retrieveUrl(identifier: string): string {
  let URL = ROOT_URL;
  if (identifier.includes("http")) URL = URL + retrieveIdentifier(identifier);
  else URL = URL + identifier;
  return URL;
}

export async function savePageContent(
  pageIdentifier: string,
  content: string
): Promise<void> {
  let URL = ROOT_URL;
  if (pageIdentifier.includes("http"))
    URL = URL + retrieveIdentifier(pageIdentifier);
  else URL = URL + pageIdentifier;
  const dataSet = await getData(URL);
  if (dataSet) {
    let thing = getThing(dataSet, URL);
    if (!thing) throw new Error("No thing could be retrieved");
    if (!isPage(thing)) throw new Error("The thing is no page Thing");
    thing = buildThing(thing).setStringNoLocale(SCHEMA.Text, content).build();
    await saveSolidDatasetAt(URL, setThing(dataSet, thing), {
      fetch,
    });
  }
}

async function processThing(
  thing: Thing
): Promise<[string, TabItems, PanelMenuItems]> {
  if (isNoteBook(thing)) return await processNoteBook(thing);
  if (isSectionGroup(thing))
    throw new Error("Section groups are not supported");
  if (isSection(thing) || isPage(thing))
    return await processNoteBook(await getNoteBook(thing));
  if (isPageGroup(thing)) throw new Error("This needs to be implemented");
  throw new Error("No option has been reached");
}

/**
 * This functions processes and structures all information in a notebook.
 * Currently there is only support for sections.
 * We also only support one notebook currently but this can be increased in the future
 */
async function processNoteBook(
  thing: Thing
): Promise<[string, TabItems, PanelMenuItems]> {
  const sectionUrls = getSectionUrls(thing);
  const panelMenuItems: PanelMenuItems = {};
  const tabItems: TabItems = [];
  for (const section of sectionUrls) {
    const identifier = retrieveIdentifier(section);
    panelMenuItems[identifier] = await processSection(section);
    tabItems.push({
      key: identifier,
      uri: new URL(section),
      label: getTitle(await getThingFromSolidPod(section)),
    });
  }
  return [retrieveIdentifier(thing.url), tabItems, panelMenuItems];
}

export async function processPage(url: string): Promise<PageItem> {
  const thing = await getThingFromSolidPod(url);
  return new PageItem({
    label: getTitle(thing),
    key: retrieveIdentifier(url),
    url: url,
    editor: getEditorContent(getPageText(thing)),
  });
}

export function getEditorContent(content: string): string {
  try {
    return JSON.parse(content);
  } catch {
    return content;
  }
}

/**
 * Sections can contain pages and page groups but currently only pages are supported
 * @param sectionUrl
 */
async function processSection(sectionUrl: string): Promise<PanelMenuItem[]> {
  const sectionThing = await getThingFromSolidPod(sectionUrl);
  const section: Array<PanelMenuItem> = [];
  if (hasPages(sectionThing)) {
    const pageUrls = getPageUrls(sectionThing);
    for (const page of pageUrls) {
      section.push(await processPage(page));
    }
    return section;
  } else {
    const pageIdentifier = await createPage("SomeRandomPage");
    await linkPage(
      hasPage.SECTION,
      pageIdentifier,
      retrieveIdentifier(sectionUrl)
    );
    section.push(
      new PageItem({
        key: pageIdentifier,
        url: `${ROOT_URL} + ${pageIdentifier}`,
        label: "SomeRandomPage",
        editor: "",
      })
    );
    return section;
  }
}

export function getPageUrls(thing: ThingPersisted): string[] {
  return getThingUrls(thing, NOTETAKING.hasPage);
}

export async function getThingFromSolidPod(
  url: string
): Promise<ThingPersisted> {
  const thingDataSet = await getData(url);
  if (thingDataSet) {
    const thing: ThingPersisted | null = getThing(thingDataSet, url);
    if (thing !== null) return thing;
    throw new Error("No thing was found in provided dataset");
  }
  throw new Error("No dataset could be retrieved");
}

export function getThingUrls(thing: ThingPersisted, predicate: VocabTerm) {
  const urls = getPredicate(thing, (predicate as VocabTerm).iri.value);
  if (Array.isArray(urls)) return urls;
  throw new Error("SectionUrls must be an array");
}

export function getSectionUrls(thing: ThingPersisted): string[] {
  return getThingUrls(thing, NOTETAKING.hasSection);
}

export async function getNoteBook(thing: Thing): Promise<Thing> {
  let internalThing = thing;
  if (isPage(thing)) internalThing = await getSection(thing);
  const noteBookUrl = getNoteBookUrl(internalThing);
  const noteBookDataSet = await getData(noteBookUrl);
  if (noteBookDataSet) return getThing(noteBookDataSet, noteBookUrl) as Thing;
  throw new Error("noteBookDataSet does not exist");
}

async function getSection(thing: Thing): Promise<Thing> {
  const sectionUrl = getSectionUrl(thing);
  const sectionDataSet = await getData(sectionUrl);
  if (sectionDataSet) return getThing(sectionDataSet, sectionUrl) as Thing;
  throw new Error("noteBookDataSet does not exist");
}

function getSectionUrl(thing: Thing): string {
  const section = getPredicate(
    thing,
    (NOTETAKING.partOfSection as VocabTerm).iri.value
  );
  if (section) {
    if (Array.isArray(section) && section.length === 1) return section[0];
    if (typeof section === "string") return section;
  }
  throw new Error("A partOfSection does not exist");
}

function processSectionGroup() {
  throw new Error("This needs to be implemented");
}

function retrieveSection() {
  throw new Error("This needs to be implemented");
}

export function isSectionGroup(thing: Thing): boolean {
  return ThingOfType(thing, NOTETAKING.SectionGroup);
}

export function isPageGroup(thing: Thing): boolean {
  return ThingOfType(thing, NOTETAKING.PageGroup);
}

export function isPage(thing: Thing): boolean {
  return ThingOfType(thing, NOTETAKING.Note);
}

export function isSection(thing: Thing): boolean {
  return ThingOfType(thing, NOTETAKING.Section);
}

export function isNoteBook(thing: Thing): boolean {
  return ThingOfType(thing, NOTETAKING.NoteBook);
}

function ThingOfType(thing: ThingPersisted, vocabTerm: VocabTerm): boolean {
  const ThingType = getThingType(thing);
  if (Array.isArray(ThingType)) return ThingType.includes(vocabTerm.iri.value);
  return ThingType === vocabTerm.iri.value;
}

function getNoteBookUrl(thing: Thing): string {
  const noteBook = getPredicate(
    thing,
    (NOTETAKING.partOfNoteBook as VocabTerm).iri.value
  );
  if (noteBook) {
    if (Array.isArray(noteBook) && noteBook.length === 1) return noteBook[0];
    if (typeof noteBook === "string") return noteBook;
  }
  throw new Error("A partOfNoteBook does not exist");
}

function getThingType(thing: Thing): string | readonly string[] | undefined {
  return getPredicate(thing, RDF.type);
}

export function getPageText(thing: ThingPersisted): string {
  const titlePredicates = getPredicate(thing, SCHEMA.Text);
  if (titlePredicates) {
    if (Array.isArray(titlePredicates) && titlePredicates.length > 0)
      return titlePredicates[0];
    if (typeof titlePredicates === "string") return titlePredicates;
    throw new Error("Impossible option has been reached");
  }
  return "{}";
}

export function getPosition(thing: ThingPersisted): string {
  const predicates = getPredicate(thing, SCHEMA.position);
  if (Array.isArray(predicates) && predicates.length > 0) return predicates[0];
  if (typeof predicates === "string") return predicates;
  throw new Error("Impossible option has been reached");
}

export function getTitle(thing: ThingPersisted): string {
  const titlePredicates = getPredicate(thing, DCTERMS.title);
  if (Array.isArray(titlePredicates) && titlePredicates.length > 0)
    return titlePredicates[0];
  if (typeof titlePredicates === "string") return titlePredicates;
  throw new Error("Impossible option has been reached");
}

export function hasPages(thing: ThingPersisted): boolean {
  return !!getPredicate(thing, NOTETAKING.hasPage);
}

export function getPredicate(
  thing: Thing,
  predicateIri: string
): string | readonly string[] | undefined {
  if (thing.predicates) {
    const predicate = thing.predicates[predicateIri];
    if (predicate) {
      if (predicate.blankNodes)
        throw new Error("Blank node support has not been implemented");
      if (predicate.namedNodes) return predicate.namedNodes;
      if (predicate.langStrings)
        throw new Error("Language strings have not yet been implemented");
      if (predicate.literals) return processLiterals(predicate.literals);
    }
  }
}

type DataTypeIriString = XmlSchemaTypeIri | string;

export function processLiterals(
  literals: Readonly<Record<DataTypeIriString, readonly string[]>>
): readonly string[] | undefined {
  if (literals[xmlSchemaTypes.string]) return literals[xmlSchemaTypes.string];
  if (literals[xmlSchemaTypes.integer]) return literals[xmlSchemaTypes.integer];
  return undefined;
}

/**
 * The identifier is the last part of a resource URL
 *
 * @param iri
 */
export function retrieveIdentifier(iri: string): string {
  const lastElement = iri.split("/").at(-1);
  if (lastElement) return lastElement;
  throw new Error("No last element found");
}

/**
 * The creation of a new page/note requires the necessary triples.
 *    - the creation of new thing containing
 *    - storing the new thing in the notes container
 *
 */
// async function newNote(Note: Note) {
//   // First we check if a notes folder exists
//   const Thing =
//   if (await containerExists()) {
//
//   }
// }
export async function newSection(
  noteBookIdentifier: string
): Promise<[BaseItem, PanelMenuItems]> {
  let sectionIdentifer: string | Promise<string> = createSection("New Section");
  let pageIdentifier: string | Promise<string> = createPage("New Page");
  [sectionIdentifer, pageIdentifier] = await Promise.all([
    sectionIdentifer,
    pageIdentifier,
  ]);
  await Promise.all([
    linkPage(hasPage.SECTION, pageIdentifier, sectionIdentifer),
    linkSection(hasSection.NOTEBOOK, sectionIdentifer, noteBookIdentifier),
  ]);

  const newTabItem: BaseItem = new TabItem({
    label: "New Section",
    url: ROOT_URL + sectionIdentifer,
    key: sectionIdentifer,
  });

  const newPanelMenu: PanelMenuItems = {
    sectionIdentifier: [
      new PageItem({
        label: "New Page",
        url: ROOT_URL + pageIdentifier,
        key: pageIdentifier,
        editor: "",
      }),
    ],
  };

  return [newTabItem, newPanelMenu];
}

export async function newPage(sectionIdentifier: string): Promise<PageItem> {
  const pageIdentifier = await createPage("New Page");
  await linkPage(hasPage.SECTION, pageIdentifier, sectionIdentifier);
  return new PageItem({
    label: "New Page",
    url: ROOT_URL + pageIdentifier,
    key: pageIdentifier,
    editor: "",
  });
}

export async function newNoteBook(title: string): Promise<void> {
  let notebookID: string | Promise<string> = createNoteBook(title);
  let sectionID: string | Promise<string> = createSection("untitled");
  let sectionID2: string | Promise<string> = createSection("another Section");
  let sectionID3: string | Promise<string> = createSection("Section3");
  [notebookID, sectionID, sectionID2, sectionID3] = await Promise.all([
    notebookID,
    sectionID,
    sectionID2,
    sectionID3,
  ]);
  const pageID = await createPage("TesterNote");
  const pageID2 = await createPage("TesterNote2");
  const pageID3 = await createPage("TesterNote3");
  // await linkSection(hasSection.NOTEBOOK, sectionID, notebookID);
  // await linkSection(hasSection.NOTEBOOK, sectionID2, notebookID);
  // await linkSection(hasSection.NOTEBOOK, sectionID3, notebookID);
  // await linkPage(hasPage.SECTION, pageID, sectionID);
  // await linkPage(hasPage.SECTION, pageID2, sectionID);
  // await linkPage(hasPage.SECTION, pageID3, sectionID2);
  await Promise.all([
    linkSection(hasSection.NOTEBOOK, sectionID, notebookID),
    linkSection(hasSection.NOTEBOOK, sectionID2, notebookID),
    linkSection(hasSection.NOTEBOOK, sectionID3, notebookID),
    linkPage(hasPage.SECTION, pageID, sectionID),
    linkPage(hasPage.SECTION, pageID2, sectionID),
    linkPage(hasPage.SECTION, pageID3, sectionID2),
  ]);
}

/**
 * A page or note can be linked to pagegroup or a
 */
export enum hasPage {
  SECTION,
  PAGE_GROUP,
}

export async function linkPage(
  target: hasPage,
  pageIdentifier: string,
  targetIdentifier: string
) {
  const pageURL = `https://mauritsderoover.solidcommunity.net/notes/${pageIdentifier}`;
  const targetURL = `https://mauritsderoover.solidcommunity.net/notes/${targetIdentifier}`;
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

async function createNoteBook(title: string): Promise<string> {
  return await createNoteTakingElement(title, NOTETAKING.NoteBook);
}

/**
 * A saction can be linked to a notebook or a sectiongroup
 */
export enum hasSection {
  NOTEBOOK,
  SECTIONGROUP,
}

/**
 * A section can be added to either a notebook or a section group
 * @param target: determines whether a section is added to a notebook or section group
 * @param sectionIdentifier: the section that is being linked
 * @param targetIdentifier: the target that is being linked
 */
async function linkSection(
  target: hasSection,
  sectionIdentifier: string,
  targetIdentifier: string
) {
  const sectionURL = `https://mauritsderoover.solidcommunity.net/notes/${sectionIdentifier}`;
  const targetURL = `https://mauritsderoover.solidcommunity.net/notes/${targetIdentifier}`;
  const sectionDataset = await getData(sectionURL);
  const targetDataset = await getData(targetURL);
  if (sectionDataset) {
    let thing = getThing(sectionDataset, sectionURL);
    if (thing) {
      if (target === hasSection.NOTEBOOK) {
        thing = buildThing(thing)
          .addUrl(NOTETAKING.partOfNoteBook, targetURL)
          .build();
        await saveSolidDatasetAt(sectionURL, setThing(sectionDataset, thing), {
          fetch,
        });
      } else if (target === hasSection.SECTIONGROUP) {
        thing = buildThing(thing)
          .addUrl(NOTETAKING.partOfSectionGroup, targetURL)
          .build();
        await saveSolidDatasetAt(sectionURL, setThing(sectionDataset, thing), {
          fetch,
        });
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

/**
 * A section must be part of either a section group or a
 *
 * @param title
 */
async function createSection(title: string): Promise<string> {
  return await createNoteTakingElement(title, NOTETAKING.Section);
}

export function makeId(length = 28): string {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

async function createSectionGroup(title: string): Promise<string> {
  return await createNoteTakingElement(title, NOTETAKING.SectionGroup);
}

async function createPageGroup(title: string): Promise<string> {
  return await createNoteTakingElement(title, NOTETAKING.PageGroup);
}

export async function createPage(title: string): Promise<string> {
  const identifier = await createNoteTakingElement(title, NOTETAKING.Note);
  savePageContent(identifier, "").then();
  return identifier;
}

async function createNoteTakingElement(
  title: string,
  URI: string
): Promise<string> {
  const identifier = makeId();
  const url = `https://mauritsderoover.solidcommunity.net/notes/${identifier}`;
  const thing = buildThing(createThing({ url: url }))
    .addUrl(RDF.type, URI)
    .addStringNoLocale(DCTERMS.title, title)
    .build();
  await saveSolidDatasetAt(url, setThing(createSolidDataset(), thing), {
    fetch,
  });
  return identifier;
}

export function newPageGroup() {
  // TODO
}
