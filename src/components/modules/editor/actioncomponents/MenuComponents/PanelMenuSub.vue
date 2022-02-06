<template>
  <ul class="p-submenu-list" role="tree">
    <template v-for="(item, i) of model" :key="item.label + i.toString()">
      <li
        v-if="visible(item) && !item.separator"
        role="none"
        :class="getItemClass(item)"
        :style="item.style"
      >
        <template v-if="!template">
          <router-link
            v-if="item.to && !disabled(item)"
            v-slot="{ navigate, href, isActive, isExactActive }"
            :to="item.to"
            custom
          >
            <a
              role="treeitem"
              :aria-expanded="isActive(item)"
              :href="href"
              :class="linkClass(item, { isActive, isExactActive })"
              @click="onItemClick($event, item, navigate)"
            >
              <span :class="['p-menuitem-icon', item.icon]"></span>
              <span class="p-menuitem-text">{{ item.label }}</span>
            </a>
          </router-link>
          <a
            v-else
            :href="item.url"
            :class="linkClass(item)"
            :target="item.target"
            role="treeitem"
            :aria-expanded="isActive(item)"
            :tabindex="disabled(item) ? null : '0'"
          >
            <span v-if="item.items" :class="getSubmenuIcon(item)"></span>
            <span :class="['p-menuitem-icon', item.icon]"></span>
            <span class="p-menuitem-text">{{ item.label }}</span>
          </a>
        </template>
        <component :is="template" v-else :item="item"></component>
        <transition name="p-toggleable-content">
          <div v-show="isActive(item)" class="p-toggleable-content">
            <PanelMenuSub
              v-if="visible(item) && item.items"
              :key="item.label + '_sub_'"
              :model="item.items"
              :template="template"
              :expanded-keys="expandedKeys"
              :exact="exact"
              @item-toggle="$emit('item-toggle', $event)"
            />
          </div>
        </transition>
      </li>
      <li
        v-if="visible(item) && item.separator"
        :key="'separator' + i.toString()"
        :class="['p-menu-separator', item.class]"
        :style="item.style"
      ></li>
    </template>
  </ul>
</template>

<script>
export default {
  name: "PanelMenuSub",
  props: {
    model: {
      type: null,
      default: null,
    },
    template: {
      type: Object,
      default: null,
    },
    expandedKeys: {
      type: null,
      default: null,
    },
    exact: {
      type: Boolean,
      default: true,
    },
  },
  emits: ["item-toggle"],
  data() {
    return {
      activeItem: null,
    };
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
          item: item,
        });
      }

      if (this.activeItem && this.activeItem === item) this.activeItem = null;
      else this.activeItem = item;

      this.$emit("item-toggle", {
        item: item,
        expanded: this.activeItem != null,
      });

      if (item.to && navigate) {
        navigate(event);
      }
    },
    getItemClass(item) {
      return ["p-menuitem", item.className];
    },
    linkClass(item, routerProps) {
      return [
        "p-menuitem-link",
        {
          "p-disabled": this.disabled(item),
          "router-link-active": routerProps && routerProps.isActive,
          "router-link-active-exact":
            this.exact && routerProps && routerProps.isExactActive,
        },
      ];
    },
    isActive(item) {
      return this.expandedKeys
        ? this.expandedKeys[item.key]
        : item === this.activeItem;
    },
    getSubmenuIcon(item) {
      const active = this.isActive(item);
      return [
        "p-panelmenu-icon pi pi-fw",
        { "pi-angle-right": !active, "pi-angle-down": active },
      ];
    },
    visible(item) {
      return typeof item.visible === "function"
        ? item.visible()
        : item.visible !== false;
    },
    disabled(item) {
      return typeof item.disabled === "function"
        ? item.disabled()
        : item.disabled;
    },
  },
};
</script>
