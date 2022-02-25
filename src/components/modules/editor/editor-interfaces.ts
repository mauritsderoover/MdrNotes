import { Editor } from "@tiptap/vue-3";
import { PageItem } from "@/components/modules/editor/editor-classes";
import DataSynchronizer from "@/components/modules/editor/data-synchronizer";
import DataLoader from "@/components/modules/editor/data-loader";

export interface ContextMenuItem {
  label: string;
  icon: string;
}

export interface BaseItem {
  label: string; // the label that will appear in the menu or tab button
  // the key is probably not necessary
  key: string; // the key which basically equals the container url
  uri: URL; // the url of the resource
  icon?: string;
  class?: string;
  command?: (arg0: any) => void;
  to?: string;
}

export type Section = BaseItem;

/**
 * @alias: A PanelMenuItem is an alias for a page and a page-group
 */
export interface PanelMenuItem extends BaseItem {
  editor: string;
  items: Array<PanelMenuItem>;
}

/**
 *  TabItems is an array of sections and section groups.
 *
 *  In the future this interface would need to support section groups.
 */
export type TabItems = Array<Section>;

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
  [index: string]: Array<PageItem>;
}

export interface Editors {
  [index: string]: Record<never, never>;
}

export interface DraggableTabMenu {
  d_activeIndex: number | undefined;
  doubleClickActiveIndex: number | undefined;
  activeItem: BaseItem | undefined;
  drag: boolean;
  delay: number;
  clicks: number;
  timer: ReturnType<typeof setTimeout> | undefined;
  changeLabel: boolean;
  currentTarget: EventTarget | null;
  inputItem: HTMLInputElement | undefined;
  doubleClickedItem: BaseItem | undefined;
}

export interface DraggablePanelMenu {
  oldSection?: string;
  activeItem: BaseItem | undefined;
  doubleClickedItem: BaseItem | undefined;
  doubleClickActiveIndex: number | undefined;
  rightClickedItem: BaseItem | undefined;
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
  initial_tabs: boolean;
  tabItems: TabItems;
  panelMenuItems: PanelMenuItems;
  currentTab: string;
  currentMenuPanelItem: string;
  activeIndex: number;
  lazy: boolean;
  editors: Editors;
  currentEditor: string;
  editor: undefined | Editor;
  activeMenuElement: PageItem | undefined;
  notebook: string | undefined;
  synchronizer: DataSynchronizer;
  dataLoader: DataLoader | undefined;
}