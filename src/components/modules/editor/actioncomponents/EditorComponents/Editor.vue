<template>
  <div id="editor" class="grid nested-grid p-0">
    <div class="col-12 p-0 row-shrink">
      <menu-bar-proposal
        v-if="editor"
        class="m-1 editor_header"
        :editor="editor"
      />
    </div>
    <div class="col-12 p-0 row-shrink editor-tabs">
      <slot name="tabs"></slot>
    </div>
    <div class="col-12 grid p-0 m-0 row-expand">
      <div class="col-2 panel-menu">
        <slot name="panelMenu"></slot>
      </div>
      <div
        id="editor-container"
        class="col-10 editor-container"
        style="position: relative"
        @click="createNewEditor"
      >
        <mini-editor
          v-for="editorObj of page.notes"
          :key="editorObj"
          :page-content="editorObj"
          style="position: absolute"
          :style="{ left: `${editorObj.left}px`, top: `${editorObj.top}px` }"
          @set-current-editor="editor = $event"
          @remove-editor="removeEditor(editorObj)"
          @content-updated="$emit('contentUpdated', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import MenuBarProposal from "@/components/modules/editor/actioncomponents/EditorComponents/toolbars/MenuBar.vue";
import MiniEditor from "@/components/modules/editor/actioncomponents/EditorComponents/MiniEditor.vue";
import { Editor } from "@tiptap/vue-3";
import createEditor from "@/components/modules/editor/actioncomponents/EditorComponents/EditorClass";
import { Note } from "@/components/modules/editor/classes/note";
import { Page } from "@/components/modules/editor/classes/page";

export default defineComponent({
  name: "EditorNotes",
  components: {
    MenuBarProposal,
    // EditorContent,
    MiniEditor,
    // MenuBar,
  },
  props: {
    page: {
      type: Object as PropType<Page>,
      required: true,
    },
  },
  emits: ["update:editors", "contentUpdated"],
  data(): {
    editor: Editor | null;
  } {
    return {
      editor: null,
    };
  },
  mounted() {
    if (this.editor === null) this.editor = createEditor();
  },
  methods: {
    removeEditor(note: Note): void {
      this.page.removeNote(note);
    },
    createNewEditor(event: PointerEvent) {
      const id = (event.composedPath().at(0) as HTMLElement).id;
      const selection = window.getSelection();
      if (
        id &&
        id === "editor-container" &&
        (!selection || selection.type !== "Range")
      ) {
        this.page.createNote(event.offsetX, event.offsetY, "");
      }
    },
  },
});
</script>

<style lang="scss">
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
    background: #cdd9d9;
  }

  div.row-expand {
    flex-grow: 1;
  }

  //div.editor {
  //  background: #cdd9d9;
  //}

  div.editor-container {
    border: 2px solid #276cb2;
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
