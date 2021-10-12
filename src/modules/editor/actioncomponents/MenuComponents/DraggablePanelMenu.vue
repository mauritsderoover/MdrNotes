<template>
  <div class="p-panelmenu p-component" ref="elements">
    <ContextMenu ref="menu" :model="items" />
    <draggable
      :list="model"
      item-key="key-panel"
      :disabled="false"
      :group="{ name: 'g1' }"
      @start="drag = true"
      @end="drag = false"
    >
      <template #item="{ element, index }">
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
                  @click="catchClickEvent($event, element, index, navigate)"
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
                @click="catchClickEvent($event, element, index)"
                @contextmenu="onImageRightClick($event, element)"
              >
                <span
                  v-if="element.items"
                  :class="getPanelToggleIcon(element)"
                ></span>
                <span v-if="element.icon" :class="getPanelIcon(element)"></span>
                <span
                  v-if="!changeLabel || !isDoubleClickedItem(element)"
                  class="p-menuitem-text"
                  >{{ element.label }}</span
                >
                <form
                  v-if="changeLabel && isDoubleClickedItem(element)"
                  class="p-menuitem-text"
                  :name="element.key"
                  :ref="'form_' + element.key"
                >
                  <input
                    type="text"
                    class="p-menuitem-text"
                    :id="ariaId + '_input'"
                    v-model="element.label"
                    @keydown.enter="abortLabelChange"
                    :placeholder="element.label"
                    :ref="'input_' + element.key"
                  />
                </form>
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
                <DraggablePanelMenu
                  :model="element.items"
                  class="p-panelmenu-root-submenu"
                  layer="sublayer"
                  :template="$slots.element"
                  :expanded-keys="expandedKeys"
                  :exact="exact"
                  :submenu="true"
                  @update:expandedKeys="updateExpandedKeys"
                  @tab-change="changeMenuItem"
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
import { UniqueComponentId } from "primevue/utils";
import draggable from "vuedraggable";
import { compareObject } from "@/genericcomponents/utils";
import ContextMenu from "primevue/contextmenu";

export default {
  name: "DraggablePanelMenu",
  components: {
    draggable,
    ContextMenu,
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
    submenu: {
      type: Boolean,
      default: false,
    },
    activeIndex: {
      type: Number,
      default: 0,
    },
    layer: {
      type: String,
    },
  },
  emits: ["update:expandedKeys", "update:activeIndex", "tab-change"],
  mounted() {
    document.addEventListener("click", this.onClickOutside);
  },
  beforeUnmount() {
    document.removeEventListener("click", this.onClickOutside);
  },
  data() {
    return {
      activeItem: null,
      doubleClickedItem: null,
      rightClickedItem: null,
      drag: false,
      delay: 160,
      clicks: 0,
      timer: null,
      changeLabel: false,
      currentTarget: null,
      inputElement: null,
      items: [
        {
          label: "Add page",
          icon: "pi pi-fw pi-home",
        },
        {
          label: "Delete page",
          icon: "pi pi-fw pi-home",
          command: (event) => {
            this.deleteItem();
          },
        },
        {
          label: "Add subpage",
          icon: "pi pi-fw pi-calendar",
        },
      ],
    };
  },
  computed: {
    ariaId() {
      return UniqueComponentId();
    },
  },
  watch: {
    "model.length"() {
      if (this.model.length > 0) {
        this.changeLabel = true;
        this.activeItem = this.model[this.model.length - 2];
        this.doubleClickedItem = this.activeItem;
        setTimeout(() => {
          this.inputElement = this.$refs[`input_${this.activeItem.key}`];
          this.$refs[`input_${this.activeItem.key}`].focus();
        }, 0);
      }
    },
  },
  methods: {
    changeMenuItem(event) {
      this.$emit("tab-change", event);
    },
    abortLabelChange() {
      this.changeLabel = false;
      this.doubleClickedItem = null;
    },
    onClickOutside(event) {
      if (this.changeLabel) {
        if (this.currentTarget !== event.target) {
          if (this.inputElement !== event.target) {
            this.abortLabelChange();
          }
        }
      }
    },
    catchClickEvent(event, item, index, navigate) {
      this.clicks++;
      if (this.clicks === 1) {
        this.timer = setTimeout(() => {
          this.onItemClick(event, item, index, navigate);
          this.clicks = 0;
        }, this.delay);
      } else {
        clearTimeout(this.timer);
        this.onItemDoubleClick(event, item);
        this.clicks = 0;
      }
    },
    onItemDoubleClick(event, item) {
      if (this.isActive(item) && this.activeItem === null) {
        this.activeItem = item;
      }
      this.doubleClickedItem = item;
      this.currentTarget = event.target;
      if (this.disabled(item)) {
        event.preventDefault();
      }
      this.changeLabel = true;

      setTimeout(() => {
        this.inputElement = this.$refs[`input_${item.key}`];
        this.$refs[`input_${item.key}`].focus();
      }, 0);
    },
    onItemClick(event, item, index, navigate) {
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

      this.changeMenuItem({
        originalEvent: event,
        index: index,
        item: item,
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
      if (this.submenu) {
        return ["p-menuitem", item.className];
      } else {
        return ["p-panelmenu-panel", item.class];
      }
    },
    getPanelToggleIcon(item) {
      const active = this.isActive(item);
      if (this.submenu) {
        return [
          "p-panelmenu-icon pi pi-fw",
          { "pi-angle-right": !active, "pi-angle-down": active },
        ];
      } else {
        return [
          "p-panelmenu-icon pi",
          { "pi-chevron-right": !active, " pi-chevron-down": active },
        ];
      }
    },
    getPanelIcon(item) {
      return ["p-menuitem-icon", item.icon];
    },
    getHeaderLinkClass(item, routerProps) {
      const classString = this.submenu
        ? "p-menuitem-link"
        : "p-panelmenu-header-link";
      return [
        classString,
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
    isDoubleClickedItem(item) {
      return compareObject(item, this.doubleClickedItem);
    },
    getHeaderClass(item) {
      if (this.submenu) {
        return ["p-menuitem", item.className];
      } else {
        return [
          "p-component p-panelmenu-header",
          {
            "p-highlight": this.isActive(item),
            "p-disabled": this.disabled(item),
          },
        ];
      }
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
    onImageRightClick(event, element) {
      this.$refs.menu.show(event);
      this.rightClickedItem = element;
    },
    deleteItem() {
      const index = this.model.indexOf(this.rightClickedItem);
      if (index > -1) {
        const modelTemp = this.model;
        if (modelTemp[index].items) {
          if (modelTemp[index].items.length > 0) {
            const subItems = modelTemp[index].items;
            for (const subItem in subItems) {
              modelTemp.splice(modelTemp.length - 1, 0, subItems[subItem]);
            }
          }
        }
        this.$emit("update:model", modelTemp.splice(index, 1));
      }
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
