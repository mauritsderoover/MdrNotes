<template>
  <editor-notes
    v-if="dataLoaded && activeMenuElement"
    :page="activeMenuElement"
    @content-updated="addContentChange"
  >
    <template #tabs>
      <draggable-tab-menu
        v-model:activeIndex="activeIndex"
        :model="dataLoader.notebook.sections"
        :new-tab="newTab"
        @tab-change="updateCurrentTab"
        @add-tab="addTab"
        @label-changed="labelChange"
        @delete-item="deleteSection"
      />
    </template>
    <template #panelMenu>
      <draggable-panel-menu
        :model="currentTab ? currentTab.pages : []"
        :section-identifier="currentTab ? currentTab.key : ''"
        layer="mainItem"
        @tab-change="updateMenuItem"
        @add-menu-element="addMenuElement"
        @label-changed="labelChange"
        @delete-item="deletePageNote"
      />
    </template>
  </editor-notes>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import EditorNotes from "@/components/modules/editor/actioncomponents/EditorComponents/Editor.vue";
import { deleteContainerContents } from "@/components/genericcomponents/utils/utils";
import DraggableTabMenu from "../../modules/editor/actioncomponents/MenuComponents/DraggableTabMenu.vue";
import DraggablePanelMenu from "../../modules/editor/actioncomponents/MenuComponents/DraggablePanelMenu.vue";
import { MainDashBoardInterface } from "@/components/modules/editor/editor-interfaces";
import { PageContent } from "@/components/modules/editor/editor-classes";
import DataSynchronizer from "@/components/modules/editor/data-synchronizer";
import DataLoader from "@/components/modules/editor/data-loader";
import { hasPage, hasSection } from "@/components/modules/editor/DataModel";
import { Page } from "@/components/modules/editor/classes/page";
import { Section } from "@/components/modules/editor/classes/section";
import { Note } from "@/components/modules/editor/classes/note";

export default defineComponent({
  name: "MainDashboard",
  components: {
    DraggablePanelMenu,
    EditorNotes,
    DraggableTabMenu,
  },
  data(): MainDashBoardInterface {
    return {
      newTab: false,
      tabItems: [],
      panelMenuItems: {},
      currentTab: undefined,
      currentMenuPanelItem: undefined,
      activeIndex: 0,
      lazy: false,
      editors: {},
      currentEditor: "",
      editor: undefined,
      activeMenuElement: new Page("", "", 0, 0),
      notebook: "undefined",
      synchronizer: new DataSynchronizer(),
      dataLoader: new DataLoader(),
      dataLoaded: false,
    };
  },
  beforeMount() {
    // this.dataLoader.initialDataLoaded = this.dataLoaded;
    // this.dataLoader = new DataLoader();
    this.dataLoader.initialDataLoadedChecker().then(() => {
      this.dataLoaded = true;
      if (this.dataLoader.notebook) {
        this.currentTab = this.dataLoader.notebook.sections[0];
        if (this.currentTab.pages.length > 0) {
          this.currentMenuPanelItem = this.currentTab.pages[0];
          this.activeMenuElement = this.currentMenuPanelItem;
        }
      }
    });
  },
  methods: {
    addContentChange(event: Note) {
      if (this.activeMenuElement)
        this.synchronizer.addContentChange(this.activeMenuElement.key, event);
    },
    // saveAllPositions(): void {
    //   if (this.dataLoader) this.dataLoader.saveAllPositions();
    // },
    cleanNotesContainer(): void {
      deleteContainerContents(
        "https://mauritsderoover.solidcommunity.net/notes/"
      );
      // if (this.dataLoader) this.dataLoader.cleanNotesContainer();
    },
    deletePageNote(page: Page) {
      if (this.currentTab) {
        let index = this.currentTab.pages.indexOf(page);
        this.currentTab.removePage(page);
        if (index > this.currentTab.pages.length) index--;
        this.currentMenuPanelItem = this.currentTab.pages[index];
        this.activeMenuElement = this.currentMenuPanelItem;
      }
    },
    deleteSection(section: Section) {
      const notebook = this.dataLoader.notebook;
      if (notebook) {
        let index = notebook.sections.indexOf(section);
        notebook.removeSection(section);
        if (index > notebook.sections.length) index--;
        this.currentTab = notebook.sections[index];
        this.currentMenuPanelItem = this.currentTab.pages[0];
        this.activeMenuElement = this.currentMenuPanelItem;
      }
    },
    // loadItem(item: Page): void {
    //   this.synchronizer.storeMiniEditor(item.key);
    // },
    labelChange(event: {
      activeIndex: number;
      doubleClickedItem: Section | Page;
    }) {
      event.doubleClickedItem.saveTitle();
    },
    updateCurrentTab(event: { index: number }) {
      if (this.dataLoader.notebook) {
        this.activeIndex = event.index;

        this.currentTab = this.dataLoader.notebook.sections[this.activeIndex];

        this.currentMenuPanelItem = this.currentTab.pages[0];
        this.activeMenuElement = this.currentTab.pages[0];
      }
    },
    addTab() {
      if (this.dataLoader && this.dataLoader.notebook) {
        this.newTab = true;

        this.currentTab = this.dataLoader.notebook.createSection();
        this.currentTab.saveToDatabase().then(async () => {
          if (this.currentTab && this.dataLoader.notebook) {
            // this.currentTab.saveToSolid();
            this.currentMenuPanelItem = this.currentTab.createPage();
            this.activeMenuElement = this.currentMenuPanelItem;
            await this.currentMenuPanelItem.saveToDatabase();
            await Promise.all([
              this.currentTab.saveToSolid(),
              this.currentMenuPanelItem.saveToSolid(),
            ]);
            this.currentMenuPanelItem.linkPage(
              hasPage.SECTION,
              this.currentTab.key
            );
            this.currentTab.linkSection(
              hasSection.NOTEBOOK,
              this.dataLoader.notebook.key
            );
          }
        });
        // this.activeMenuElement = this.panelMenuItems[this.currentTab][0];
        // this.currentMenuPanelItem = this.activeMenuElement.key;
        this.newTab = false;
      }
    },
    addMenuElement(): void {
      if (this.dataLoader && this.currentTab) {
        this.activeMenuElement = this.currentTab.createPage();
        this.activeMenuElement.saveToDatabase().then(async () => {
          if (this.activeMenuElement && this.currentTab) {
            await this.activeMenuElement.saveToSolid();
            await this.activeMenuElement.linkPage(
              hasPage.SECTION,
              this.currentTab.key
            );
          }
        });
      }
    },
    updateMenuItem(event: { item: Page }) {
      this.activeMenuElement = event.item;
      this.currentMenuPanelItem = event.item;
    },
  },
});
</script>
