<template>
  <div class="p-grid nested-grid">
    <div class="p-col-12">
      <Toolbar ref="toolbar" />
    </div>
    <div class="p-col-12">
      <DraggableTabMenu
        v-model:activeIndex="activeIndex"
        :model="tabItems"
        @tab-change="updateCurrentTab"
      />
    </div>
    <div class="p-col-12">
      <div class="p-grid">
        <div class="p-col-2">
          <DraggablePanelMenu
            :model="panelMenuItems[currentTab]"
            layer="mainItem"
            @tab-change="updateMenuItem"
          />
        </div>
        <div class="p-col-10">
          <div
            ref="editor"
            :="editors[currentEditor]"
            style="height: 400px"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { saveJsonFile } from "@/genericcomponents/utils";
import DraggableTabMenu from "@/modules/editor/actioncomponents/MenuComponents/DraggableTabMenu";
import Toolbar from "@/modules/editor/actioncomponents/EditorComponents/Toolbar";
import Quill from "quill";
import DraggablePanelMenu from "@/modules/editor/actioncomponents/MenuComponents/DraggablePanelMenu";

export default {
  name: "MainDashboard",
  components: {
    DraggablePanelMenu,
    Toolbar,
    DraggableTabMenu,
  },
  data() {
    return {
      tabItems: [
        {
          label: "Tab 1",
          key: "tab-0",
          newKey: "tab0",
        },
        {
          icon: "pi pi-fw pi-plus",
          command: (event) => {
            this.addTabItem("Untitled");
          },
        },
      ],
      panelMenuItems: {
        tab0: [
          {
            label: "Untitled",
            icon: "pi pi-fw pi-file",
            key: "main-item-1",
          },
          {
            label: "Add page",
            icon: "pi pi-fw pi-plus",
            key: "main-item-0",
            command: (event) => {
              this.currentItem = event.item;
              this.addPanelMenuItem("untitled");
            },
          },
        ],
      },
      currentTab: "tab0",
      currentMenuPanelItem: null,
      activeIndex: 0,
      lazy: false,
      editors: { tab0: null },
      currentEditor: null,
      newTab: null,
      addPage: {},
    };
  },
  beforeMount() {
    this.getTabItems();
  },
  mounted() {
    console.log("this is editors in mounted", this.editors);
    this.currentEditor = "editor0";
    this.editors.editor0 = null;
    this.editor = new Quill(this.$refs.editor, {
      theme: "snow",
      modules: {
        toolbar: this.$refs.toolbar.$refs.toolbar,
      },
    });
    this.editor.root.innerHTML = this.editors[this.currentEditor];
    this.getNotes();
    this.editor.on("text-change", () => {
      this.editors[this.currentEditor] = this.editor.getContents();
      console.log(JSON.stringify(this.editor.getContents()));
    });
  },
  methods: {
    // Keep track of active tabs and menu items
    updateCurrentTab(event) {
      this.activeIndex = event.index;
      this.currentTab = this.tabItems[this.activeIndex].newKey;
      this.currentMenuPanelItem = this.panelMenuItems[this.currentTab][0].key;
      this.currentEditor = this.panelMenuItems[this.currentTab][0].editor;
      this.editor.setContents(this.editors[this.currentEditor]);
    },
    updateMenuItem(event) {
      this.activeMenuElement = event.item;
      this.currentEditor = this.activeMenuElement.editor;
      this.editor.setContents(this.editors[this.currentEditor]);
      console.log("this is the editor", this.editors);
    },

    // Create and delete tabs
    addTabItem(tabTitel) {
      const newTab = {
        label: tabTitel,
        key: `tab-${this.tabItems.length}`,
        newKey: `tab${this.tabItems.length}`,
      };
      this.tabItems.splice(this.tabItems.length - 1, 0, newTab);
      this.panelMenuItems[newTab.newKey] = [
        {
          label: "Untitled",
          icon: "pi pi-fw pi-file",
          key: "main-item-1",
          editor: `editor${Object.keys(this.editors).length}`,
        },
        {
          label: "add page",
          icon: "pi pi-fw pi-plus",
          key: `${newTab.newKey}-main-item-0`,

          command: (event) => {
            this.currentItem = event.item;
            this.addPanelMenuItem("untitled");
          },
        },
      ];
      this.editors[`editor${Object.keys(this.editors).length}`] = null;
    },
    removeTabItem() {},

    // Create and delete PanelMenuItems
    addPanelMenuItem(tabTitel) {
      this.panelMenuItems[this.currentTab].splice(
        this.panelMenuItems[this.currentTab].length - 1,
        0,
        {
          label: tabTitel,
          icon: "pi pi-fw pi-file",
          key: `${this.currentTab}-main-item-${
            this.panelMenuItems[this.currentTab].length
          }`,
          editor: `editor${Object.keys(this.editors).length}`,
          command: (event) => {
            this.currentItem = event.item;
          },
          items: [
            {
              label: "Add page",
              parentKey: `${this.currentTab}-main-item-${
                this.panelMenuItems[this.currentTab].length
              }`,
              key: `${this.currentTab}-sub-item-0`,
              editor: `editor${Object.keys(this.editors).length}`,
              icon: "pi pi-fw pi-file",
              command: (event) => {
                this.currentItem = event.item;
                this.addPanelMenuSubItem("Untitled", event);
              },
              items: [
                {
                  label: "another item",
                  key: "sub-sub-item-0",
                  editor: `editor${Object.keys(this.editors).length + 1}`,
                  items: [],
                },
              ],
            },
          ],
        }
      );
      this.editors[`editor${Object.keys(this.editors).length}`] = null;
      this.editors[`editor${Object.keys(this.editors).length + 1}`] = null;
    },
    addPanelMenuSubItem(tabTitel, event) {
      console.log(
        "this is tabTitel and event in addPanelMenuSubItem",
        tabTitel,
        event,
        this.panelMenuItems,
        this.currentTab
      );
      const mainitem = this.panelMenuItems[this.currentTab].find((mainItem) => {
        return mainItem.key === event.item.parentKey;
      });
      mainitem.items.splice(mainitem.items.length - 1, 0, {
        label: tabTitel,
        parentkey: mainitem.key,
        key: `sub-item-${mainitem.items.length}`,
        icon: "pi pi-fw pi-file",
        editor: `editor${Object.keys(this.editors).length}`,
        items: [],
      });
      this.editors[`editor${Object.keys(this.editors).length}`] = null;
    },

    // Store data
    storeTabItems() {
      saveJsonFile(JSON.stringify(this.tabItems), "/data/tab-notes.json");
    },
    saveContents() {
      saveJsonFile(
        JSON.stringify(this.editor.getContents()),
        `${this.identifier}.json`
      );
    },

    // Get data
    getNotes() {
      const axios = require("axios");
      axios.get("/notes.json").then((response) => {
        console.log(response);
        this.editor.setContents(response.data);
      });
    },
    setInitialTabs() {
      this.menuItems = {};
      this.tabItems = [
        {
          label: "First page",
          key: "tab-0",
          newKey: "tab0",
        },
        {
          icon: "pi pi-fw pi-plus",
          command: (event) => {
            this.addTabItem("Untitled");
          },
        },
      ];
      this.currentTab = this.tabItems[0].newKey;
      this.currentMenuPanelItem = this.panelMenuItems[this.currentTab][0];
    },
    getTabItems() {
      axios
        .get("/data/tab-notes.json")
        .then((value) => {
          this.tabItems = value.data;
        })
        .catch(() => {
          this.setInitialTabs();
        });
    },
  },
};
</script>

<style scoped>
@import "https://cdn.quilljs.com/1.3.6/quill.snow.css";
</style>
