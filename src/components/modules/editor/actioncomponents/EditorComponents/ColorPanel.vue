<template>
  <div class="grid nested-grid">
    <div class="col-12">
      <div class="grid">
        <template v-for="color in colors" :key="color.value">
          <div class="col-3">
            <color-item
              :color="color.value"
              @click="testFunction(color.value)"
            />
          </div>
        </template>
      </div>
    </div>
    <div class="col-12">
      <label for="color-input">Custom: </label>
      <input
        type="color"
        id="color-input"
        @input="testFunction($event.target.value)"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import ColorItem from "@/components/modules/editor/actioncomponents/EditorComponents/ColorItem.vue";

export default defineComponent({
  name: "ColorMenu",
  components: { ColorItem },
  props: {
    modelValue: {
      type: String,
      required: true,
    },
  },
  emits: ["update:modelValue", "closeOverlay"],
  data() {
    return {
      outsideClickListener: null,
      colors: [
        {
          value: "#0d0d0d",
          label: "Black",
        },
        { value: "#958DF1", label: "Purple" },
        { value: "#F98181", label: "Red" },
        { value: "#FBBC88", label: "Orange" },
        { value: "#FAF594", label: "Yellow" },
        { value: "#70CFF8", label: "Blue" },
        { value: "#94FADB", label: "Teal" },
        { value: "#B9F18D", label: "Green" },
      ],
    };
  },
  mounted() {
    // this.bindOutsideClickListener();
  },
  beforeUnmount() {
    // this.unbindOutsideClickListener();
  },
  methods: {
    testFunction(event: string): void {
      console.log("this has been clicked", event);
      this.$emit("update:modelValue", event);
      this.$emit("closeOverlay");
    },
    // bindOutsideClickListener() {
    //   if (!this.outsideClickListener) {
    //     this.outsideClickListener = (event) => {
    //       if (
    //         this.visible &&
    //         this.container &&
    //         !this.container.contains(event.target) &&
    //         !event.ctrlKey
    //       ) {
    //         this.hide();
    //       }
    //     };
    //     document.addEventListener("click", this.outsideClickListener);
    //   }
    // },
    // unbindOutsideClickListener() {
    //   if (this.outsideClickListener) {
    //     document.removeEventListener("click", this.outsideClickListener);
    //     this.outsideClickListener = null;
    //   }
    // },
  },
});
</script>

<style scoped></style>
