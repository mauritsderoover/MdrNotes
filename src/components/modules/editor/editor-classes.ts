import {
  BaseItem,
  PanelMenuItem,
} from "@/components/modules/editor/editor-interfaces";

export interface PageItemParameters {
  editorContent: string;
  label: string;
  url: string;
  key?: string;
}

interface TabItemParameters {
  label: string;
  url: string;
  key?: string;
}

/**
 * Pag
 */
export class PageItem implements PanelMenuItem {
  key: string;
  uri: URL;
  editorContent: string;
  label: string;
  items: Array<PageItem>;
  icon?: string;
  constructor(input: PageItemParameters) {
    this.key = input.key ? input.key : input.url;
    this.editorContent = input.editorContent;
    this.uri = new URL(input.url);
    this.label = input.label;
    this.icon = "pi pi-fw pi-file";
    this.items = [];
  }
}

export class TabItem implements BaseItem {
  key: string;
  uri: URL;
  label: string;
  items: Array<BaseItem>;
  icon?: string;
  constructor(input: TabItemParameters) {
    this.key = input.key ? input.key : input.url;
    this.uri = new URL(input.url);
    this.label = input.label;
    this.icon = "pi pi-fw pi-file";
    this.items = [];
  }
}
