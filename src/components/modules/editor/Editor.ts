import Quill, { Delta } from "quill";
import { RDF } from "@inrupt/vocab-common-rdf";
import { Thing } from "@inrupt/solid-client";

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

export interface NoteContainerParameters {
  accountablePerson: URL;
  creator: URL;
}

// This class should implement the NoteContainerInterface
export class NoteContainer {
  type: URL;
  accountablePerson: URL;

  constructor(input: NoteContainerParameters) {
    this.type = new URL(RDF.type);
    this.accountablePerson = input.accountablePerson;
  }
}

export interface ContextMenuItem {
  label: string;
  icon: string;
}

export interface ItemInterface {
  label: string; // the label that will appear in the menu or tab button
  // the key is probably not necessary
  key: string; // the key which basically equals the container url
  uri: URL; // the url of the resource
  icon?: string;
  class?: string;
  command?: (arg0: any) => void;
  to?: string;
}

export interface PanelMenuItemInterface extends ItemInterface {
  items: Array<ItemInterface>;
}

export interface BaseItemParameters {
  label: string;
  url: string;
}

export class PanelItem implements PanelMenuItemInterface {
  key: string;
  uri: URL;
  label: string;
  items: Array<ItemInterface>;
  icon?: string;
  constructor(input: BaseItemParameters) {
    this.key = input.url;
    this.uri = new URL(input.url);
    this.label = input.label;
    this.icon = "pi pi-fw pi-file";
    this.items = [];
  }
}

export class Item implements ItemInterface {
  key: string;
  uri: URL;
  label: string;
  items: Array<ItemInterface>;
  icon?: string;
  constructor(input: BaseItemParameters) {
    this.key = input.url;
    this.uri = new URL(input.url);
    this.label = input.label;
    this.icon = "pi pi-fw pi-file";
    this.items = [];
  }
}

/**
 *  TabItems is an array of notes (a.k.a. pages).
 *
 *  In the future this interface would need to support page groups.
 */
export type TabItems = Array<ItemInterface>;

/**
 * The panel menu items refer to the sections.
 * A section can contain pages (or notes) and page groups
 * (which are collections of pages).
 *
 * Currently only pages are supported.
 *
 * The structure of the PanelMenuItems is
 * {SectionIdentifier1: Section1_Pages,
 * SectionIdentifier2: Section2_Pages,}
 */
export interface PanelMenuItems {
  [index: string]: TabItems;
}

export interface Editors {
  [index: string]: Delta;
}

export interface DraggableTabMenu {
  d_activeIndex: number | undefined;
  doubleClickActiveIndex: number | undefined;
  activeItem: ItemInterface | undefined;
  draggable: boolean;
  delay: number;
  clicks: number;
  timer: ReturnType<typeof setTimeout> | undefined;
  changeLabel: boolean;
  currentTarget: EventTarget | null;
  inputItem: HTMLInputElement | undefined;
  doubleClickedItem: ItemInterface | undefined;
}

export interface DraggablePanelMenu {
  activeItem: ItemInterface | undefined;
  doubleClickedItem: ItemInterface | undefined;
  doubleClickActiveIndex: number | undefined;
  rightClickedItem: ItemInterface | undefined;
  drag: boolean;
  delay: number;
  clicks: number;
  timer: ReturnType<typeof setTimeout> | undefined;
  changeLabel: boolean;
  currentTarget: EventTarget | null;
  inputElement: HTMLInputElement | undefined;
  items: Array<ContextMenuItem>;
}

export interface MainDashBoardInterface {
  tabItems: TabItems;
  panelMenuItems: PanelMenuItems;
  currentTab: string;
  currentMenuPanelItem: string;
  activeIndex: number;
  lazy: boolean;
  editors: Editors;
  currentEditor: string;
  editor: Quill | undefined;
  activeMenuElement: ItemInterface | undefined;
}
