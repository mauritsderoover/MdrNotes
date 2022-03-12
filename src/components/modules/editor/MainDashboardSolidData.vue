<template>
  <div>
    <editor-notes
      v-if="activeMenuElement"
      v-model="activeMenuElement.editorContent"
    >
      <template #tabs>
        <draggable-tab-menu
          v-model:activeIndex="activeIndex"
          :model="tabItems"
          :new-tab="newTab"
          @tab-change="updateCurrentTab"
          @add-tab="addTab"
          @label-changed="labelChange"
          @drag-ended="saveAllPositions"
          @delete-item="deleteSection"
        />
      </template>
      <template #panelMenu>
        <draggable-panel-menu
          :model="panelMenuItems[currentTab]"
          :section-identifier="currentTab"
          layer="mainItem"
          @tab-change="updateMenuItem"
          @add-menu-element="addMenuElement"
          @label-changed="labelChange"
          @drag-ended="saveAllPositions"
          @delete-item="deletePageNote"
        />
      </template>
    </editor-notes>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { Editor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Highlight from "@tiptap/extension-highlight";
import CharacterCount from "@tiptap/extension-character-count";
import TextAlign from "@tiptap/extension-text-align";
import MenuBar from "../../modules/editor/actioncomponents/EditorComponents/MenuBar.vue";
import Button from "primevue/button";
import {
  containerExists,
  deleteContainerContents,
} from "@/components/genericcomponents/utils/utils";
import DraggableTabMenu from "../../modules/editor/actioncomponents/MenuComponents/DraggableTabMenu.vue";
import DraggablePanelMenu from "../../modules/editor/actioncomponents/MenuComponents/DraggablePanelMenu.vue";
import {
  MainDashBoardInterface,
  Section,
} from "@/components/modules/editor/editor-interfaces";
import { PageItem, TabItem } from "@/components/modules/editor/editor-classes";
import DataSynchronizer from "@/components/modules/editor/data-synchronizer";
import DataLoader from "@/components/modules/editor/data-loader";
import { logout } from "@inrupt/solid-client-authn-browser";

export default defineComponent({
  name: "MainDashboard",
  components: {
    DraggablePanelMenu,
    MenuBar,
    EditorContent,
    DraggableTabMenu,
    Button,
  },
  data(): MainDashBoardInterface {
    return {
      newTab: false,
      tabItems: [],
      panelMenuItems: {},
      currentTab: "",
      currentMenuPanelItem: "",
      activeIndex: 0,
      lazy: false,
      editors: {},
      currentEditor: "",
      editor: undefined,
      activeMenuElement: undefined,
      notebook: undefined,
      synchronizer: new DataSynchronizer(),
      dataLoader: undefined,
    };
  },
  beforeMount() {
    console.log("this should be HOST", process.env.HOST);
    console.log("this is process.env", process.env);
    this.dataLoader = new DataLoader(this.panelMenuItems, this.tabItems);
    // this.tabItems = this.dataLoader.tabItems;
    this.dataLoader.initialDataLoadedChecker().then(() => {
      console.log("this is currentTab", this.tabItems);
      this.currentTab = this.tabItems[0].key;
      this.activeMenuElement = this.panelMenuItems[this.currentTab][0];
      this.currentMenuPanelItem = this.activeMenuElement.key;
      if (this.editor) {
        this.editor.commands.setContent(this.activeMenuElement.editor);
      }
    });
  },
  beforeUnmount() {
    if (this.editor) this.editor.destroy();
  },
  mounted() {
    this.editor = new Editor({
      injectCSS: false,
      autofocus: true,
      extensions: [
        StarterKit.configure({
          history: false,
        }),
        Highlight,
        TaskList,
        TaskItem,
        CharacterCount.configure({
          limit: 10000,
        }),
        TextAlign.configure({ types: ["heading", "paragraph"] }),
      ],
    });
    if (this.editor) {
      this.editor.commands.setContent(
        this.activeMenuElement ? this.activeMenuElement.editor : ""
      );
      this.editor.on("update", () => {
        if (this.editor) {
          if (this.activeMenuElement)
            this.activeMenuElement.editor = this.editor.getHTML();
          // savePageContent(this.currentMenuPanelItem, this.editor.getHTML())
          this.synchronizer.addContentChange(
            this.currentMenuPanelItem,
            this.editor.getHTML()
          );
        }
      });
    }
  },
  methods: {
    saveAllPositions(): void {
      if (this.dataLoader) this.dataLoader.saveAllPositions();
    },
    cleanNotesContainer(): void {
      deleteContainerContents(
        "https://mauritsderoover.solidcommunity.net/notes/"
      );
      // if (this.dataLoader) this.dataLoader.cleanNotesContainer();
    },
    deletePageNote(item: PageItem) {
      console.log("this has been reached with pageItem", item);
      if (this.dataLoader)
        this.dataLoader.deleteNotePage(this.currentTab, item);
    },
    deleteSection(item: Section) {
      console.log("this has been reached in delete Section", item);
      let index = this.tabItems.findIndex((value) => value.key === item.key);
      if (this.dataLoader) this.dataLoader.deleteSection(item);
      if (index > this.tabItems.length - 1) index--;
      this.currentTab = this.tabItems[index].key;
      this.activeMenuElement = this.panelMenuItems[this.currentTab][0];
      this.currentMenuPanelItem = this.activeMenuElement.key;
      if (this.editor) {
        this.editor.commands.setContent(this.activeMenuElement.editor);
      }
    },
    labelChange(event: { activeIndex: number; doubleClickedItem: TabItem }) {
      this.synchronizer.saveTitle(
        event.doubleClickedItem.key,
        event.doubleClickedItem.label
      );
    },
    // Keep track of active tabs and menu items
    updateCurrentTab(event: { index: number }) {
      this.activeIndex = event.index;
      this.currentTab = this.tabItems[this.activeIndex].key;
      this.currentMenuPanelItem = this.panelMenuItems[this.currentTab][0].key;
      this.activeMenuElement = this.panelMenuItems[this.currentTab][0];
      // this.currentEditor = this.panelMenuItems[this.currentTab][0].key;
      if (this.editor)
        this.editor.commands.setContent(
          this.panelMenuItems[this.currentTab][0].editor
        );
    },
    addTab() {
      if (this.dataLoader && this.editor) {
        this.newTab = true;
        this.currentTab = this.dataLoader.newSection();
        this.activeMenuElement = this.panelMenuItems[this.currentTab][0];
        this.currentMenuPanelItem = this.activeMenuElement.key;
        this.editor.commands.setContent(this.activeMenuElement.editor);
        this.newTab = false;
      }
    },
    addMenuElement(): void {
      if (this.dataLoader) this.dataLoader.newPage(this.currentTab);
      this.activeMenuElement = this.panelMenuItems[this.currentTab].at(-1);
      if (this.activeMenuElement && this.editor) {
        this.currentMenuPanelItem = this.activeMenuElement.key;
        this.editor.commands.setContent(this.activeMenuElement.editor);
      }
    },
    logUserOut(): void {
      logout().then(() => {
        console.log("this has been called");
        this.$router.push("/");
      });
    },
    createTabUrl(name: string): URL {
      return new URL(`${this.$store.getters.getOrigin}/notes/${name}`);
    },
    updateMenuItem(event: { item: PageItem }) {
      this.activeMenuElement = event.item;
      this.currentMenuPanelItem = event.item.key;
      // this.currentEditor = this.activeMenuElement.key;
      if (this.editor) {
        this.editor.commands.setContent(this.activeMenuElement.editor);
        // this.editor.update();
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

  /* Some information about the status */
  &__status {
    display: flex;
    align-items: center;
    border-radius: 5px;

    &::before {
      content: " ";
      flex: 0 0 auto;
      display: inline-block;
      width: 0.5rem;
      height: 0.5rem;
      background: rgba(#0d0d0d, 0.5);
      border-radius: 50%;
      margin-right: 0.5rem;
    }

    &--connecting::before {
      background: #616161;
    }

    &--connected::before {
      background: #b9f18d;
    }
  }

  &__name {
    button {
      background: none;
      border: none;
      font: inherit;
      font-size: 12px;
      font-weight: 600;
      color: #0d0d0d;
      border-radius: 0.4rem;
      padding: 0.25rem 0.5rem;

      &:hover {
        color: #fff;
        background-color: #0d0d0d;
      }
    }
  }
}
</style>

<style lang="scss">
.ProseMirror {
  min-height: 400px;
}

/* Basic editor styles */
.ProseMirror {
  > * + * {
    margin-top: 0.75em;
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
    margin: 1rem 0;
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

    li {
      display: flex;
      align-items: center;

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
