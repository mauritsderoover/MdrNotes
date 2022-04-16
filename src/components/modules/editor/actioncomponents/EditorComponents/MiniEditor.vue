<template>
  <editor-content
    v-if="editor"
    id="editor-wrapper"
    :ref="containerRef"
    :editor="editor"
    class="editor-wrapper"
    @mousedown="initDrag"
    @click="testFunction"
  />
</template>

<script lang="ts">
import { defineComponent } from "vue";

import { EditorContent } from "@tiptap/vue-3";
import { DomHandler } from "primevue/utils";
import { MiniEditorInterface } from "@/components/modules/editor/actioncomponents/EditorComponents/MiniEditorInterface";
import { PageContent } from "@/components/modules/editor/editor-classes";
import createEditor from "@/components/modules/editor/actioncomponents/EditorComponents/EditorClass";

export default defineComponent({
  name: "MiniEditor",
  components: {
    EditorContent,
  },
  props: {
    modelValue: {
      type: String,
      default: "",
    },
    testEditor: {
      type: Object,
      default: null,
    },
    left: {
      type: String,
    },
    top: {
      type: String,
    },
  },
  emits: [
    "update:modelValue",
    "update:testEditor",
    "setCurrentEditor",
    "update:left",
    "update:top",
  ],
  data(): MiniEditorInterface {
    return {
      editor: createEditor(),
      editorFocused: false,
      documentKeydownListener: null,
      container: null,
      parentContainer: null,
      dragging: null,
      documentDragListener: null,
      documentDragEndListener: null,
      lastPageX: null,
      lastPageY: null,
      keepInViewport: true,
      minX: 0,
      minY: 0,
    };
  },
  watch: {
    modelValue(value) {
      const isSame = this.editor.getHTML() === value;

      if (isSame) {
        return;
      }

      this.editor.commands.setContent(value, false);
    },
  },
  mounted() {
    this.editor.on("update", () => {
      this.$emit("update:modelValue", this.editor.getHTML());
    });
    this.bindDocumentDragListener();
    this.bindDocumentDragEndListener();
    this.$emit("update:testEditor", this.editor);
  },
  beforeUnmount() {
    this.editor.destroy();
  },
  methods: {
    initDrag(event: MouseEvent): void {
      if ((event.target as HTMLElement).id === "editor-wrapper") {
        this.dragging = true;
        this.lastPageX = event.pageX;
        this.lastPageY = event.pageY;
      }
    },
    testFunction(test: any): void {
      this.$emit("setCurrentEditor", this.testEditor);
      console.log("this is test after click", test);
    },
    containerRef(el: any) {
      if (el) this.container = el.rootEl;
    },
    bindDocumentDragListener() {
      this.documentDragListener = (event: MouseEvent) => {
        if (
          this.dragging &&
          this.container &&
          this.lastPageX &&
          this.lastPageY
        ) {
          let width = DomHandler.getOuterWidth(this.container, false);
          let height = DomHandler.getOuterHeight(this.container, false);
          let deltaX = event.pageX - this.lastPageX;
          let deltaY = event.pageY - this.lastPageY;
          let leftPos = parseInt(this.container.style.left) + deltaX;
          let topPos = parseInt(this.container.style.top) + deltaY;
          let viewport = DomHandler.getViewport();

          if (this.keepInViewport) {
            if (leftPos >= this.minX && leftPos + width < viewport.width) {
              this.lastPageX = event.pageX;
              this.$emit("update:left", leftPos + "px");
            }
            if (topPos >= this.minY && topPos + height < viewport.height) {
              this.lastPageY = event.pageY;
              this.$emit("update:top", topPos + "px");
            }
          } else {
            this.lastPageX = event.clientX;
            this.lastPageY = event.clientY;
            this.$emit("update:left", leftPos + "px");
            this.$emit("update:top", topPos + "px");
          }
        }
      };
      window.document.addEventListener("mousemove", this.documentDragListener);
    },
    unbindDocumentDragListener() {
      if (this.documentDragListener) {
        window.document.removeEventListener(
          "mousemove",
          this.documentDragListener
        );
        this.documentDragListener = null;
      }
    },
    bindDocumentDragEndListener() {
      this.documentDragEndListener = () => {
        if (this.dragging) {
          this.dragging = false;
          // DomHandler.removeClass(document.body, "p-unselectable-text");

          // this.$emit("dragend", event);
        }
      };
      window.document.addEventListener("mouseup", this.documentDragEndListener);
    },
    unbindDocumentDragEndListener() {
      if (this.documentDragEndListener) {
        window.document.removeEventListener(
          "mouseup",
          this.documentDragEndListener
        );
        this.documentDragEndListener = null;
      }
    },
  },
});
</script>

