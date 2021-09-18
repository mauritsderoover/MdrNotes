<template>
  <div>
    <div class="card">
      <TabMenu :model="items"/>
    </div>
    <div class="p-grid">

      <div class="card p-col-2">
        <PanelMenu
          :model="mainItems"
          @contextmenu="onImageRightClick"
        />

        <ContextMenu ref="menu" :model="items"/>

      </div>
      <div class="p-col-10">
        <Editor editorId="editorId"/>
      </div>
    </div>
  </div>

</template>

<script>
import TabMenu from 'primevue/tabmenu';
import PanelMenu from './actioncomponents/MenuComponents/PanelMenu.vue';
import Editor from "@/modules/editor/actioncomponents/EditorComponents/Editor";
import ContextMenu from 'primevue/contextmenu';

export default {
  name: "EditorDashboard",
  components: {TabMenu, PanelMenu, Editor, ContextMenu},
  data() {
    return {
      items: [
        {
          label: 'Add page',
          icon: 'pi pi-fw pi-home',
          command: (event) => {
            this.addItem("test");
            console.log(event)
          }
        },
        {
          label: 'Add subpage',
          icon: 'pi pi-fw pi-calendar',
          command: (event) => {
            this.addSubItem("test");
            console.log(event)
          }
        }
      ],
      mainItems: [
        {
          label: 'Add page',
          icon: 'pi pi-fw pi-plus',
          key: "main-item-0",
          command: (event) => {
            this.currentItem = event.item
            this.addItem("test");
            console.log(event)
          },
        }
      ],
      visibleLeft: true,
      expandedKeys: {},
      editorId: "main-item-0",
      currentItem: ""
    }
  },
  methods: {
    testing(event) {
      console.log("this is happening \n", this.currentItem, "\n", event);
    },
    addItem(tabTitel) {
      console.log(this.mainItems)
      console.log("this is executed")
      this.mainItems.splice(this.mainItems.length - 1, 0, {
        label: tabTitel,
        icon: 'pi pi-fw pi-file',
        key: `main-item-${this.mainItems.length}`,
        command: (event) => {
          this.currentItem = event.item
          console.log(event)
        },
        items: [{
          label: 'Add page',
          parentKey: `main-item-${this.mainItems.length}`,
          key: `sub-item-0`,
          icon: 'pi pi-fw pi-file',
          command: (event) => {
            this.currentItem = event.item;
            this.addSubItem("test", event);
            console.log(event);

          }
        }],
      });
    },
    addSubItem(tabTitel, event) {
      console.log(tabTitel);
      console.log(event)
      console.log(event.item.key)
      const mainitem = this.mainItems.find(mainItem => {
        return mainItem.key === event.item.parentKey;
      })
      mainitem.items.splice(mainitem.items.length - 1, 0, {
        label: tabTitel,
        parentkey: mainitem.key,
        key: `sub-item-${mainitem.items.length}`,
        icon: 'pi pi-fw pi-file'
      })
    },
    onImageRightClick(event) {
      this.$refs.menu.show(event);
    },
    expandAll() {
      for (let node of this.mainItems) {
        this.expandNode(node);
      }
    },
    collapseAll() {
      this.expandedKeys = {};
    },
    expandNode(node) {
      if (node.items && node.items.length) {
        this.expandedKeys[node.key] = true;
        for (let child of node.items) {
          this.expandNode(child);
        }
      }
    }
  },
}
</script>

<style scoped>

</style>