<template>
  <div>
    <div class="p-grid">
      <div class="card p-col-2">
        <PanelMenu :model="mainItems" @tab-change="updateMenuItem" />
      </div>
      <!--      <rawDisplayer class="p-col-2" :value="mainItems" title="List" />-->
      <div class="p-tabview-panels p-col-10">
        <template v-for="mainItem of mainItems" :key="mainItem.key">
          <div
            v-if="lazy ? activeMenuElement === mainItem : true"
            v-show="lazy ? true : activeMenuElement === mainItem"
            class="p-tabview-panel"
          >
            <Editor :editor-id="mainItem.key" :toolbarRef="toolbarRef" />
          </div>
          <template v-for="subItem of mainItem.items" :key="subItem.key">
            <div
              v-if="lazy ? activeMenuElement === subItem : true"
              v-show="lazy ? true : activeMenuElement === subItem"
              class="p-tabview-panel"
            >
              <Editor :editor-id="subItem.key" :toolbarRef="toolbarRef" />
            </div>
          </template>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import PanelMenu from "./actioncomponents/MenuComponents/DraggablePanelMenu.vue";
import Editor from "@/modules/editor/actioncomponents/EditorComponents/Editor";

// import rawDisplayer from "@/modules/editor/genericcomponents/rawDisplayer";
import axios from "axios";

export default {
  name: "EditorDashboard",
  props: {
    tab: {
      type: String,
    },
    toolbarRef: {},
  },
  components: {
    PanelMenu,
    Editor,
    // rawDisplayer,
  },
  mounted() {
    console.log("SubDashboard has been mounted");
    console.log(this.toolbarRef);
  },
  data() {
    return {
      mainItems: [
        {
          label: "Add page",
          icon: "pi pi-fw pi-plus",
          key: "main-item-0",
          command: (event) => {
            this.currentItem = event.item;
            this.addItem("untitled");
          },
        },
      ],
      visibleLeft: true,
      expandedKeys: {},
      editorId: "main-item-0",
      currentItem: "",
      activeMenuElement: null,
    };
  },
  watch: {
    toolbarRef() {
      console.log("This is watch in subdashboard", this.toolbarRef);
    },
  },
  methods: {
    updateMenuItem(event) {
      console.log("this is in updateMenuItem", event);
      this.activeMenuElement = event.item;
    },
    loadData() {
      axios
        .get("")
        .then((data) => {
          this.mainItems = data.data;
        })
        .catch(() => {
          this.mainItems = [
            {
              label: "Add page",
              icon: "pi pi-fw pi-plus",
              key: "main-item-0",
              command: (event) => {
                this.currentItem = event.item;
                this.addItem("untitled");
              },
            },
          ];
        });
    },
    testing(event) {
      console.log("this is happening \n", this.currentItem, "\n", event);
    },
    addItem(tabTitel) {
      this.mainItems.splice(this.mainItems.length - 1, 0, {
        label: tabTitel,
        icon: "pi pi-fw pi-file",
        key: `main-item-${this.mainItems.length}`,
        command: (event) => {
          this.currentItem = event.item;
        },
        items: [
          {
            label: "Add page",
            parentKey: `main-item-${this.mainItems.length}`,
            key: `sub-item-0`,
            icon: "pi pi-fw pi-file",
            command: (event) => {
              this.currentItem = event.item;
              this.addSubItem("Untitled", event);
            },
            items: [
              {
                label: "another item",
                items: [],
              },
            ],
          },
        ],
      });
    },
    addSubItem(tabTitel, event) {
      const mainitem = this.mainItems.find((mainItem) => {
        return mainItem.key === event.item.parentKey;
      });
      mainitem.items.splice(mainitem.items.length - 1, 0, {
        label: tabTitel,
        parentkey: mainitem.key,
        key: `sub-item-${mainitem.items.length}`,
        icon: "pi pi-fw pi-file",
        items: [],
      });
    },

    expandAll() {
      for (const node of this.mainItems) {
        this.expandNode(node);
      }
    },
    collapseAll() {
      this.expandedKeys = {};
    },
    expandNode(node) {
      if (node.items && node.items.length) {
        this.expandedKeys[node.key] = true;
        for (const child of node.items) {
          this.expandNode(child);
        }
      }
    },
  },
};
</script>

<style scoped></style>
