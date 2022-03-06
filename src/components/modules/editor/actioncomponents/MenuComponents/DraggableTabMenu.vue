<template>
  <div class="p-tabmenu p-component">
    <div ref="nav" class="p-tabmenu-nav p-reset" role="tablist">
      <ContextMenu ref="menu" :model="items" />
      <draggable
        :list="model"
        item-key="key-panel"
        :disabled="false"
        :group="{ name: 'g2' }"
        direction="vertical"
        class="p-tabmenu-nav"
        @start="drag = true"
        @end="processDragEnd"
      >
        <template #item="{ element, index }">
          <div
            v-if="visible(element)"
            :key="index"
            :class="getItemClass(element, index)"
            :style="element.style"
          >
            <div :class="getItemClass(element, index)" :style="element.style">
              <template v-if="!$slots.element">
                <router-link
                  v-if="element.to && !disabled(element)"
                  v-slot="{ navigate, href, isActive, isExactActive }"
                  :to="element.to"
                  custom
                >
                  <a
                    :href="href"
                    class="p-menuitem-link"
                    :class="getRouteItemClass(element, isActive, isExactActive)"
                    :style="element.style"
                    @click="catchClickEvent($event, element, index, navigate)"
                  >
                    <span
                      v-if="element.icon"
                      :class="getItemIcon(element)"
                    ></span>
                    <span class="p-menuitem-text">{{ element.label }}</span>
                  </a>
                </router-link>
                <a
                  v-else
                  :id="ariaId + '_header'"
                  :href="element.url"
                  :class="getItemClass(element, index)"
                  :tabindex="disabled(element) ? null : '0'"
                  :aria-expanded="isActive(element)"
                  :aria-controls="ariaId + '_content'"
                  class="p-menuitem-link"
                  @click="catchClickEvent($event, element, index)"
                  @contextmenu="onImageRightClick($event, element)"
                >
                  <span
                    v-if="element.icon"
                    :class="getItemIcon(element)"
                  ></span>
                  <span
                    v-if="!changeLabel || !isDoubleClickedItem(element)"
                    class="p-menuitem-text"
                    >{{ element.label }}</span
                  >
                  <form
                    v-if="changeLabel && isDoubleClickedItem(element)"
                    :ref="'form_' + element.key"
                    class="p-menuitem-text"
                    :name="element.key"
                  >
                    <input
                      :id="ariaId + '_input'"
                      :ref="'input_' + element.key"
                      v-model="element.label"
                      type="text"
                      class="p-menuitem-text"
                      :placeholder="element.label"
                      @keydown.enter="abortLabelChange"
                    />
                  </form>
                </a>
              </template>
              <component
                :is="$slots.element"
                v-else
                :item="element"
              ></component>
            </div>
          </div>
        </template>
      </draggable>
      <div class="p-tabmenuitem">
        <a
          :id="ariaId + '_header'"
          class="p-menuitem-link p-tabmenuitem"
          :aria-controls="ariaId + '_content'"
          @click="addTab"
        >
          <span class="p-tabmenu-nav p-menuitem-icon pi pi-plus-circle"></span>
        </a>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { UniqueComponentId } from "primevue/utils";
import draggable from "vuedraggable";
import ContextMenu from "primevue/contextmenu";
import { compareObject } from "../../../../genericcomponents/utils/utils";
import {
  DraggableTabMenu,
  BaseItem,
} from "@/components/modules/editor/editor-interfaces";

