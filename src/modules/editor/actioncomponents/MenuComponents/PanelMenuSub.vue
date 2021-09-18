<template>
  <ul class="p-submenu-list" role="tree">
    <template v-for="(item, i) of model" :key="item.label + i.toString()">
      <li draggable="true" role="none" :class="getItemClass(item)" :style="item.style"
          v-if="visible(item) && !item.separator">
        <template v-if="!template">
          <router-link v-if="item.to && !disabled(item)" :to="item.to" custom
                       v-slot="{navigate, href, isActive, isExactActive}">
            <a :href="href" :class="linkClass(item, {isActive, isExactActive})"
               @click="onItemClick($event, item, navigate)" draggable="true" @dragstart="startDrag($event, item)"
               role="treeitem" :aria-expanded="isActive(item)">
              <span :class="['p-menuitem-icon', item.icon]"></span>
              <span class="p-menuitem-text">{{ item.label }}</span>
            </a>
          </router-link>
          <a v-else :href="item.url" :class="linkClass(item)" :target="item.target" @click="onItemClick($event, item)"
             draggable="true" @dragstart="startDrag($event, item)"
             role="treeitem" :aria-expanded="isActive(item)" :tabindex="disabled(item) ? null : '0'">
            <span :class="getSubmenuIcon(item)" v-if="item.items"></span>
            <span :class="['p-menuitem-icon', item.icon]"></span>
            <span class="p-menuitem-text">{{ item.label }}</span>
          </a>
        </template>
        <component v-else :is="template" :item="item"></component>
        <transition name="p-toggleable-content">
          <div class="p-toggleable-content" v-show="isActive(item)">
            <PanelMenuSub :model="item.items" v-if="visible(item) && item.items" :key="item.label + '_sub_'"
                          :template="template"
                          :expandedKeys="expandedKeys" @item-toggle="$emit('item-toggle', $event)" :exact="exact"/>
          </div>
        </transition>
      </li>
      <li :class="['p-menu-separator', item.class]" :style="item.style" v-if="visible(item) && item.separator"
          :key="'separator' + i.toString()"></li>
    </template>
  </ul>
</template>

<script>
export default {
  name: 'PanelMenuSub',
  emits: ['item-toggle'],
  props: {
    model: {
      type: null,
      default: null
    },
    template: {
      type: Object,
      default: null
    },
    expandedKeys: {
      type: null,
      default: null
    },
    exact: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      activeItem: null
    }
  },
  methods: {
    onItemClick(event, item, navigate) {
      if (this.isActive(item) && this.activeItem === null) {
        this.activeItem = item;
      }

      if (this.disabled(item)) {
        event.preventDefault();
        return;
      }

      if (item.command) {
        item.command({
          originalEvent: event,
          item: item
        });
      }

      if (this.activeItem && this.activeItem === item)
        this.activeItem = null;
      else
        this.activeItem = item;

      this.$emit('item-toggle', {item: item, expanded: this.activeItem != null});

      if (item.to && navigate) {
        navigate(event);
      }
    },
    startDrag: (event, item) => {
      console.log("This is called \n", "This is the event \n", event, "\n This is the item", item);
      event.dataTransfer.dropEffect = 'move';
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('itemID', item.id);
      console.log("This is called at the end \n", "This is the event \n", event, " \n This is the item", item);
    },
    onDrop(evt, list) {
      const itemID = evt.dataTransfer.getData('itemID')
      const item = this.items.find(item => item.id == itemID)
      item.list = list
    },
    getItemClass(item) {
      return ['p-menuitem', item.className];
    },
    linkClass(item, routerProps) {
      return ['p-menuitem-link', {
        'p-disabled': this.disabled(item),
        'router-link-active': routerProps && routerProps.isActive,
        'router-link-active-exact': this.exact && routerProps && routerProps.isExactActive
      }];
    },
    isActive(item) {
      return this.expandedKeys ? this.expandedKeys[item.key] : item === this.activeItem;
    },
    getSubmenuIcon(item) {
      const active = this.isActive(item);
      return ['p-panelmenu-icon pi pi-fw', {'pi-angle-right': !active, 'pi-angle-down': active}];
    },
    visible(item) {
      return (typeof item.visible === 'function' ? item.visible() : item.visible !== false);
    },
    disabled(item) {
      return (typeof item.disabled === 'function' ? item.disabled() : item.disabled);
    }
  }
}
</script>
