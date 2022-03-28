<template>
  <div class="grid nested-grid p-0" id="editor">
    <div class="col-12 p-0 row-shrink">
      <menu-bar-proposal v-if="editor" class="editor_header" :editor="editor" />
    </div>
    <div class="col-12 p-0 row-shrink editor-tabs">
      <slot name="tabs"> </slot>
    </div>
    <div class="col-12 grid p-0 m-0 row-expand">
      <!--      <div class="grid" style="height: 100%">-->
      <div class="col-2 panel-menu">
        <slot name="panelMenu"></slot>
      </div>
      <div class="col-10 editor-container">
        <editor-content v-if="editor" :editor="editor" />
      </div>
    </div>
    <!--    </div>-->
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

/**
 * background-color: #f6fbf6; => nice background color for the toolbars
 */

import StarterKit from "@tiptap/starter-kit";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import Highlight from "@tiptap/extension-highlight";
import CharacterCount from "@tiptap/extension-character-count";
import TextAlign from "@tiptap/extension-text-align";
import FontFamily from "@tiptap/extension-font-family";
import { Color } from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import BulletList from "@tiptap/extension-bullet-list";
import ListItem from "@tiptap/extension-list-item";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import OrderedList from "@tiptap/extension-ordered-list";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Heading from "@tiptap/extension-heading";
// import MenuBar from "@/components/modules/editor/actioncomponents/EditorComponents/MenuBar.vue";
import { Editor, EditorContent } from "@tiptap/vue-3";
import MenuBarProposal from "@/components/modules/editor/actioncomponents/EditorComponents/MenuBar.vue";
export default defineComponent({
  name: "EditorNotes",
  components: {
    MenuBarProposal,
    EditorContent,
    // MenuBar,
  },
  props: {
    modelValue: {
      type: String,
      default: "",
    },
  },
  emits: ["update:modelValue"],
  data() {
    return {
      editor: new Editor({
        injectCSS: false,
        autofocus: true,
        extensions: [
          Document,
          Paragraph,
          Heading,
          Text,
          TaskList,
          TaskItem.configure({
            nested: true,
          }),
          Bold,
          Italic,
          BulletList,
          OrderedList,
          ListItem,
          Highlight.configure({ multicolor: true }),
          TextStyle,
          Underline,
          Subscript,
          Superscript,
          CharacterCount.configure({
            limit: 10000,
          }),
          FontFamily,
          Color,
          TextAlign.configure({ types: ["heading", "paragraph"] }),
        ],
      }),
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
  },
  beforeUnmount() {
    this.editor.destroy();
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
  }

  div.row-expand {
    flex-grow: 1;
  }

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

.ProseMirror {
  min-height: 400px;
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
