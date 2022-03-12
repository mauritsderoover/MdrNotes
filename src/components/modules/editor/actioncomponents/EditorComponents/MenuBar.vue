<template>
  <div class="grid">
    <div class="col flex justify-content-start">
      <template v-for="(item, index) in items">
        <div
          class="divider"
          v-if="item.type === 'divider'"
          :key="`divider${index}`"
        />
        <menu-item v-else :key="index" v-bind="item" />
      </template>
    </div>
    <div class="col flex justify-content-end">
      <button
        type="button"
        class="menu-item"
        title="Settings"
        aria-haspopup="true"
        aria-controls="overlay_menu"
        @click="toggleSettingsMenu"
      >
        <svg class="remix">
          <use :xlink:href="`${remixiconUrl}#ri-settings-4-line`" />
        </svg>
      </button>
    </div>

    <Menu id="overlay_menu" ref="menu" :model="settings" :popup="true" />
  </div>
</template>

<script lang="js">
import MenuItem from "./MenuItem.vue";
import remixiconUrl from "remixicon/fonts/remixicon.symbol.svg";
import Menu from "primevue/menu";
import { Editor } from "@tiptap/vue-3";

export default {
  components: {
    MenuItem,
    Menu,
  },

  props: {
    editor: {
      type: Editor,
      required: true,
    },
  },

  data() {
    return {
      remixiconUrl,
      items: [
        {
          icon: "bold",
          title: "Bold",
          action: () => this.editor.chain().focus().toggleBold().run(),
          isActive: () => this.editor.isActive("bold"),
        },
        {
          icon: "italic",
          title: "Italic",
          action: () => this.editor.chain().focus().toggleItalic().run(),
          isActive: () => this.editor.isActive("italic"),
        },
        {
          icon: "align-left",
          title: "Align left",
          action: () => this.editor.chain().focus().setTextAlign("left").run(),
          isActive: () => this.editor.isActive({ textAlign: "left" }),
        },
        {
          icon: "align-center",
          title: "Align center",
          action: () =>
            this.editor.chain().focus().setTextAlign("center").run(),
          isActive: () => this.editor.isActive({ textAlign: "center" }),
        },
        {
          icon: "align-right",
          title: "Align right",
          action: () => this.editor.chain().focus().setTextAlign("right").run(),
          isActive: () => this.editor.isActive({ textAlign: "right" }),
        },
        {
          icon: "align-justify",
          title: "Align justify",
          action: () =>
            this.editor.chain().focus().setTextAlign("justify").run(),
          isActive: () => this.editor.isActive({ textAlign: "justify" }),
        },

        {
          icon: "strikethrough",
          title: "Strike",
          action: () => this.editor.chain().focus().toggleStrike().run(),
          isActive: () => this.editor.isActive("strike"),
        },
        {
          icon: "code-view",
          title: "Code",
          action: () => this.editor.chain().focus().toggleCode().run(),
          isActive: () => this.editor.isActive("code"),
        },
        {
          icon: "mark-pen-line",
          title: "Highlight",
          action: () => this.editor.chain().focus().toggleHighlight().run(),
          isActive: () => this.editor.isActive("highlight"),
        },
        {
          type: "divider",
        },
        {
          icon: "h-1",
          title: "Heading 1",
          action: () =>
            this.editor.chain().focus().toggleHeading({ level: 1 }).run(),
          isActive: () => this.editor.isActive("heading", { level: 1 }),
        },
        {
          icon: "h-2",
          title: "Heading 2",
          action: () =>
            this.editor.chain().focus().toggleHeading({ level: 2 }).run(),
          isActive: () => this.editor.isActive("heading", { level: 2 }),
        },
        {
          icon: "paragraph",
          title: "Paragraph",
          action: () => this.editor.chain().focus().setParagraph().run(),
          isActive: () => this.editor.isActive("paragraph"),
        },
        {
          icon: "list-unordered",
          title: "Bullet List",
          action: () => this.editor.chain().focus().toggleBulletList().run(),
          isActive: () => this.editor.isActive("bulletList"),
        },
        {
          icon: "list-ordered",
          title: "Ordered List",
          action: () => this.editor.chain().focus().toggleOrderedList().run(),
          isActive: () => this.editor.isActive("orderedList"),
        },
        {
          icon: "list-check-2",
          title: "Task List",
          action: () => this.editor.chain().focus().toggleTaskList().run(),
          isActive: () => this.editor.isActive("taskList"),
        },
        {
          icon: "code-box-line",
          title: "Code Block",
          action: () => this.editor.chain().focus().toggleCodeBlock().run(),
          isActive: () => this.editor.isActive("codeBlock"),
        },
        {
          type: "divider",
        },
        {
          icon: "double-quotes-l",
          title: "Blockquote",
          action: () => this.editor.chain().focus().toggleBlockquote().run(),
          isActive: () => this.editor.isActive("blockquote"),
        },
        {
          icon: "separator",
          title: "Horizontal Rule",
          action: () => this.editor.chain().focus().setHorizontalRule().run(),
        },
        {
          type: "divider",
        },
        {
          icon: "text-wrap",
          title: "Hard Break",
          action: () => this.editor.chain().focus().setHardBreak().run(),
        },
        {
          icon: "format-clear",
          title: "Clear Format",
          action: () =>
            this.editor.chain().focus().clearNodes().unsetAllMarks().run(),
        },
        {
          type: "divider",
        },
        {
          icon: "arrow-go-back-line",
          title: "Undo",
          action: () => this.editor.chain().focus().undo().run(),
        },
        {
          icon: "arrow-go-forward-line",
          title: "Redo",
          action: () => this.editor.chain().focus().redo().run(),
        },
      ],
      settings: [
        {
          label: "Log out",
          icon: "pi pi-sign-out",
          to: "/logout"
        }
      ]
    };
  },
  methods: {
    toggleSettingsMenu(event) {
      this.$refs.menu.toggle(event);
    }
  }
};
</script>

<style lang="scss">
.divider {
  width: 2px;
  height: 1.25rem;
  background-color: rgba(#000, 0.1);
  margin-left: 0.5rem;
  margin-right: 0.75rem;
}
</style>
