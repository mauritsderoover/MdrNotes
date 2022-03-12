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
import EditorNotes from "@/components/modules/editor/actioncomponents/EditorComponents/Editor.vue";
import { deleteContainerContents } from "@/components/genericcomponents/utils/utils";
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
    EditorNotes,
    DraggableTabMenu,
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
      activeMenuElement: new PageItem({
        label: "",
        editorContent: "",
        url: "https://placeholder.com",
      }),
      notebook: undefined,
      synchronizer: new DataSynchronizer(),
      dataLoader: undefined,
    };
  },
  watch: {
    "activeMenuElement.editorContent"(value) {
      if (this.activeMenuElement)
        this.synchronizer.addContentChange(this.activeMenuElement.key, value);
    },
  },
  beforeMount() {
    this.dataLoader = new DataLoader(this.panelMenuItems, this.tabItems);
    this.dataLoader.initialDataLoadedChecker().then(() => {
      this.currentTab = this.tabItems[0].key;
      this.activeMenuElement = this.panelMenuItems[this.currentTab][0];
      this.currentMenuPanelItem = this.activeMenuElement.key;
    });
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
    },
    labelChange(event: { activeIndex: number; doubleClickedItem: TabItem }) {
      this.synchronizer.saveTitle(
        event.doubleClickedItem.key,
        event.doubleClickedItem.label
      );
    },
    updateCurrentTab(event: { index: number }) {
      this.activeIndex = event.index;
      this.currentTab = this.tabItems[this.activeIndex].key;
      this.currentMenuPanelItem = this.panelMenuItems[this.currentTab][0].key;
      this.activeMenuElement = this.panelMenuItems[this.currentTab][0];
    },
    addTab() {
      if (this.dataLoader) {
        this.newTab = true;
        this.currentTab = this.dataLoader.newSection();
        this.activeMenuElement = this.panelMenuItems[this.currentTab][0];
        this.currentMenuPanelItem = this.activeMenuElement.key;
        this.newTab = false;
      }
    },
    addMenuElement(): void {
      if (this.dataLoader) this.dataLoader.newPage(this.currentTab);
      this.activeMenuElement = this.panelMenuItems[this.currentTab].at(-1);
      if (this.activeMenuElement) {
        this.currentMenuPanelItem = this.activeMenuElement.key;
      }
    },
    logUserOut(): void {
      logout().then(() => {
        this.$router.push("/");
      });
    },
    updateMenuItem(event: { item: PageItem }) {
      this.activeMenuElement = event.item;
      this.currentMenuPanelItem = event.item.key;
    },
  },
});
</script>
