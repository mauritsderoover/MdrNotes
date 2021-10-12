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
            <div
              :editor-id="mainItem.key"
              :id="mainItem.key"
              :ref="mainItem.key"
            ></div>
          </div>
          <template v-for="subItem of mainItem.items" :key="subItem.key">
            <div
              v-if="lazy ? activeMenuElement === subItem : true"
              v-show="lazy ? true : activeMenuElement === subItem"
              class="p-tabview-panel"
            >
              <div
                :editor-id="subItem.key"
                :id="subItem.key"
                :ref="subItem.key"
              ></div>
            </div>
          </template>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import PanelMenu from "./actioncomponents/MenuComponents/DraggablePanelMenu.vue";
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
