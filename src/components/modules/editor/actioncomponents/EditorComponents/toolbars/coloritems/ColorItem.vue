<template>
  <div class="color-item" :style="{ 'background-color': color }"></div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "ColorItem",
  props: {
    color: {
      type: String,
      required: true,
    },
  },
  computed: {
    backGroundColor(): string {
      console.log("we got here", this.color);
      return `{background-color: ${this.color}}`;
    },
  },
});
</script>

<style scoped>
.color-item {
  width: 1.2rem;
  height: 1.2rem;
  /*background-color: #0d0d0d;*/
  border: #0d0d0d;
  border-radius: 0.4rem;
  padding: 0.25rem;
  margin-right: 0.25rem;
}
</style>