export default defineComponent({
  name: "DraggableTabMenu",
  components: {
    draggable,
    ContextMenu,
  },
  props: {
    model: {
      type: Array as PropType<Array<BaseItem>>,
      default: null,
    },
    exact: {
      type: Boolean,
      default: true,
    },
    activeIndex: {
      type: Number,
      default: 0,
    },
    newTab: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  emits: [
    "update:activeIndex",
    "tab-change",
    "add-tab",
    "label-changed",
    "drag-ended",
    "delete-item",
  ],
  data(): DraggableTabMenu {
    return {
      d_activeIndex: this.activeIndex,
      doubleClickActiveIndex: undefined,
      activeItem: undefined,
      drag: false,
      delay: 160,
      clicks: 0,
      timer: undefined,
      changeLabel: false,
      currentTarget: null,
      inputItem: undefined,
      doubleClickedItem: undefined,
      rightClickedItem: undefined,
      items: [
        {
          label: "Add page",
          icon: "pi pi-fw pi-home",
        },
        {
          label: "Delete page",
          icon: "pi pi-fw pi-home",
          command: (event) => {
            console.log("this is event in delete page", event);
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
      if (this.newTab) {
        this.changeLabel = false;
        this.activeItem = undefined;
        this.doubleClickedItem = undefined;
        if (this.model.length > 1) {
          this.changeLabel = true;
          if (this.model) {
            this.activeItem = this.model[this.model.length - 1];
          }
          this.doubleClickedItem = this.activeItem;

          setTimeout(() => {
            if (this.activeItem) {
              this.inputItem = this.$refs[
                `input_${this.activeItem.key}`
              ] as HTMLInputElement;
              // (
              //   this.$refs[`input_${this.activeItem.key}`] as HTMLDivElement
              // ).focus();
            }
          }, 0);
        }
      }
    },
  },
  mounted() {
    if (this.model) {
      this.activeItem = this.model[0];
    }
    document.addEventListener("click", this.onClickOutside);
  },
  beforeUnmount() {
    document.removeEventListener("click", this.onClickOutside);
  },
  methods: {
    deleteAction(): void {
      console.log("this is rightClickedItem", this.rightClickedItem);
      this.$emit("delete-item", this.rightClickedItem);
    },
    onImageRightClick(event: any, element: any) {
      console.log("the function onImageRightClick has been executed");
      (this.$refs.menu as ContextMenu).show(event);
      this.rightClickedItem = element;
    },
    abortLabelChange() {
      this.$emit("label-changed", {
        activeIndex: this.doubleClickActiveIndex,
        doubleClickedItem: this.doubleClickedItem,
      });
      this.doubleClickActiveIndex = undefined;
      this.changeLabel = false;
      this.doubleClickedItem = undefined;
    },
    onClickOutside(event: any) {
      if (this.changeLabel) {
        if (this.currentTarget !== event.target) {
          if (this.inputItem !== event.target) {
            this.abortLabelChange();
          }
        }
      }
    },
    catchClickEvent(
      event: PointerEvent,
      item: BaseItem,
      index: number,
      navigate?: string
    ) {
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
        this.inputItem = this.$refs[`input_${item.key}`] as HTMLInputElement;
        (this.$refs[`input_${item.key}`] as HTMLDivElement).focus();
      }, 0);
    },
    onItemClick(
      event: PointerEvent,
      item: BaseItem,
      index: number,
      navigate: any
    ) {
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

      if (item.to && navigate) {
        navigate(event);
      }

      if (this.activeItem && this.activeItem === item)
        this.activeItem = undefined;
      else this.activeItem = item;

      this.$emit("tab-change", {
        originalEvent: event,
        index: index,
      });
    },
    addTab() {
      this.$emit("add-tab");
    },
    testFunction(event: any) {
      console.log("the testFunction has been reached", event);
    },
    processDragEnd(): void {
      this.drag = false;
      this.$emit("drag-ended");
    },
    isDoubleClickedItem(item: any) {
      return compareObject(item, this.doubleClickedItem);
    },
    getItemClass(item: any) {
      return [
        "p-tabmenuitem",
        item.class,
        {
          "p-highlight": this.isActive(item),
          "p-disabled": this.disabled(item),
        },
      ];
    },
    getRouteItemClass(item: any, isActive: boolean, isExactActive: string) {
      return [
        "p-tabmenuitem",
        item.class,
        {
          "p-highlight": this.exact ? isExactActive : isActive,
          "p-disabled": this.disabled(item),
        },
      ];
    },
    getItemIcon(item: any) {
      return ["p-menuitem-icon", item.icon];
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
    isActive(item: any) {
      return this.activeItem === item;
    },
  },
});
</script>

<style>
.p-tabmenu {
  overflow-x: auto;
}

.p-tabmenu-nav {
  display: flex;
  margin: 0;
  padding: 0;
  list-style-type: none;
  flex-wrap: nowrap;
}

.p-tabmenu-nav a {
  cursor: pointer;
  user-select: none;
  display: flex;
  align-items: center;
  position: relative;
  text-decoration: none;
  text-decoration: none;
  overflow: hidden;
}

.p-tabmenu-nav a:focus {
  z-index: 1;
}

.p-tabmenu-nav .p-menuitem-text {
  line-height: 1;
}

.p-tabmenu-ink-bar {
  display: none;
  z-index: 1;
}
</style>
