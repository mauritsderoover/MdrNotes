import { Editor } from "@tiptap/vue-3";
import { PageContent } from "@/components/modules/editor/editor-classes";
import DataSynchronizer from "@/components/modules/editor/data-synchronizer";
import DataLoader from "@/components/modules/editor/data-loader";
import { Page } from "@/components/modules/editor/classes/page";
import { Section } from "@/components/modules/editor/classes/section";

export interface ContextMenuItem {
  label: string;
  icon: string;

  command?(event: any): void;
}

/**
 * @alias: A PanelMenuItem is an alias for a page and a page-group
 */
export interface PanelMenuItem extends Section {
  /**
   * EditorContent is a string containing HTML Tags and content
   */
  editorContent: Array<PageContent>;
  items?: Array<PanelMenuItem>;
}

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
  [index: string]: Array<Page>;
}

export interface Editors {
  [index: string]: Record<never, never>;
}

export interface DraggableTabMenu {
  d_activeIndex: number | undefined;
  doubleClickActiveIndex: number | undefined;
  activeItem: Section | undefined;
  drag: boolean;
  delay: number;
  clicks: number;
  timer: ReturnType<typeof setTimeout> | undefined;
  changeLabel: boolean;
  currentTarget: EventTarget | null;
  inputItem: HTMLInputElement | undefined;
  doubleClickedItem: Section | undefined;
  rightClickedItem: undefined | Section;
  items: Array<ContextMenuItem>;
}

export interface DraggablePanelMenu {
  oldSection?: string;
  activeItem: Page | undefined;
  doubleClickedItem: Page | undefined;
  doubleClickActiveIndex: number | undefined;
  rightClickedItem: Page | undefined;
  rightClickedIndex: number | undefined;
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
  newTab: boolean;
  tabItems: Array<Section>;
  panelMenuItems: PanelMenuItems;
  currentTab?: Section;
  currentMenuPanelItem?: Page;
  activeIndex: number;
  lazy: boolean;
  editors: Editors;
  currentEditor: string;
  editor: undefined | Editor;
  activeMenuElement: Page | undefined;
  notebook: string;
  synchronizer: DataSynchronizer;
  dataLoader: DataLoader;
  dataLoaded: boolean;
}
