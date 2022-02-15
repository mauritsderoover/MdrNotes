<template>
  <div class="p-grid nested-grid">
    <div class="p-col-12">
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
    <div class="p-col-12">
      <Toolbar ref="toolbar" />
    </div>
    <div class="p-col-12">
      <DraggableTabMenu
        v-model:activeIndex="activeIndex"
        :model="tabItems"
        @tab-change="updateCurrentTab"
        @add-tab="addTab"
        @label-changed="labelChange"
      />
    </div>
    <div class="p-col-12">
      <div class="p-grid">
        <div class="p-col-2">
          <DraggablePanelMenu
            :model="panelMenuItems[currentTab]"
            :section-identifier="currentTab"
            layer="mainItem"
            @tab-change="updateMenuItem"
            @add-menu-element="addMenuElement"
          />
        </div>
        <div class="p-col-10">
          <div
            ref="editor"
            v-bind="editors[currentEditor]"
            style="height: 400px"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Button from "primevue/button";
import {
  containerExists,
  // deleteContainerContents,
  // createContainerAtUri,
  deleteContainerContents,
} from "@/components/genericcomponents/utils/utils";
import DraggableTabMenu from "../../modules/editor/actioncomponents/MenuComponents/DraggableTabMenu.vue";
import Toolbar from "../../modules/editor/actioncomponents/EditorComponents/Toolbar.vue";
import Quill, { Delta } from "quill";
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
} from "@/components/modules/editor/DataModel";
import { PageItem } from "@/components/modules/editor/editor-classes";

// import { LDP } from "@inrupt/vocab-common-rdf";
export default defineComponent({
  name: "MainDashboard",
  components: {
    DraggablePanelMenu,
    Toolbar,
    DraggableTabMenu,
    Button,
  },
  data(): MainDashBoardInterface {
    return {
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
    };
  },
  async beforeMount() {
    const URI = `${this.$store.getters.getOrigin}/notes/`;
    // await deleteContainerContents(URI);
    if (await containerExists(URI)) {
      await this.loadData();
    } else {
      await this.createInitialNotes();
    }
  },
  mounted() {
    this.editor = new Quill(this.$refs.editor as HTMLDivElement, {
      theme: "snow",
      modules: {
        toolbar: (this.$refs.toolbar as any).$refs.toolbar,
      },
    }) as Quill;

    this.editor.root.innerHTML = this.editors[
      this.currentEditor
    ] as unknown as string;
    this.editor.on("text-change", () => {
      if (this.editor) {
        // console.log("this is editor", this.editor);
        console.log("this is activeMenuElement", this.activeMenuElement);
        if (this.activeMenuElement) {
          this.activeMenuElement.editor = this.editor.getContents();
          console.log(
            "this is currentMenuPanelItem",
            this.currentMenuPanelItem
          );
        }
        this.editors[this.currentEditor] = this.editor.getContents();
        savePageContent(
          this.currentMenuPanelItem,
          JSON.stringify(this.editor.getContents())
        );
      }
    });
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

      // if (solidDataset) {
      //   let things = getThing(solidDataset, uri);
      //   // solidDataset = removeThing(solidDataset, uri);
      //   if (things) {
      //     things = buildThing(createThing({ name: "Tester1" }))
      //       .addUrl(RDF.type, NOTETAKING.Section)
      //       .addDecimal(NOTETAKING.partOfSectionGroup, 5)
      //       .build();
      //     console.log("things", things);
      //     solidDataset = setThing(solidDataset, things);
      //     console.log("newDataSet", solidDataset);
      //     await saveSolidDatasetAt(uri, solidDataset, {
      //       fetch,
      //     }).then(() => {
      //       console.log("this has been successful");
      //     });
      //   }
      // }
    },
    deleteRootContainer() {
      const uri = "https://mauritsderoover.solidcommunity.net/notes/";
      deleteContainerContents(uri);
      // TODO
    },
    changeTitle() {
      console.log("this is blabla");
    },
    labelChange(event: any) {
      console.log("this has been executed", event);
    },
    createInitialNotes() {
      newNoteBook("Your First Notebook").then(() => {
        this.loadData();
      });
    },
    async loadData() {
      [this.notebook, this.tabItems, this.panelMenuItems] = await loadData();
      // for every tab we get the related dataset
      this.currentTab = this.tabItems[0].key;
      this.currentMenuPanelItem = this.panelMenuItems[this.currentTab][0].key;
      this.activeMenuElement = this.panelMenuItems[this.currentTab][0];
      this.currentEditor = this.panelMenuItems[this.currentTab][0].key;
      if (this.editor) {
        this.editor.setContents(this.panelMenuItems[this.currentTab][0].editor);
      }
    },
    // Keep track of active tabs and menu items
    updateCurrentTab(event: { index: number }) {
      this.activeIndex = event.index;
      this.currentTab = this.tabItems[this.activeIndex].key;
      this.currentMenuPanelItem = this.panelMenuItems[this.currentTab][0].key;
      this.activeMenuElement = this.panelMenuItems[this.currentTab][0];
      this.currentEditor = this.panelMenuItems[this.currentTab][0].key;
      if (this.editor) {
        this.editor.setContents(this.panelMenuItems[this.currentTab][0].editor);
      }
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
          if (this.editor) this.editor;
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
      console.log("this is the event", event);
      console.log(
        "this is panelMenuItems",
        this.panelMenuItems[this.currentTab][0].editor
      );
      this.activeMenuElement = event.item;
      this.currentMenuPanelItem = event.item.key;
      this.currentEditor = this.activeMenuElement.key;
      if (this.editor) {
        this.editor.setContents(this.activeMenuElement.editor);
      }
    },
  },
});
</script>

<style scoped>
@import "https://cdn.quilljs.com/1.3.6/quill.snow.css";
</style>
