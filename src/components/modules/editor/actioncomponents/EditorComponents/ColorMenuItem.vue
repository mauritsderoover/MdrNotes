<template>
  <div>
    <button
      class="menu-item"
      :class="{ 'is-active': isActive ? isActive() : null }"
      :style="{ color: color }"
      @click="action(color)"
      @contextmenu="handleContextMenu"
      :title="title"
    >
      <svg class="remix">
        <use :xlink:href="`${remixiconUrl}#ri-${icon}`" />
      </svg>
    </button>
    <overlay-panel ref="op" style="width: 10rem">
      <color-menu v-model="color" @close-overlay="closeOverlay" />
    </overlay-panel>
  </div>
</template>

<script lang="ts">
// eslint-disable-next-line
// @ts-ignore
import remixiconUrl from "remixicon/fonts/remixicon.symbol.svg";
import OverlayPanel from "primevue/overlaypanel";
import ColorMenu from "@/components/modules/editor/actioncomponents/EditorComponents/ColorPanel.vue";
import { defineComponent } from "vue";

export default defineComponent({
  components: {
    ColorMenu,
    OverlayPanel,
  },
  props: {
    icon: {
      type: String,
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    action: {
      type: Function,
      required: true,
    },

    isActive: {
      type: Function,
      default: null,
    },
  },
  data() {
    return {
      remixiconUrl,
      color: {
        type: String,
      },
    };
  },
  methods: {
    handleContextMenu(event: Event): void {
      event.preventDefault();
      (this.$refs.op as OverlayPanel).toggle(event);
    },
    closeOverlay(): void {
      (this.$refs.op as OverlayPanel).hide();
    },
  },
});
</script>

<style lang="scss">
.menu-item {
  width: 1.75rem;
  height: 1.75rem;
  border: none;
  background-color: transparent;
  border-radius: 0.4rem;
  padding: 0.25rem;
  margin-right: 0.25rem;

  svg {
    width: 100%;
    height: 100%;
    fill: currentColor;
  }

  &.is-active,
  &:hover {
    color: #fff;
    background-color: #0d0d0d;
  }
}
</style>
