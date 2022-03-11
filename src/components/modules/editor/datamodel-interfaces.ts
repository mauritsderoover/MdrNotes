/**
 * A Note book container will container different note pages.
 * Notes cannot be switched between notebooks which why a slighty different
 * structure is used. Every notebook container is a container within the general notes
 * container.
 *
 */
export interface NoteBook {
  title: string;
  identifier: URL; // The identifier is the url of the notebook
  container: Array<URL>;
}

/**
 *
 *
 */
export interface BaseNotes {
  identifier: URL;
  title: string;
}

/**
 * A note tab is part of a notebook but does not contain any notes itself
 */
export interface NoteTab {
  identifier: URL;
  title: string;
  hasPart: Array<URL>;
  position: number;
}

/**
 * A note page contains actual notes but can also have child note pages
 * A note page is part of a noteTab or is part of another NotePage
 */
export interface NotePage {
  identifier: URL;
  title: string;
  isPartOf: URL;
  hasPart: Array<URL>;
}

export enum NotePredicates {
  hasPart,
  isPartOf,
}

export interface NoteContainerInterface {
  type: URL;
  abstract: string;
  accountablePerson: URL;
  creator: URL;
  dateCreated: Date;
  Text: JSON;
  hasPart: Array<URL>; // a note can have many sub note pages
  isPartOf?: URL; // a note can be a part of a differ
  position?: number;
}
