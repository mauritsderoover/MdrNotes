<template>
  <Button label="Test" @click="testerFunction" />
  <Button label="Load Data" @click="loadData" />
  <Button label="Delete Stuff" @click="deleteStuff" />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Button from "primevue/button";
import { makeId } from "@/components/modules/editor/DataModel";
import db from "@/components/modules/editor/MdrNotesDatabase";
import { Notebook } from "@/components/modules/editor/classes/notebook";
import { deleteContainerContents } from "@/components/genericcomponents/utils/utils";

export default defineComponent({
  name: "TestingVue",
  components: {
    Button,
  },
  methods: {
    deleteStuff(): void {
      deleteContainerContents(
        "https://mauritsderoovertest2.solidcommunity.net/notes/"
      );
    },
    async testerFunction(): Promise<void> {
      const key = makeId();
      const label = "tester";
      const notebook = new Notebook(key, label);
      const notebook1 = new Notebook(key, label);
      await notebook.saveToDatabase();
      await notebook1.saveToDatabase();

      const section = notebook.createSection();
      await notebook.saveToDatabase();
      const page = section.createPage();
      await section.saveToDatabase();
      const note = page.createNote();
      await page.saveToDatabase();
    },
    async loadData(): Promise<void> {
      db.transaction(
        "r",
        [db.notebooks, db.sections, db.sectionGroups],
        async () => {
          let [notebooks] = await Promise.all([
            db.notebooks.where("label").equals("tester").toArray(),
          ]);
          notebooks.forEach((notebook) =>
            notebook.loadSectionsAndSectionGroups()
          );
          return notebooks;
        }
      );
    },
  },
});
</script>

<style scoped></style>
