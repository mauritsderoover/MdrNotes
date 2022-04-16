<template>
  <div>
    <div class="grid mt-2 ml-0">
      <template v-for="(item, index) in items" :key="index">
        <divider-bar v-if="item.type === 'divider'" />
        <menu-item v-else-if="item.type === 'symbol'" v-bind="item" />
        <color-menu-item
          v-else-if="item.type === 'symbol-color'"
          v-bind="item"
        />
        <menu-drop-down v-else-if="item.type === 'dropdown'" v-bind="item" />
        <input v-else-if="item.type === 'color'" type="color" />
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
// import MenuItemProposal from "@/components/modules/editor/actioncomponents/EditorComponents/MenuItemProposal.vue";
import { Editor } from "@tiptap/vue-3";
import DividerBar from "@/components/modules/editor/actioncomponents/EditorComponents/toolbars/Divider.vue";
import MenuItem from "@/components/modules/editor/actioncomponents/EditorComponents/toolbars/MenuItem.vue";
import MenuDropDown from "@/components/modules/editor/actioncomponents/EditorComponents/toolbars/MenuDropDown.vue";
import FontFamilies from "@/components/modules/editor/actioncomponents/EditorComponents/toolbars/font-families";
import ColorMenuItem from "@/components/modules/editor/actioncomponents/EditorComponents/toolbars/coloritems/ColorMenuItem.vue";
// import Button from "primevue/button";

interface TrialMenuItem {
  icon: string;
  title: string;
  action(): void;
  isActive(): void;
}

export default defineComponent({
  name: "StartBar",
  components: {
    ColorMenuItem,
    MenuDropDown,
    MenuItem,
    DividerBar,
  },
  props: {
    editor: {
      type: Editor,
      required: true,
    },
  },
  data() {
    return {
      items: [
        {
          icon: "arrow-go-back-line",
          title: "Undo",
          type: "symbol",
          action: () => this.editor.chain().focus().undo().run(),
        },
        {
          icon: "arrow-go-forward-line",
          title: "Redo",
          type: "symbol",
          action: () => this.editor.chain().focus().redo().run(),
        },
        {
          type: "divider",
        },
        {
          type: "dropdown",
          modelValue: "",
          options: FontFamilies,
          action: (fontFamily: string) => {
            this.editor.chain().focus().setFontFamily(fontFamily).run();
          },
        },
        {
          icon: "bold",
          title: "Bold",
          type: "symbol",
          action: () => this.editor.chain().focus().toggleBold().run(),
          isActive: () => this.editor.isActive("bold"),
        },
        {
          icon: "italic",
          title: "Italic",
          type: "symbol",
          action: () => this.editor.chain().focus().toggleItalic().run(),
          isActive: () => this.editor.isActive("italic"),
        },
        {
          icon: "underline",
          title: "Underline",
          type: "symbol",
          action: () => this.editor.chain().focus().toggleUnderline().run(),
          isActive: () => this.editor.isActive("underline"),
        },
        {
          icon: "mark-pen-line",
          title: "Highlight",
          type: "symbol-color",
          action: (color: string) =>
            this.editor.chain().focus().toggleHighlight({ color: color }).run(),
          isActive: () => this.editor.isActive("highlight"),
        },
        {
          icon: "font-color",
          title: "Font-color",
          type: "symbol-color",
          action: (color: string) =>
            this.editor.chain().focus().setColor(color).run(),
        },
        {
          icon: "strikethrough",
          title: "Strike",
          type: "symbol",
          action: () => this.editor.chain().focus().toggleStrike().run(),
          isActive: () => this.editor.isActive("strike"),
        },
        {
          icon: "subscript",
          title: "Subscript",
          type: "symbol",
          action: () => this.editor.chain().focus().toggleSubscript().run(),
          isActive: () => this.editor.isActive("subscript"),
        },
        {
          icon: "superscript",
          title: "Superscript",
          type: "symbol",
          action: () => this.editor.chain().focus().toggleSuperscript().run(),
          isActive: () => this.editor.isActive("superscript"),
        },
        {
          type: "divider",
        },
        {
          icon: "align-left",
          title: "Align left",
          type: "symbol",
          action: () => this.editor.chain().focus().setTextAlign("left").run(),
          isActive: () => this.editor.isActive({ textAlign: "left" }),
        },
        {
          icon: "align-center",
          title: "Align center",
          type: "symbol",
          action: () =>
            this.editor.chain().focus().setTextAlign("center").run(),
          isActive: () => this.editor.isActive({ textAlign: "center" }),
        },
        {
          icon: "align-right",
          title: "Align right",
          type: "symbol",
          action: () => this.editor.chain().focus().setTextAlign("right").run(),
          isActive: () => this.editor.isActive({ textAlign: "right" }),
        },
        {
          icon: "align-justify",
          title: "Align justify",
          type: "symbol",
          action: () =>
            this.editor.chain().focus().setTextAlign("justify").run(),
          isActive: () => this.editor.isActive({ textAlign: "justify" }),
        },
        {
          type: "divider",
        },
        {
          icon: "list-unordered",
          title: "Bullet List",
          type: "symbol",
          action: () => this.editor.chain().focus().toggleBulletList().run(),
          isActive: () => this.editor.isActive("bulletList"),
        },
        {
          icon: "list-ordered",
          title: "Ordered List",
          type: "symbol",
          action: () => this.editor.chain().focus().toggleOrderedList().run(),
          isActive: () => this.editor.isActive("orderedList"),
        },
        {
          icon: "list-check-2",
          title: "Task List",
          type: "symbol",
          action: () => this.editor.chain().focus().toggleTaskList().run(),
          isActive: () => this.editor.isActive("taskList"),
        },
        {
          type: "divider",
        },
        {
          type: "dropdown",
          modelValue: "",
          options: [
            { value: 1, label: "Heading 1" },
            { value: 2, label: "Heading 2" },
            { value: 3, label: "Heading 3" },
            { value: 4, label: "Heading 4" },
            { value: 5, label: "Heading 5" },
            { value: 6, label: "Heading 6" },
          ],
          action: (inputValue: 1 | 2 | 3 | 4 | 5 | 6) => {
            this.editor
              .chain()
              .focus()
              .toggleHeading({ level: inputValue })
              .run();
          },
        },
      ],
    };
  },
});
</script>

<style></style>
