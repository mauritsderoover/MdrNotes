import { Editor } from "@tiptap/vue-3";

export interface MiniEditorInterface {
  editor: Editor;
  editorFocused: boolean;
  documentKeydownListener: null | EventListenerOrEventListenerObject;
  container: null | HTMLDivElement;
  parentContainer: null | HTMLDivElement;
  dragging: null | boolean;
  documentDragListener: null | { (event: MouseEvent): void };
  documentDragEndListener: null | EventListenerOrEventListenerObject;
  lastPageX: null | number;
  lastPageY: null | number;
  keepInViewport: boolean;
  minX: number;
  minY: number;
}
