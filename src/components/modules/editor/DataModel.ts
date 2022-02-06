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
  saveSolidDatasetAt,
  setThing,
  Thing,
  ThingPersisted,
} from "@inrupt/solid-client";
import { DCTERMS, RDF } from "@inrupt/vocab-common-rdf";
import NOTETAKING from "@/components/genericcomponents/vocabs/NOTETAKING";
import { fetch } from "@inrupt/solid-client-authn-browser";
import { getData } from "@/components/genericcomponents/utils/utils";
import { NamedNode, VocabTerm } from "@inrupt/solid-common-vocab";
import { ZIndexUtils } from "primevue/utils";
import get = ZIndexUtils.get;
import { ItemInterface } from "@/components/modules/editor/Editor";

const ROOT_URL = `https://mauritsderoover.solidcommunity.net/notes/`;

export async function loadData(): Promise<void> {
  const rootDataSet = await getData(ROOT_URL);
  console.log("this is rootDataSet", rootDataSet);
  const urls = rootDataSet
    ? getContainedResourceUrlAll(rootDataSet)
    : undefined;
  console.log("this is urls", urls);
  const dataSet = urls ? await getData(urls[0]) : undefined;
  const thingList = dataSet ? getThingAll(dataSet) : undefined;
  const thing = thingList ? thingList[0] : undefined;
  console.log("this is thing", thing?.predicates[RDF.type]);
  console.log("this is dataset", dataSet ? getThingAll(dataSet) : undefined);
  if (thing) processThing(thing);
}

async function processThing(thing: Thing) {
  if (isNoteBook(thing)) processNoteBook(thing);
  if (isSectionGroup(thing))
    throw new Error("Section groups are not supported");
  if (isSection(thing)) processNoteBook(await getNoteBook(thing));
  if (isPageGroup(thing)) throw new Error("This needs to be implemented");
  if (isPage(thing)) throw new Error("This needs to be implemented");
}

/**
 * This functions processes and structures all information in a notebook.
 * Currently there is only support for sections.
 * We also only support one notebook currently but this can be increased in the future
 */
async function processNoteBook(thing: Thing) {
  console.log("this is thing in process notebook", thing);
  const sectionUrls = getSectionUrls(thing);
  for (const section of sectionUrls) {
    await processSection(section);
  }
}

async function processPage(url: string): Promise<ItemInterface> {
  const pageThing = await getThingFromSolidPod(url);
  const label = getPredicate(pageThing, DCTERMS.title);
  console.log("this is label in processPage");
  return {
    label: "",
    key: "",
    uri: new URL(pageThing.url),
  };
}

/**
 * Sections can contain pages and page groups but currently only pages are supported
 * @param sectionUrl
 */
async function processSection(sectionUrl: string) {
  const sectionThing = await getThingFromSolidPod(sectionUrl);
  const pageUrls = getPageUrls(sectionThing);
  pageUrls.forEach((page) => {
    processPage(page)
  });
}

function getPageUrls(thing: ThingPersisted): string[] {
  return getThingUrls(thing, NOTETAKING.hasPage);
}

async function getThingFromSolidPod(url: string): Promise<ThingPersisted> {
  const thingDataSet = await getData(url);
  if (thingDataSet) {
    const thing: ThingPersisted | null = getThing(thingDataSet, url);
    if (thing !== null) return thing;
    throw new Error("No thing was found in provided dataset");
  }
  throw new Error("No dataset could be retrieved");
}

function getThingUrls(thing: ThingPersisted, predicate: VocabTerm) {
  const urls = getPredicate(thing, (predicate as VocabTerm).iri.value);
  if (Array.isArray(urls)) return urls;
  throw new Error("SectionUrls must be an array");
}

function getSectionUrls(thing: ThingPersisted): string[] {
  return getThingUrls(thing, NOTETAKING.hasSection);
}

async function getNoteBook(thing: Thing): Promise<Thing> {
  const noteBookUrl = getNoteBookUrl(thing);
  const noteBookDataSet = await getData(noteBookUrl);
  if (noteBookDataSet) return getThing(noteBookDataSet, noteBookUrl) as Thing;
  throw new Error("noteBookDataSet does not exist");
}

function processSectionGroup() {
  throw new Error("This needs to be implemented");
}

function retrieveSection() {
  throw new Error("This needs to be implemented");
}

function isSectionGroup(thing: Thing): boolean {
  return ThingOfType(thing, NOTETAKING.SectionGroup);
}

function isPageGroup(thing: Thing): boolean {
  return ThingOfType(thing, NOTETAKING.PageGroup);
}

function isPage(thing: Thing): boolean {
  return ThingOfType(thing, NOTETAKING.Note);
}

function isSection(thing: Thing): boolean {
  return ThingOfType(thing, NOTETAKING.Section);
}

function isNoteBook(thing: Thing): boolean {
  return ThingOfType(thing, NOTETAKING.NoteBook);
}

function ThingOfType(thing: Thing, vocabTerm: VocabTerm): boolean {
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

function getTitle(thing: ThingPersisted): string {
  const titlePredicates = getPredicate(thing, DCTERMS.title);
  console.log("this is titlePredicates in getTitle", titlePredicates);
  return "this is intermediate title";
}

function getPredicate(
  thing: Thing,
  predicate: string
): string | readonly string[] | undefined {
  if (thing.predicates) {
    return thing.predicates[predicate].namedNodes;
  }
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
export async function newNoteBook(title: string): Promise<void> {
  console.log("this newNoteBook function has been reached");
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
  const pageID = await createNote("TesterNote");
  const pageID2 = await createNote("TesterNote2");
  const pageID3 = await createNote("TesterNote3");
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
enum hasPage {
  SECTION,
  PAGE_GROUP,
}

async function linkPage(
  target: hasPage,
  pageIdentifier: string,
  targetIdentifier: string
) {
  console.log("this linkPage function has been reached");
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
enum hasSection {
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
  console.log("this linkSection function has been reached");
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

function makeId(length = 28): string {
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

async function createNote(title: string): Promise<string> {
  console.log("this is in createNote");
  return await createNoteTakingElement(title, NOTETAKING.Note);
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
