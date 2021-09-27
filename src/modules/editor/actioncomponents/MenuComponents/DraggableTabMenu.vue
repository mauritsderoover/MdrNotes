<template>
  <div class="p-tabmenu p-component">
    <div ref="nav" class="p-tabmenu-nav p-reset" role="tablist">
      <draggable
        :list="model"
        item-key="key-panel"
        :disabled="false"
        :group="{ name: 'g2' }"
        direction="vertical"
        class="p-tabmenu-nav"
        @start="drag = true"
        @end="drag = false"
      >
        <template #item="{ element, index }">
          <div
            v-if="visible(element)"
            :class="getItemClass(element, index)"
            :style="element.style"
            :key="index"
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
              <component
                :is="$slots.element"
                v-else
                :item="element"
              ></component>
            </div>
          </div>
        </template>
      </draggable>
    </div>
  </div>
</template>

<script>
import { UniqueComponentId } from "primevue/utils";
import draggable from "vuedraggable";
import { compareObject } from "@/genericcomponents/utils";

export default {
  name: "DraggableTabMenu",
  components: {
    draggable,
  },
  props: {
    model: {
      type: Array,
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
  },
  emits: ["update:activeIndex", "tab-change"],
  data() {
    return {
      d_activeIndex: this.activeIndex,
      activeItem: null,
      draggable: false,
      delay: 160,
      clicks: 0,
      timer: null,
      changeLabel: false,
      currentTarget: null,
      inputitem: null,
      doubleClickedItem: null,
    };
  },
  mounted() {
    document.addEventListener("click", this.onClickOutside);
  },
  beforeUnmount() {
    document.removeEventListener("click", this.onClickOutside);
  },
  computed: {
    ariaId() {
      return UniqueComponentId();
    },
  },
  watch: {
    "model.length"() {
      this.changeLabel = true;
      this.activeItem = this.model[this.model.length - 2];
      this.doubleClickedItem = this.activeItem;
      setTimeout(() => {
        this.inputElement = this.$refs[`input_${this.activeItem.key}`];
        this.$refs[`input_${this.activeItem.key}`].focus();
      }, 0);
    },
  },
  methods: {
    abortLabelChange() {
      this.changeLabel = false;
      this.doubleClickedItem = null;
    },
    onClickOutside(event) {
      if (this.changeLabel) {
        if (this.currentTarget !== event.target) {
          if (this.inputitem !== event.target) {
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
        this.inputitem = this.$refs[`input_${item.key}`];
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

      if (item.to && navigate) {
        navigate(event);
      }

      if (this.activeItem && this.activeItem === item) this.activeItem = null;
      else this.activeItem = item;

      this.$emit("tab-change", {
        originalEvent: event,
        index: index,
      });
    },
    isDoubleClickedItem(item) {
      return compareObject(item, this.doubleClickedItem);
    },
    getItemClass(item) {
      return [
        "p-tabmenuitem",
        item.class,
        {
          "p-highlight": this.isActive(item),
          "p-disabled": this.disabled(item),
        },
      ];
    },
    getRouteItemClass(item, isActive, isExactActive) {
      return [
        "p-tabmenuitem",
        item.class,
        {
          "p-highlight": this.exact ? isExactActive : isActive,
          "p-disabled": this.disabled(item),
        },
      ];
    },
    getItemIcon(item) {
      return ["p-menuitem-icon", item.icon];
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
    isActive(item) {
      return this.activeItem === item;
    },
  },
};
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
