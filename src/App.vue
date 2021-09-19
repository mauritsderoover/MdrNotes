<template>
  <router-view></router-view>
  <Toolbar>
    <template #left>
      <Button label="Editor" icon="pi pi-check" class="p-button-help p-mr-2" @click="setComponent('EditorDashboard')"/>
      <Button label="Hello World" icon="pi pi-check" class="p-button-help" @click="setComponent('HelloWorld')"/>
    </template>
  </Toolbar>
  <EditorDashboard v-if="show" />
  <HelloWorld v-if="!show" />

  <!-- <component :is="currentTab"></component> -->
</template>

<script>
import HelloWorld from './modules/HelloWorld.vue';
import EditorDashboard from "@/modules/editor/EditorDashboard";
import Button from "primevue/button";
import Toolbar from "primevue/toolbar";

export default {
  name: 'App',
  components: {
    HelloWorld,
    Button,
    Toolbar,
    EditorDashboard,
  },
  data() {
    return {
      currentTab: "EditorDashboard",
      show: true
    }
  },
  methods: {
    setComponent(tab) {
      console.log("this is executed");
      this.currentTab = tab;
      this.show = !this.show;
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
