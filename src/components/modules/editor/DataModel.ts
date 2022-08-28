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
  getThing,
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
// import { XmlSchemaTypeIri } from "@inrupt/solid-client/src/datatypes";
// import { IriString } from "@inrupt/solid-client/src/interfaces";
import SCHEMA from "@/components/genericcomponents/vocabs/SCHEMA";

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

function retrieveUrl(identifier: string): string {
  let URL = getRootUrl();
  if (identifier.includes("http")) URL = URL + retrieveIdentifier(identifier);
  else URL = URL + identifier;
  return URL;
}

/**
 * This functions processes and structures all information in a notebook.
 * Currently there is only support for sections.
 * We also only support one notebook currently but this can be increased in the future
 */

export function getEditorContent(content: string): string {
  try {
    return JSON.parse(content);
  } catch {
    return content;
  }
}

export function getPageUrls(thing: ThingPersisted): string[] {
  return getThingUrls(thing, NOTETAKING.hasPage) as string[];
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

export function getThingUrls(
  thing: ThingPersisted,
  predicate: VocabTerm
): string | string[] {
  const urls = getPredicate(thing, (predicate as VocabTerm).iri.value);
  if (Array.isArray(urls)) return urls;
  if (typeof urls === "string") return urls;
  throw new Error("Urls must be an array or a string");
}

export function getSectionUrls(thing: ThingPersisted): string[] {
  return getThingUrls(thing, NOTETAKING.hasSection) as string[];
}

export function getSectionUrlFromNote(thing: ThingPersisted): string {
  return getThingUrls(thing, NOTETAKING.partOfSection) as string;
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
  // const dataLoader = new DataSynchronizer();
  throw new Error("sectionDataSet does not exist");
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

export function isSectionGroup(thing: Thing): boolean {
  return ThingOfType(thing, NOTETAKING.SectionGroup);
}

export function isPageGroup(thing: Thing): boolean {
  return ThingOfType(thing, NOTETAKING.PageGroup);
}

export function IsNoteContent(thing: Thing): boolean {
  return ThingOfType(thing, NOTETAKING.NoteContent);
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
  return "";
}

export function getDistanceLeft(thing: Thing): number {
  const distanceDistanceLeft = getPredicate(thing, NOTETAKING.distanceLeft);
  if (Array.isArray(distanceDistanceLeft) && distanceDistanceLeft.length > 0)
    return parseInt(distanceDistanceLeft[0]);
  if (typeof distanceDistanceLeft === "string")
    return parseInt(distanceDistanceLeft);
  throw new Error("Impossible option has been reached");
}

export function getDistanceTop(thing: Thing): number {
  const distanceTopSubject = getPredicate(thing, NOTETAKING.distanceTop);
  if (Array.isArray(distanceTopSubject) && distanceTopSubject.length > 0)
    return parseInt(distanceTopSubject[0]);
  if (typeof distanceTopSubject === "string")
    return parseInt(distanceTopSubject);
  throw new Error("Impossible option has been reached");
}

export function getPosition(thing: ThingPersisted): string {
  const predicates = getPredicate(thing, SCHEMA.position);
  if (Array.isArray(predicates) && predicates.length > 0) return predicates[0];
  if (typeof predicates === "string") return predicates;
  throw new Error("Impossible option has been reached");
}

export function hasLocation(thing: ThingPersisted): boolean {
  const locationLeft = getPredicate(thing, NOTETAKING.distanceLeft);
  const locationRight = getPredicate(thing, NOTETAKING.distanceTop);
  return !!(locationLeft && locationRight);
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

export function getNoteContentUrl(thing: Thing): Array<string> {
  const noteContentObjects = getPredicate(thing, NOTETAKING.hasPageContent);
  if (Array.isArray(noteContentObjects)) return noteContentObjects;
  return [];
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
 * The identifier is the last part of a resource URL or the hash
 *
 * @param iri
 */
export function retrieveIdentifier(iri: string): string {
  console.log("this is the incoming uri", iri);
  const url = new URL(iri);
  if (url.hash) return url.hash.substring(1);
  const lastElement = url.pathname.split("/").at(-1);
  if (lastElement) return lastElement;
  throw new Error("No last element found");
}

/**
 * A page or note can be linked to pagegroup or a
 */
export enum hasPage {
  SECTION,
  PAGE_GROUP,
}

/**
 * A saction can be linked to a notebook or a sectiongroup
 */
export enum hasSection {
  NOTEBOOK,
  SECTIONGROUP,
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

export function getRootUrl(ending = "/notes/"): string {
  const rootUrl = localStorage.getItem("origin");
  if (rootUrl) return rootUrl + ending;
  throw new Error("No rooturl has been stored yet");
}

export async function createNoteTakingElement(
  identifier: string,
  title: string,
  URI: string,
  position?: number
): Promise<void> {
  const url = `${getRootUrl()}${identifier}`;
  const thing = buildThing(createThing({ url: url }))
    .addUrl(RDF.type, URI)
    .addStringNoLocale(DCTERMS.title, title);

  if (position !== undefined) thing.addInteger(SCHEMA.position, position);

  await saveSolidDatasetAt(url, setThing(createSolidDataset(), thing.build()), {
    fetch,
  });
}

export function getIdentifierUrl(mainUrl: string, identifier: string): string {
  return mainUrl + "#" + identifier;
}

export function saveTitle(identifier: string, newTitle: string): void {
  const URL = `${getRootUrl()}${identifier}`;
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
