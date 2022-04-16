<template>
  <div class="grid m-0">
    <tab-menu
      id="MenuBarProposal"
      :active-index="activeIndex"
      :model="tabs"
      class="col-12 m-0 p-0"
      @tab-change="handleTabChange"
    />
    <div v-if="toolbarVisible" class="col-12 m-0 p-0 pb-2">
      <start-bar v-if="activeIndex === 0" :editor="editor" />
      <insert-bar v-if="activeIndex === 1" :editor="editor" />
      <settings-bar v-if="activeIndex === 2" :editor="editor" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import TabMenu from "primevue/tabmenu";
import Insert from "./InsertBar.vue";
import Settings from "./SettingsBar.vue";
import StartBar from "@/components/modules/editor/actioncomponents/EditorComponents/toolbars/StartBar.vue";
import { Editor } from "@tiptap/vue-3";
import SettingsBar from "@/components/modules/editor/actioncomponents/EditorComponents/toolbars/SettingsBar.vue";
import InsertBar from "@/components/modules/editor/actioncomponents/EditorComponents/toolbars/InsertBar.vue";

export default defineComponent({
  name: "MenuBarProposal",
  components: {
    InsertBar,
    SettingsBar,
    StartBar,
    TabMenu,
  },
  props: {
    editor: {
      type: Editor,
      required: true,
    },
  },
  emits: [],
  data() {
    return {
      tabs: [
        { label: "Start", component: "Start" },
        { label: "Insert", component: "Insert" },
        { label: "Settings", component: "Settings" },
      ],
      activeIndex: 0,
      toolbarVisible: true,
    };
  },
  methods: {
    handleTabChange(event: { index: number }): void {
      if (this.activeIndex === event.index) {
        this.toolbarVisible = !this.toolbarVisible;
      } else {
        this.activeIndex = event.index;
        this.toolbarVisible = true;
      }
    },
  },
});
</script>

<style lang="scss">
#MenuBarProposal.p-tabmenu .p-tabmenu-nav .p-tabmenuitem a.p-menuitem-link {
  padding: 0.1rem 2rem 0.3rem 0.3rem;
}
</style>
