import {
  BaseItem,
  PanelMenuItem,
} from "@/components/modules/editor/editor-interfaces";
import { Editor } from "@tiptap/vue-3";

export interface PageItemParameters {
  editorContent: Array<PageContent>;
  label: string;
  url: string;
  key?: string;
}

interface TabItemParameters {
  label: string;
  url: string;
  key?: string;
}

export class PageContent {
  identifier: string;
  left: string;
  top: string;
  content: string;
  contentEditor: Editor | null;

  constructor(
    input: Omit<PageContent, "contentEditor" | "identifier"> & {
      identifier?: string;
    }
  ) {
    this.identifier = input.identifier ?? "identifier";
    this.left = input.left;
    this.top = input.top;
    this.content = input.content;
    this.contentEditor = null;
  }
}

/**
 * Pag
 */
export class PageItem implements PanelMenuItem {
  key: string;
  uri: URL;
  editorContent: Array<PageContent>;
  label: string;
  items: Array<PageItem>;
  icon?: string;
  constructor(input: PageItemParameters) {
    this.key = input.key ? input.key : input.url;
    this.editorContent = input.editorContent || [];
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
