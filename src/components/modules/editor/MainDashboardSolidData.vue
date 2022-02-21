<template>
  <div class="grid nested-grid">
    <div class="col-12">
      <Button
        label="Create notebook"
        icon="pi pi-check"
        class="p-button-help"
        @click="createNotebook"
      />
      <Button
        label="saveSomeContent"
        icon="pi pi-check"
        class="p-button-help"
        @click="loadDataTester"
      />
      <Button
        label="Delete root container"
        icon="pi pi-check"
        class="p-button-help"
        @click="deleteRootContainer"
      />
    </div>
    <div class="col-12">
      <menu-bar v-if="editor" class="editor__header" :editor="editor" />
    </div>
    <div class="col-12">
      <DraggableTabMenu
        v-model:activeIndex="activeIndex"
        :model="tabItems"
        :initial_data="initial_tabs"
        @tab-change="updateCurrentTab"
        @add-tab="addTab"
        @label-changed="labelChange"
      />
    </div>
    <div class="col-12">
      <div class="grid">
        <div class="col-2">
          <DraggablePanelMenu
            :model="panelMenuItems[currentTab]"
            :section-identifier="currentTab"
            layer="mainItem"
            @tab-change="updateMenuItem"
            @add-menu-element="addMenuElement"
            @label-changed="labelChange"
          />
        </div>
        <div class="col-10">
          <editor-content v-if="editor" :editor="editor" />
        </div>
      </div>
    </div>
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
import MenuBar from "../../modules/editor/actioncomponents/EditorComponents/MenuBar.vue";
import Button from "primevue/button";
import {
  containerExists,
  // deleteContainerContents,
  // createContainerAtUri,
  deleteContainerContents,
} from "@/components/genericcomponents/utils/utils";
import DraggableTabMenu from "../../modules/editor/actioncomponents/MenuComponents/DraggableTabMenu.vue";
// import Toolbar from "../../modules/editor/actioncomponents/EditorComponents/Toolbar.vue";
import DraggablePanelMenu from "../../modules/editor/actioncomponents/MenuComponents/DraggablePanelMenu.vue";
import {
  buildThing,
  createThing,
  createSolidDataset,
  setThing,
  saveSolidDatasetAt,
} from "@inrupt/solid-client";
import SCHEMA from "../../genericcomponents/vocabs/SCHEMA";
import NOTETAKING from "../../genericcomponents/vocabs/NOTETAKING";
import {
  BaseItem,
  MainDashBoardInterface,
} from "@/components/modules/editor/editor-interfaces";
import { fetch } from "@inrupt/solid-client-authn-browser";
import { DCTERMS, RDF } from "@inrupt/vocab-common-rdf";
import {
  loadData,
  newNoteBook,
  newPage,
  newSection,
  savePageContent,
  saveTitle,
} from "@/components/modules/editor/DataModel";
import { PageItem, TabItem } from "@/components/modules/editor/editor-classes";
import DataSynchronizer from "@/components/modules/editor/data-synchronizer";
// import DataLoader from "@/components/modules/editor/dataloader";

