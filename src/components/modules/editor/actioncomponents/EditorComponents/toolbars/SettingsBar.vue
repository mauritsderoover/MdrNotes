<template>
  <div>
    <div class="grid mt-2 ml-0">
      <template v-for="(item, index) in items" :key="index">
        <divider-bar v-if="item.type === 'divider'" />
        <menu-item v-else-if="item.type === 'symbol'" v-bind="item" />
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import MenuItem from "@/components/modules/editor/actioncomponents/EditorComponents/toolbars/MenuItem.vue";
import DividerBar from "@/components/modules/editor/actioncomponents/EditorComponents/toolbars/Divider.vue";

export default defineComponent({
  name: "SettingsBar",
  components: {
    MenuItem,
    DividerBar,
  },
  data() {
    return {
      items: [
        {
          icon: "logout-box-r-line",
          title: "Sign out",
          type: "symbol",
          action: () => this.$router.push("/logout"),
        },
      ],
    };
  },
});
</script>

<style scoped></style>
