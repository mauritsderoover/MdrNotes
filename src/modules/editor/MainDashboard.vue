<template>
  <div class="p-grid">
    <div class="card p-col-10">
      <TabMenu
        :model="tabItems"
        v-model:activeIndex="activeIndex"
        @tab-change="updateCurrentTab"
      ></TabMenu>
    </div>
    <div class="p-col-2">
      <Button
        label="Save the tabnotes"
        icon="pi pi-check"
        class="p-button-sm p-button-help"
        @click="storeTabItems"
      />
    </div>
  </div>
  <div class="p-tabview-panels">
    <template v-for="(tab, i) of tabItems" :key="tab.key">
      <div
        class="p-tabview-panel"
        v-if="lazy ? activeIndex === i : true"
        v-show="lazy ? true : activeIndex === i"
      >
        <SubDashboard :tab="tab.key" />
      </div>
    </template>
  </div>
</template>

<script>
import TabMenu from "primevue/tabmenu";
import Button from "primevue/button";
import axios from "axios";
import { saveJsonFile } from "@/genericcomponents/utils";
import SubDashboard from "@/modules/editor/SubDashboard";
// import TabPanel from "@/modules/editor/actioncomponents/MenuComponents/TabPanel";

export default {
  name: "MainDashboard",
  components: {
    TabMenu,
    Button,
    SubDashboard,
    // TabPanel,
  },
  data() {
    return {
      tabItems: [],
      currentTab: "",
      activeIndex: 0,
      lazy: false,
    };
  },
  beforeMount() {
    this.getTabItems();
  },
  methods: {
    updateCurrentTab() {
      this.currentTab = this.tabItems[this.activeIndex].key;
      console.log(this.activeIndex, this.currentTab);
    },
    setInitialTabs() {
      this.tabItems = [
        {
          label: "First page",
          key: "tab-0",
        },
        {
          icon: "pi pi-fw pi-plus",
          command: (event) => {
            this.addTabItem("Untitled");
          },
        },
      ];
      this.currentTab = this.tabItems[0].key;
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
    addTabItem(tabTitel) {
      this.tabItems.splice(this.tabItems.length - 1, 0, {
        label: tabTitel,
        key: `tab-${this.tabItems.length}`,
      });
    },
    removeTabItem() {},
    storeTabItems() {
      saveJsonFile(JSON.stringify(this.tabItems), "/data/tab-notes.json");
    },
  },
};
</script>

<style scoped></style>