// import { LDP } from "@inrupt/vocab-common-rdf";
export default defineComponent({
  name: "MainDashboard",
  components: {
    DraggablePanelMenu,
    // Toolbar,
    MenuBar,
    EditorContent,
    DraggableTabMenu,
    Button,
  },
  data(): MainDashBoardInterface {
    return {
      initial_tabs: true,
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
      synchronizer: new DataSynchronizer(
        "https://mauritsderoover.solidcommunity.net/notes/"
      ),
    };
  },
  async beforeMount() {
    const URI = `${this.$store.getters.getOrigin}/notes/`;
    // await deleteContainerContents(URI);
    if (await containerExists(URI)) {
      // new DataLoader("https://mauritsderoover.solidcommunity.net/notes/");
      await this.loadData();
    } else {
      await this.createInitialNotes();
    }
  },
  beforeUnmount() {
    if (this.editor) this.editor.destroy();
  },
  mounted() {
    console.log("this is this.$refs.editor", this.$refs.editor);
    console.log("this is the editor", this.editor);
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
    /**
     * Some basic information about the structure
     * Since in the SOLID mindset URLS shouldn't change, all notes will be creates in the main
     * notes container. However, there is still a need to clarify where a specific note belongs to.
     *
     * Therefore, a note will always be both container as NoteDigitalDocument resource.
     * On top of the container predicates. The container will always contain the following predicates
     * rdf.type, SCHEMA.NoteDigitalDocument
     * DCTERMS.title, "Some Random Title" (A string literal)
     * SCHEMA.abstract, "Personal notes" (A string literal)
     * SCHEMA.accountablePerson, WebId
     * SCHEMA.creator, WebId
     * SCHEMA.dateCreated, date
     * SCHEMA.Text, ""
     * (optional) SCHEMA.hasPart, URL  *OrANd* DCTERM.hasPart, URL
     * (optional) SCHEMA.isPartOf, URL *OrAnd* DCTERM.isPartOf, URL
     * (optional) SCHEMA.position, integer => this is required if a note container isPartOf another note container
     * */
    createRootContainer() {
      DCTERMS.hasFormat;
      const uri = "https://mauritsderoover.solidcommunity.net/testerRoot/notes";
      let solidDataSet = createSolidDataset();
      const newThing = buildThing(createThing({ url: uri }))
        .addUrl(RDF.type, SCHEMA.NoteDigitalDocument)
        .addStringNoLocale(DCTERMS.title, "testerRootTitle")
        .build();
      solidDataSet = setThing(solidDataSet, newThing);
      saveSolidDatasetAt(uri, solidDataSet, { fetch });
    },
    loadDataTester() {
      savePageContent(
        "020A5eE5SBMEtY9jicbM7atqUbqF",
        "Tester content antoher content"
      ).then(() => {
        console.log("content should have been saved");
      });
    },
    createNotebook() {
      console.log("this has been called! ");
      newNoteBook("TesterNotebook").then(() => {
        console.log("this seems to have worked");
      });
    },
    async addSomethingToContainer() {
      const uri =
        "https://mauritsderoover.solidcommunity.net/testerRoot/testerYolo";
      // let solidDataset = await getData(uri);

      let newDataSet = createSolidDataset();

      const newThing = buildThing(createThing({ url: uri }))
        .addUrl(RDF.type, NOTETAKING.Note)
        .build();

      newDataSet = setThing(newDataSet, newThing);

      await saveSolidDatasetAt(uri, newDataSet, { fetch });
    },
    deleteRootContainer() {
      const uri = "https://mauritsderoover.solidcommunity.net/notes/";
      deleteContainerContents(uri);
      // TODO
    },
    changeTitle() {
      console.log("this is blabla");
    },
    labelChange(event: { activeIndex: number; doubleClickedItem: TabItem }) {
      saveTitle(event.doubleClickedItem.key, event.doubleClickedItem.label);
    },
    createInitialNotes() {
      newNoteBook("Your First Notebook").then(() => {
        this.loadData();
      });
    },
    async loadData() {
      this.initial_tabs = true;
      [this.notebook, this.tabItems, this.panelMenuItems] = await loadData();
      // for every tab we get the related dataset
      this.currentTab = this.tabItems[0].key;
      this.currentMenuPanelItem = this.panelMenuItems[this.currentTab][0].key;
      this.activeMenuElement = this.panelMenuItems[this.currentTab][0];
      // this.currentEditor = this.panelMenuItems[this.currentTab][0].key;
      if (this.editor) {
        this.editor.commands.setContent(this.activeMenuElement.editor);
      }
      this.initial_tabs = false;
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
      if (this.notebook)
        newSection(this.notebook).then((value) => {
          const newTabItem = value[0];
          const newPanelMenu = value[1];

          this.tabItems.push(newTabItem);
          this.currentTab = newTabItem.key;

          this.panelMenuItems = { ...this.panelMenuItems, ...newPanelMenu };
          this.currentMenuPanelItem = newPanelMenu[this.currentTab][0].key;
          this.activeMenuElement = this.panelMenuItems[
            this.currentMenuPanelItem
          ] as unknown as PageItem;
          if (this.editor)
            this.editor.commands.setContent(this.activeMenuElement.editor);
        });
    },
    async addMenuElement(): Promise<void> {
      if (!this.panelMenuItems[this.currentTab]) {
        throw new Error("The key for the panelitems does not exist yet");
      }
      this.panelMenuItems[this.currentTab].push(await newPage(this.currentTab));
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
/* Give a remote user a caret */
.collaboration-cursor__caret {
  position: relative;
  margin-left: -1px;
  margin-right: -1px;
  border-left: 1px solid #0d0d0d;
  border-right: 1px solid #0d0d0d;
  word-break: normal;
  pointer-events: none;
}

/* Render the username above the caret */
.collaboration-cursor__label {
  position: absolute;
  top: -1.4em;
  left: -1px;
  font-size: 12px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  user-select: none;
  color: #0d0d0d;
  padding: 0.1rem 0.3rem;
  border-radius: 3px 3px 3px 0;
  white-space: nowrap;
}

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
