<template>
  <div>
    <div ref="editor" v-bind="value"></div>
    <br />
    <Button label="Save" @click="saveContents" />
  </div>
</template>

<script>
import Quill from "quill";
import Button from "primevue/button";
import { saveJsonFile } from "@/genericcomponents/utils";

export default {
  components: {
    Button,
  },
  props: {
    value: {
      type: String,
      default: "",
    },
    identifier: {
      type: String,
    },
  },
  data() {
    return {
      editor: null,
    };
  },
  beforeMount() {
    console.log(this.$refs.editor);
  },
  mounted() {
    this.editor = new Quill(this.$refs.editor, {
      theme: "snow",
      modules: {
        toolbar: [
          [{ header: [1, 2, false] }],
          ["bold", "italic", "underline"],
          ["image", "code-block"],
        ],
      },
    });
    this.editor.root.innerHTML = this.value;
    this.getNotes();
    this.editor.on("text-change", () => {
      console.log(JSON.stringify(this.editor.getContents()));
    });
  },
  methods: {
    saveContents() {
      saveJsonFile(
        JSON.stringify(this.editor.getContents()),
        `${this.identifier}.json`
      );
    },
    getNotes() {
      const axios = require("axios");
      axios.get("/notes.json").then((response) => {
        console.log(response);
        this.editor.setContents(response.data);
      });
    },
  },
};
</script>

<style scoped>
@import "https://cdn.quilljs.com/1.3.6/quill.snow.css";
</style>
