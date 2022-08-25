import { PanelMenuItem } from "@/components/modules/editor/editor-interfaces";
import { makeId } from "@/components/modules/editor/DataModel";

export class PageContent {
  identifier: string;
  left: number;
  top: number;
  content: string;

  constructor(
    input: Omit<PageContent, "contentEditor" | "identifier"> & {
      identifier?: string;
    }
  ) {
    this.identifier = input.identifier ?? makeId();
    this.left = input.left;
    this.top = input.top;
    this.content = input.content;
  }
}
