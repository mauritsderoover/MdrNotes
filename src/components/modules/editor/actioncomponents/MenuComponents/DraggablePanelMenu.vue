<template>
  <div ref="elements" class="p-panelmenu p-component">
    <ContextMenu ref="menu" :model="items" />
    <draggable
      :list="model"
      item-key="key-panel"
      :disabled="false"
      :group="{ name: 'g1' }"
      @start="drag = true"
      @end="processDragEnd"
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
                @contextmenu="onImageRightClick($event, element, index)"
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
                  :ref="'form_' + encodeURI(element.key)"
                  class="p-menuitem-text"
                  :name="encodeURI(element.key)"
                >
                  <input
                    :id="ariaId + '_input'"
                    :ref="'input_' + encodeURI(element.key)"
                    v-model="element.label"
                    type="text"
                    class="p-menuitem-text"
                    :placeholder="element.label"
                    @keydown.enter="abortLabelChange"
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
                  @add-menu-element="addPage"
                />
              </div>
            </div>
          </transition>
        </div>
      </template>
    </draggable>
    <div class="p-panelmenu-panel">
      <div class="p-component p-panelmenu-header">
        <a class="p-menuitem-link p-menuitem" @click="addPage">
          <span class="p-menuitem-icon pi pi-plus-circle"></span>
          <span class="p-menuitem-text">Add a page</span>
        </a>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { UniqueComponentId } from "primevue/utils";
import draggable from "vuedraggable";
import { compareObject } from "../../../../genericcomponents/utils/utils";
import ContextMenu from "primevue/contextmenu";
import {
  DraggablePanelMenu,
  BaseItem,
} from "@/components/modules/editor/editor-interfaces";
import { PageItem } from "@/components/modules/editor/editor-classes";

export default defineComponent({
  name: "DraggablePanelMenu",
  components: {
    draggable,
    ContextMenu,
  },
  props: {
    model: {
      type: Array as PropType<Array<PageItem>>,
      default: null,
    },
    sectionIdentifier: {
      type: String,
      required: true,
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
  emits: [
    "update:model",
    "update:expandedKeys",
    "update:activeIndex",
    "tab-change",
    "add-menu-element",
    "label-changed",
    "dragEnded",
    "delete-item",
  ],
  data(): DraggablePanelMenu {
    return {
      oldSection: undefined,
      activeItem: undefined,
      doubleClickActiveIndex: undefined,
      doubleClickedItem: undefined,
      rightClickedItem: undefined,
      rightClickedIndex: undefined,
      drag: false,
      delay: 160,
      clicks: 0,
      timer: undefined,
      changeLabel: false,
      currentTarget: null,
      inputElement: undefined,
      items: [
        {
          label: "Add page",
          icon: "pi pi-fw pi-home",
        },
        {
          label: "Delete page",
          icon: "pi pi-fw pi-home",
          command: () => {
            this.deleteAction();
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
      if (this.oldSection && this.oldSection === this.sectionIdentifier) {
        this.changeLabel = false; // is this necessary?
        this.activeItem = undefined; // is this necessary?
        this.doubleClickedItem = undefined; // is this necessary?
        if (this.model.length > 1) {
          this.changeLabel = true;
          this.activeItem = this.model[this.model.length - 1];
          this.doubleClickedItem = this.activeItem;
          setTimeout(() => {
            if (this.activeItem) {
              const input_identifier = encodeURI(
                `input_${this.activeItem.key}`
              );
              this.inputElement = this.$refs[
                input_identifier
              ] as HTMLInputElement;
              // (this.$refs[input_identifier] as HTMLDivElement).focus();
            }
          }, 0);
        }
      } else this.oldSection = this.sectionIdentifier;
    },
  },
  mounted() {
    document.addEventListener("click", this.onClickOutside);
  },
  beforeUnmount() {
    document.removeEventListener("click", this.onClickOutside);
  },
  methods: {
    deleteAction(): void {
      this.$emit("delete-item", this.rightClickedItem);
    },
    changeMenuItem(event: any) {
      this.$emit("tab-change", event);
    },
    abortLabelChange() {
      this.$emit("label-changed", {
        activeIndex: this.doubleClickActiveIndex,
        doubleClickedItem: this.doubleClickedItem,
      });
      this.doubleClickActiveIndex = undefined;
      this.changeLabel = false;
      this.doubleClickedItem = undefined;
      this.inputElement = undefined;
    },
    onClickOutside(event: any) {
      if (this.changeLabel) {
        if (this.currentTarget !== event.target) {
          if (this.inputElement !== event.target) {
            this.abortLabelChange();
          }
        }
      }
    },
    catchClickEvent(event: any, item: any, index: number, navigate: any) {
      this.clicks++;
      if (this.clicks === 1) {
        this.timer = setTimeout(() => {
          this.onItemClick(event, item, index, navigate);
          this.clicks = 0;
        }, this.delay);
      } else {
        clearTimeout(this.timer as unknown as number);
        this.onItemDoubleClick(event, item, index);
        this.clicks = 0;
      }
    },
    onItemDoubleClick(event: PointerEvent, item: any, index: number) {
      if (this.isActive(item) && this.activeItem === undefined) {
        this.activeItem = item;
      }
      this.doubleClickActiveIndex = index;
      this.doubleClickedItem = item;
      this.currentTarget = event.target;
      if (this.disabled(item)) {
        event.preventDefault();
      }
      this.changeLabel = true;

      setTimeout(() => {
        this.inputElement = this.$refs[`input_${item.key}`] as HTMLInputElement;
        (this.$refs[`input_${item.key}`] as HTMLDivElement).focus();
      }, 0);
    },
    onItemClick(event: PointerEvent, item: any, index: number, navigate: any) {
      if (this.isActive(item) && this.activeItem === undefined) {
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

      if (this.activeItem && this.activeItem === item)
        this.activeItem = undefined;
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

    addPage() {
      this.$emit("add-menu-element");
    },
    updateExpandedKeys(event: any) {
      if (this.expandedKeys) {
        const item = event.item;
        const _keys = { ...this.expandedKeys };

        if (event.expanded) _keys[item.key] = true;
        else delete _keys[item.key];

        this.$emit("update:expandedKeys", _keys);
      }
    },
    getPanelClass(item: any) {
      if (this.submenu) {
        return ["p-menuitem", item.className];
      } else {
        return ["p-panelmenu-panel", item.class];
      }
    },
    getPanelToggleIcon(item: any) {
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
    getPanelIcon(item: any) {
      return ["p-menuitem-icon", item.icon];
    },
    getHeaderLinkClass(item: any, routerProps: any) {
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
    isActive(item: any) {
      return this.expandedKeys
        ? this.expandedKeys[item.key]
        : item === this.activeItem;
    },
    isDoubleClickedItem(item: any) {
      return compareObject(item, this.doubleClickedItem);
    },
    processDragEnd(): void {
      this.drag = false;
      this.$emit("dragEnded");
    },
    getHeaderClass(item: any) {
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
    visible(item: any) {
      return typeof item.visible === "function"
        ? item.visible()
        : item.visible !== false;
    },
    disabled(item: any) {
      return typeof item.disabled === "function"
        ? item.disabled()
        : item.disabled;
    },
    onImageRightClick(event: any, element: PageItem, index: number) {
      (this.$refs.menu as ContextMenu).show(event);
      this.rightClickedItem = element;
      this.rightClickedIndex = index;
    },
    deleteItem() {
      let index = -1;
      if (this.rightClickedItem) {
        index = this.model.indexOf(this.rightClickedItem as any);
      }

      if (index > -1) {
        const modelTemp = this.model as any;
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
});
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
