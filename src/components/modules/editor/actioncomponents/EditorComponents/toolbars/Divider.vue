<template>
  <div
    class="divider"

    :key="`divider${index}`"
  />
</template>

<script>
export default {
  name: "DividerBar",
};
</script>

<style scoped lang="scss">
.divider {
  width: 2px;
  height: 1.25rem;
  background-color: rgba(#000, 0.1);
  margin-left: 0.5rem;
  margin-right: 0.75rem;
  margin-top: 0.25rem;
}
</style>