<style lang="scss">
.editor-wrapper {
  border: 10px solid;
}
.editor {
  display: flex;
  flex-direction: column;
  min-height: 5rem;
  max-height: 26rem;
  color: #0d0d0d;
  background-color: #fff;
  border: 3px solid #0d0d0d;
  border-radius: 0.75rem;

  &__header {
    display: flex;
    align-items: center;
    flex: 0 0 auto;
    flex-wrap: wrap;
    padding: 0.25rem;
    border-bottom: 3px solid #0d0d0d;
  }

  &__content {
    padding: 1.25rem 1rem;
    flex: 1 1 auto;
    overflow-x: hidden;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  &__footer {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    white-space: nowrap;
    border-top: 3px solid #0d0d0d;
    font-size: 12px;
    font-weight: 600;
    color: #0d0d0d;
    white-space: nowrap;
    padding: 0.25rem 0.75rem;
  }
}
</style>

<style lang="scss">
#editor {
  display: flex;
  flex-flow: column;
  height: 100%;
  overflow-y: hidden;

  div.row-shrink {
    flex-grow: 0;
  }

  div.row-expand {
    flex-grow: 1;
  }

  div.editor-container {
    border: 3px solid #276cb2;
  }

  div.editor-tabs .p-tabmenu .p-tabmenu-nav {
    background: #e9efef;
    //overflow-x: visible;
    padding-bottom: 0.2rem;
    border: none;

    span.p-menuitem-text {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .p-tabmenuitem.p-menuitem-link {
      background: none;
    }
  }

  .editor_header {
    background: #cdd9d9;
    .p-tabmenu .p-tabmenu-nav {
      background: #cdd9d9;
      border: none;

      .p-menuitem-link {
        background: none;
      }
    }
  }

  .panel-menu {
    background: #e9efef;
  }

  .panel-menu .p-panelmenu .p-panelmenu-header > a {
    background: #e9efef;
  }
}

.ProseMirror {
  min-height: 120px;
  min-width: 200px;
}

/* Basic editor styles */
.ProseMirror {
  padding: 0.5rem;
  > * + * {
    margin-top: 0.75em;
  }

  p {
    margin: 0;
  }

  ul,
  ol {
    padding: 0 1rem;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    line-height: 1.1;
  }

  code {
    background-color: rgba(#616161, 0.1);
    color: #616161;
  }

  pre {
    background: #0d0d0d;
    color: #fff;
    font-family: "JetBrainsMono", monospace;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;

    code {
      color: inherit;
      padding: 0;
      background: none;
      font-size: 0.8rem;
    }
  }

  mark {
    background-color: #faf594;
  }

  img {
    max-width: 100%;
    height: auto;
  }

  hr {
    margin: 0;
  }

  blockquote {
    padding-left: 1rem;
    border-left: 2px solid rgba(#0d0d0d, 0.1);
  }

  hr {
    border: none;
    border-top: 2px solid rgba(#0d0d0d, 0.1);
    margin: 2rem 0;
  }

  ul[data-type="taskList"] {
    list-style: none;
    padding: 0;

    p {
      margin: 0;
    }

    li {
      display: flex;
      align-items: start;

      > label {
        flex: 0 0 auto;
        margin-right: 0.5rem;
        user-select: none;
      }

      > div {
        flex: 1 1 auto;
      }
    }
  }
}
</style>
