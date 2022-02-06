<template>
  <div>
    <div ref="editor" v-bind="value" style="height: 400px"></div>
  </div>
</template>

<script>
import { saveJsonFile } from "@/../../../../../../mdr-notes/src/components/genericcomponents/utils/utils";

export default {
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
        toolbar: this.$refs.toolbar1.$refs.toolbar,
        // toolbar: [
        //   ["bold", "italic", "underline", "strike"], // toggled buttons
        //   ["blockquote", "code-block"],
        //
        //   [{ header: 1 }, { header: 2 }], // custom button values
        //   [{ list: "ordered" }, { list: "bullet" }],
        //   [{ script: "sub" }, { script: "super" }], // superscript/subscript
        //   [{ indent: "-1" }, { indent: "+1" }], // outdent/indent
        //   [{ direction: "rtl" }], // text direction
        //
        //   [{ size: ["small", false, "large", "huge"] }], // custom dropdown
        //   [{ header: [1, 2, 3, 4, 5, 6, false] }],
        //
        //   [{ color: [] }, { background: [] }], // dropdown with defaults from theme
        //   [{ font: [] }],
        //   [{ align: [] }],
        //
        //   ["clean"], // remove formatting button
        // ],
      },
    });
    this.editor.root.innerHTML = this.value;
    this.getNotes();
    this.editor.on("text-change", () => {
      console.log(JSON.stringify(this.editor.getContents()));
    });
  },
  methods: {},
};
</script>

<style scoped>
@import "https://cdn.quilljs.com/1.3.6/quill.snow.css";
</style>
