<template>
  <div class="p-panelmenu p-component">
    <draggable
      :list="model"
      item-key="key"
      :disabled="false"
      @start="drag = true"
      @end="drag = false"
    >
      <template #item="{ element }">
        <div
          v-if="visible(element)"
          :class="getPanelClass(element)"
          :style="element.style"
        >
          <div :class="getHeaderClass(element)" :style="element.style">
            <template v-if="!$slots.element">
              <router-link
                v-if="element.to && !disabled(element)"
                v-slot="{ navigate, href, isActive, isExactActive }"
                :to="element.to"
                custom
              >
                <a
                  role="treeitem"
                  :href="href"
                  :class="
                    getHeaderLinkClass(element, { isActive, isExactActive })
                  "
                  @click="onItemClick($event, element, navigate)"
                >
                  <span
                    v-if="element.icon"
                    :class="getPanelIcon(element)"
                  ></span>
                  <span class="p-menuitem-text">{{ element.label }}</span>
                </a>
              </router-link>
              <a
                v-else
                :id="ariaId + '_header'"
                :href="element.url"
                :class="getHeaderLinkClass(element)"
                :tabindex="disabled(element) ? null : '0'"
                :aria-expanded="isActive(element)"
                :aria-controls="ariaId + '_content'"
                @click="onItemClick($event, element)"
              >
                <span
                  v-if="element.items"
                  :class="getPanelToggleIcon(element)"
                ></span>
                <span v-if="element.icon" :class="getPanelIcon(element)"></span>
                <span class="p-menuitem-text">{{ element.label }}</span>
              </a>
            </template>
            <component :is="$slots.element" v-else :item="element"></component>
          </div>
          <transition name="p-toggleable-content">
            <div
              v-show="isActive(element)"
              :id="ariaId + '_content'"
              class="p-toggleable-content"
              role="region"
              :aria-labelledby="ariaId + '_header'"
            >
              <div v-if="element.items" class="p-panelmenu-content">
                <PanelMenuSub
                  :model="element.items"
                  class="p-panelmenu-root-submenu"
                  :template="$slots.element"
                  :expanded-keys="expandedKeys"
                  :exact="exact"
                  @item-toggle="updateExpandedKeys"
                />
              </div>
            </div>
          </transition>
        </div>
      </template>
    </draggable>
  </div>
</template>

<script>
import PanelMenuSub from "./PanelMenuSub.vue";
import { UniqueComponentId } from "primevue/utils";
import draggable from "vuedraggable";

export default {
  name: "PanelMenu",
  components: {
    PanelMenuSub: PanelMenuSub,
    draggable,
  },
  props: {
    model: {
      type: Array,
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
  emits: ["update:expandedKeys"],
  data() {
    return {
      activeItem: null,
      drag: false,
      testing: [
        {
          label: "maurits",
          id: 0,
        },
        {
          label: "Emily",
          id: 1,
        },
      ],
    };
  },
  computed: {
    ariaId() {
      return UniqueComponentId();
    },
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

      this.updateExpandedKeys({
        item: item,
        expanded: this.activeItem != null,
      });

      if (item.to && navigate) {
        navigate(event);
      }
    },
    updateExpandedKeys(event) {
      if (this.expandedKeys) {
        const item = event.item;
        const _keys = { ...this.expandedKeys };

        if (event.expanded) _keys[item.key] = true;
        else delete _keys[item.key];

        this.$emit("update:expandedKeys", _keys);
      }
    },
    getPanelClass(item) {
      return ["p-panelmenu-panel", item.class];
    },
    getPanelToggleIcon(item) {
      const active = this.isActive(item);
      return [
        "p-panelmenu-icon pi",
        { "pi-chevron-right": !active, " pi-chevron-down": active },
      ];
    },
    getPanelIcon(item) {
      return ["p-menuitem-icon", item.icon];
    },
    getHeaderLinkClass(item, routerProps) {
      return [
        "p-panelmenu-header-link",
        {
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
    getHeaderClass(item) {
      return [
        "p-component p-panelmenu-header",
        {
          "p-highlight": this.isActive(item),
          "p-disabled": this.disabled(item),
        },
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

<style>
.p-panelmenu .p-panelmenu-header-link {
  display: flex;
  align-items: center;
  user-select: none;
  cursor: pointer;
  position: relative;
  text-decoration: none;
}

.p-panelmenu .p-panelmenu-header-link:focus {
  z-index: 1;
}

.p-panelmenu .p-submenu-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.p-panelmenu .p-menuitem-link {
  display: flex;
  align-items: center;
  user-select: none;
  cursor: pointer;
  text-decoration: none;
}

.p-panelmenu .p-menuitem-text {
  line-height: 1;
}
</style>
