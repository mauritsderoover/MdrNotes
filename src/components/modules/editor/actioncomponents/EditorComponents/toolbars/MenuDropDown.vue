<template>
  <dropdown
    v-model="selectedValue"
    id="menu-dropdown"
    :options="options"
    option-label="label"
    option-value="value"
    class="p-dropdown"
    @change="action(selectedValue)"
  />
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import Dropdown from "primevue/dropdown";
import { Editor } from "@tiptap/vue-3";

export default defineComponent({
  name: "MenuDropDown",
  components: {
    Dropdown,
  },
  props: {
    modelValue: {
      type: String,
      required: true,
    },
    options: {
      type: Object as PropType<
        Array<{ value: string | number; label: string }>
      >,
      required: true,
    },
    action: {
      type: Function,
      required: true,
    },
  },
  emits: ["update:modelValue"],
  data() {
    return {
      selectedValue: this.options[0].value,
    };
  },
});
</script>

<style lang="scss">
#menu-dropdown.p-dropdown {
  height: 1.75rem;
  width: 6.5rem;
  //padding: 0.25rem;
  margin-right: 0.25rem;
  text-align: left;
}

#menu-dropdown.p-dropdown .p-inputtext {
  font-size: 0.75rem;
  padding: 0.3rem 0.2rem;
}
</style>
