<template>
  <div class="p-tabmenu p-component">
    <div ref="nav" class="p-tabmenu-nav p-reset" role="tablist">
      <template v-for="(item, index) of model">
        <div
          v-if="visible(item)"
          :class="getItemClass(item, index)"
          :style="item.style"
          :key="index"
        >
          <div :class="getItemClass(item, index)" :style="item.style">
            <template v-if="!$slots.item">
              <router-link
                v-if="item.to && !disabled(item)"
                v-slot="{ navigate, href, isActive, isExactActive }"
                :to="item.to"
                custom
              >
                <a
                  :href="href"
                  class="p-menuitem-link"
                  :class="getRouteItemClass(item, isActive, isExactActive)"
                  :style="item.style"
                  @click="catchClickEvent($event, item, index, navigate)"
                >
                  <span v-if="item.icon" :class="getItemIcon(item)"></span>
                  <span class="p-menuitem-text">{{ item.label }}</span>
                </a>
              </router-link>
              <a
                v-else
                :id="ariaId + '_header'"
                :href="item.url"
                :class="getItemClass(item, index)"
                :tabindex="disabled(item) ? null : '0'"
                :aria-expanded="isActive(element)"
                :aria-controls="ariaId + '_content'"
                class="p-menuitem-link"
                @click="catchClickEvent($event, item, index)"
              >
                <span v-if="item.icon" :class="getItemIcon(item)"></span>
                <span
                  v-if="!changeLabel || !isDoubleClickedItem(item)"
                  class="p-menuitem-text"
                  >{{ item.label }}</span
                >
                <form
                  v-if="changeLabel && isDoubleClickedItem(item)"
                  class="p-menuitem-text"
                  :name="item.key"
                  :ref="'form_' + item.key"
                >
                  <input
                    type="text"
                    class="p-menuitem-text"
                    :id="ariaId + '_input'"
                    v-model="item.label"
                    @keydown.enter="abortLabelChange"
                    :placeholder="item.label"
                    :ref="'input_' + item.key"
                  />
                </form>
              </a>
            </template>
            <component :is="$slots.item" v-else :item="item"></component>
          </div>
        </div>
      </template>
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
  methods: {
    abortLabelChange() {
      console.log("this is called in abortLabelChange");
      this.changeLabel = false;
      this.doubleClickedItem = null;
    },
    onClickOutside(event) {
      console.log("this is called in onclickoutside");
      console.log("The event target", event.target);
      console.log("the change label", this.changeLabel);
      console.log("this currentTarget", this.currentTarget);
      console.log("this is input item", this.inputitem);
      if (this.changeLabel) {
        if (this.currentTarget !== event.target) {
          if (this.inputitem !== event.target) {
            console.log("this is called in onclickoutside");
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
        this.onItemDoubleClick(event, item, index);
        this.clicks = 0;
      }
    },
    onItemDoubleClick(event, item, index) {
      console.log("this is run in item double click");
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
        console.log("this is refs", this.$refs);
        console.log(
          "this is input item in on item double click",
          this.inputitem
        );
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
      // console.log("this is in double clicked item to check objects");
      // console.log("this is item", item);
      // console.log("this double clicked item", this.doubleClickedItem);
      console.log(
        "The two objects are the same",
        compareObject(item, this.doubleClickedItem)
      );
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
