<template>
  <div class="p-grid nested-grid">
    <div class="p-col-12">
      <Button
        label="Create notebook"
        icon="pi pi-check"
        class="p-button-help"
        @click="createNotebook"
      />
      <Button
        label="loadData"
        icon="pi pi-check"
        class="p-button-help"
        @click="loadDataTester"
      />
      <Button
        label="Delete root container"
        icon="pi pi-check"
        class="p-button-help"
        @click="deleteRootContainer"
      />
      <!--      <Button-->
      <!--        label="add Something to Container"-->
      <!--        icon="pi pi-check"-->
      <!--        class="p-button-help"-->
      <!--        @click="addSomethingToContainer"-->
      <!--      />-->
      <!--      <Button-->
      <!--        label="solidCreationExample"-->
      <!--        icon="pi pi-check"-->
      <!--        class="p-button-help"-->
      <!--        @click="solidCreationExample"-->
      <!--      />-->
      <!--      <Button-->
      <!--        label="solidModificationExample"-->
      <!--        icon="pi pi-check"-->
      <!--        class="p-button-help"-->
      <!--        @click="solidModificationExample"-->
      <!--      />-->
    </div>
    <div class="p-col-12">
      <Toolbar ref="toolbar" />
    </div>
    <div class="p-col-12">
      <DraggableTabMenu
        v-model:activeIndex="activeIndex"
        :model="tabItems"
        @tab-change="updateCurrentTab"
        @add-tab="addTab"
        @label-changed="labelChange"
      />
    </div>
    <div class="p-col-12">
      <div class="p-grid">
        <div class="p-col-2">
          <DraggablePanelMenu
            :model="panelMenuItems[currentTab]"
            layer="mainItem"
            @tab-change="updateMenuItem"
            @add-menu-element="addMenuElement"
          />
        </div>
        <div class="p-col-10">
          <div
            ref="editor"
            :="editors[currentEditor]"
            style="height: 400px"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Button from "primevue/button";
import {
  containerExists,
  getData,
  getContainerName,
  // deleteContainerContents,
  saveJsonFile,
  // createContainerAtUri,
  deleteContainerContents,
  createContainerAtUri,
} from "@/components/genericcomponents/utils/utils";
import DraggableTabMenu from "../../modules/editor/actioncomponents/MenuComponents/DraggableTabMenu.vue";
import Toolbar from "../../modules/editor/actioncomponents/EditorComponents/Toolbar.vue";
import Quill, { Delta } from "quill";
import DraggablePanelMenu from "../../modules/editor/actioncomponents/MenuComponents/DraggablePanelMenu.vue";
import {
  buildThing,
  createThing,
  createSolidDataset,
  setThing,
  saveSolidDatasetAt,
  getContainedResourceUrlAll,
  // isThing,
  getThingAll,
  ThingLocal,
  ThingPersisted,
  deleteSolidDataset,
  addUrl,
  getThing,
  addDecimal,
  removeThing,
  addStringNoLocale,
  getSolidDataset,
  setStringNoLocale,
  // createContainerAt,
} from "@inrupt/solid-client";
import { rdf, solid } from "@inrupt/solid-client/dist/constants";
import SCHEMA from "../../genericcomponents/vocabs/SCHEMA";
import NOTETAKING from "../../genericcomponents/vocabs/NOTETAKING";
import {
  Item,
  ItemInterface,
  MainDashBoardInterface,
  PanelItem,
} from "@/components/modules/editor/Editor";
import { fetch } from "@inrupt/solid-client-authn-browser";
import { DCTERMS, RDF, SCHEMA_INRUPT } from "@inrupt/vocab-common-rdf";
import { loadData, newNoteBook } from "@/components/modules/editor/DataModel";

// import { LDP } from "@inrupt/vocab-common-rdf";
export default defineComponent({
  name: "MainDashboard",
  components: {
    DraggablePanelMenu,
    Toolbar,
    DraggableTabMenu,
    Button,
  },
  data(): MainDashBoardInterface {
    return {
      tabItems: [],
      panelMenuItems: {},
      currentTab: "",
      currentMenuPanelItem: "",
      activeIndex: 0,
      lazy: false,
      editors: {},
      currentEditor: "",
      editor: undefined,
      activeMenuElement: undefined,
    };
  },
  async beforeMount() {
    const URI = `${this.$store.getters.getOrigin}/notes/`;
    // await deleteContainerContents(URI);
    if (await containerExists(URI)) {
      await this.loadData();
    } else {
      await this.createInitialNotes();
    }
  },
  mounted() {
    this.editor = new Quill(this.$refs.editor as HTMLDivElement, {
      theme: "snow",
      modules: {
        toolbar: (this.$refs.toolbar as any).$refs.toolbar,
      },
    });

    this.editor.root.innerHTML = this.editors[
      this.currentEditor
    ] as unknown as string;
    this.editor.on("text-change", () => {
      if (this.editor) {
        this.editors[this.currentEditor] = this.editor.getContents();
      }
    });
  },
  methods: {
    /**
     * Some basic information about the structure
     * Since in the SOLID mindset URLS shouldn't change, all notes will be creates in the main
     * notes container. However, there is still a need to clarify where a specific note belongs to.
     *
     * Therefore, a note will always be both container as NoteDigitalDocument resource.
     * On top of the container predicates. The container will always contain the following predicates
     * rdf.type, SCHEMA.NoteDigitalDocument
     * DCTERMS.title, "Some Random Title" (A string literal)
     * SCHEMA.abstract, "Personal notes" (A string literal)
     * SCHEMA.accountablePerson, WebId
     * SCHEMA.creator, WebId
     * SCHEMA.dateCreated, date
     * SCHEMA.Text, ""
     * (optional) SCHEMA.hasPart, URL  *OrANd* DCTERM.hasPart, URL
     * (optional) SCHEMA.isPartOf, URL *OrAnd* DCTERM.isPartOf, URL
     * (optional) SCHEMA.position, integer => this is required if a note container isPartOf another note container
     * */
    createRootContainer() {
      DCTERMS.hasFormat;
      const uri = "https://mauritsderoover.solidcommunity.net/testerRoot/notes";
      let solidDataSet = createSolidDataset();
      const newThing = buildThing(createThing({ url: uri }))
        .addUrl(RDF.type, SCHEMA.NoteDigitalDocument)
        .addStringNoLocale(DCTERMS.title, "testerRootTitle")
        .build();
      solidDataSet = setThing(solidDataSet, newThing);
      saveSolidDatasetAt(uri, solidDataSet, { fetch });
    },
    async solidCreationExample() {
      let courseSolidDataset = createSolidDataset();

      const newBookThing1 = buildThing(createThing({ name: "book1" }))
        .addStringNoLocale(SCHEMA_INRUPT.name, "ABC123 of Example Literature")
        .addUrl(RDF.type, "https://schema.org/Book")
        .build();

      let newBookThing2 = createThing({ name: "book2" });
      newBookThing2 = addStringNoLocale(
        newBookThing2,
        SCHEMA_INRUPT.name,
        "ZYX987 of Example Poetry"
      );
      newBookThing2 = addUrl(
        newBookThing2,
        RDF.type,
        "https://schema.org/Book"
      );

      courseSolidDataset = setThing(courseSolidDataset, newBookThing1);
      courseSolidDataset = setThing(courseSolidDataset, newBookThing2);

      const savedSolidDataset = await saveSolidDatasetAt(
        "https://mauritsderoover.solidcommunity.net/universityZ/fall2021/courses/Writing101",
        courseSolidDataset,
        { fetch: fetch } // fetch from authenticated Session
      );
    },
    loadDataTester() {
      loadData();
    },
    createNotebook() {
      console.log("this has been called! ");
      newNoteBook("TesterNotebook").then(() => {
        console.log("this seems to have worked");
      });
    },
    async createNoteBookOld() {
      // We create a notebook
      const resourceURL =
        "https://mauritsderoover.solidcommunity.net/notes/someidentifier1";
      let solidDataSet = createSolidDataset();
      const thing = buildThing(createThing({ url: resourceURL }))
        .addUrl(RDF.type, NOTETAKING.NoteBook)
        .addStringNoLocale(DCTERMS.title, "NotebookName")
        .build();
      await saveSolidDatasetAt(resourceURL, setThing(solidDataSet, thing), {
        fetch,
      });
      // we create a section and link it to a notebook
      const sectionURL =
        "https://mauritsderoover.solidcommunity.net/notes/sectionidentifier";
      solidDataSet = createSolidDataset();
      const sectionThing = buildThing(createThing({ url: sectionURL }))
        .addUrl(RDF.type, NOTETAKING.Section)
        .addUrl(NOTETAKING.partOfNoteBook, resourceURL)
        .addStringNoLocale(DCTERMS.title, "A section title")
        .build();
      await saveSolidDatasetAt(
        sectionURL,
        setThing(solidDataSet, sectionThing),
        { fetch }
      );
    },
    async solidModificationExample() {
      const resourceURL =
        "https://mauritsderoover.solidcommunity.net/universityZ/fall2021/courses/Writing101";
      let courseSolidDataset = await getSolidDataset(resourceURL, {
        fetch: fetch,
      });

      let book1Thing = getThing(courseSolidDataset, `${resourceURL}#book1`);
      if (book1Thing)
        book1Thing = buildThing(book1Thing)
          .addInteger("https://schema.org/numberOfPages", 30)
          .build();

      let book2Thing = getThing(courseSolidDataset, `${resourceURL}#book2`);
      if (book2Thing)
        book2Thing = setStringNoLocale(
          book2Thing,
          SCHEMA_INRUPT.name,
          "ZYX987 of Example Poesy"
        );

      const locationThing = buildThing(createThing({ name: "location" }))
        .addStringNoLocale(SCHEMA_INRUPT.name, "Sample Lecture Hall")
        .addUrl(RDF.type, "https://schema.org/Place")
        .build();
      if (book1Thing && book2Thing) {
        courseSolidDataset = setThing(courseSolidDataset, book1Thing);
        courseSolidDataset = setThing(courseSolidDataset, book2Thing);
        courseSolidDataset = setThing(courseSolidDataset, locationThing);
      }

      const savedSolidDataset = await saveSolidDatasetAt(
        resourceURL,
        courseSolidDataset,
        { fetch: fetch } // fetch from authenticated Session
      );
    },
    async addSomethingToContainer() {
      const uri =
        "https://mauritsderoover.solidcommunity.net/testerRoot/testerYolo";
      // let solidDataset = await getData(uri);

      let newDataSet = createSolidDataset();

      const newThing = buildThing(createThing({ url: uri }))
        .addUrl(RDF.type, NOTETAKING.Note)
        .build();

      newDataSet = setThing(newDataSet, newThing);

      await saveSolidDatasetAt(uri, newDataSet, { fetch });

      // if (solidDataset) {
      //   let things = getThing(solidDataset, uri);
      //   // solidDataset = removeThing(solidDataset, uri);
      //   if (things) {
      //     things = buildThing(createThing({ name: "Tester1" }))
      //       .addUrl(RDF.type, NOTETAKING.Section)
      //       .addDecimal(NOTETAKING.partOfSectionGroup, 5)
      //       .build();
      //     console.log("things", things);
      //     solidDataset = setThing(solidDataset, things);
      //     console.log("newDataSet", solidDataset);
      //     await saveSolidDatasetAt(uri, solidDataset, {
      //       fetch,
      //     }).then(() => {
      //       console.log("this has been successful");
      //     });
      //   }
      // }
    },
    deleteRootContainer() {
      const uri = "https://mauritsderoover.solidcommunity.net/notes/";
      deleteContainerContents(uri);
      // TODO
    },
    changeTitle() {
      console.log("this is blabla");
    },
    labelChange(event: any) {
      console.log("this has been executed", event);
    },
    async containerExists() {
      console.log(
        "this is in containerExists",
        await containerExists(
          "https://mauritsderoover.solidcommunity.net/notes/"
        )
      );
    },
    createLabelThing(): ThingPersisted {
      return buildThing(
        createThing({
          url: "https://mauritsderoover.solidcommunity.net/notes/TESTERTAB/",
        })
      )
        .addStringNoLocale(DCTERMS.title, "testertitle")
        .build();
    },
    deleteLabel(): void {
      deleteSolidDataset(
        "https://mauritsderoover.solidcommunity.net/notes/tab1/untitled%20kpocsakpo",
        { fetch }
      ).then(() => {
        deleteContainerContents(
          "https://mauritsderoover.solidcommunity.net/notes/"
        ).then(() => {
          deleteContainerContents(
            "https://mauritsderoover.solidcommunity.net/notes"
          );
        });
      });
    },
    testingLabelStuff(): void {
      getData(this.createTabUrl("TESTERTAB/").toString());
    },
    addLabel(): void {
      deleteContainerContents(this.createTabUrl("TESTERTAB/").toString()).then(
        () => {
          createContainerAtUri(this.createTabUrl("TESTERTAB/").toString()).then(
            (value) => {
              console.log(
                "this is value aftr the new tab has been created",
                value
              );
              getData(this.createTabUrl("TESTERTAB/").toString()).then(
                (value1) => {
                  console.log("this is data", value1);
                  if (value1) {
                    const new_dataset = setThing(
                      value1,
                      this.createLabelThing()
                    );
                    saveSolidDatasetAt(
                      this.createTabUrl("TESTERTAB/").toString(),
                      new_dataset,
                      { fetch }
                    ).then((value2) => {
                      console.log("this is value2", value2);
                    });
                  }
                }
              );
            }
          );
        }
      );

      setTimeout(() => {
        getData(this.createTabUrl("TESTERTAB/").toString()).then((value1) => {
          console.log("this is data", value1);
        });
      }, 4000);
    },
    createNoteDigitalDocument(): ThingLocal {
      return buildThing(createThing({ name: "untitled" }))
        .addUrl(rdf.type, SCHEMA.NoteDigitalDocument)
        .addStringEnglish(SCHEMA.abstract, "Personal notes")
        .addUrl(SCHEMA.accountablePerson, this.$store.getters.getWebId)
        .addUrl(SCHEMA.creator, this.$store.getters.getWebId)
        .addDatetime(SCHEMA.dateCreated, new Date())
        .addStringNoLocale(SCHEMA.Text, "")
        .build();
    },
    createNotePage() {
      console.log("this function has been reached");
      let solidDataset = createSolidDataset();

      solidDataset = setThing(solidDataset, this.createNoteDigitalDocument());

      saveSolidDatasetAt(this.currentMenuPanelItem, solidDataset, {
        fetch,
      }).then(() => {
        console.log("it has been succesfully saved");
      });
    },
    async createInitialNotes() {
      let solidDataset = createSolidDataset();

      const testThing = buildThing(
        createThing({
          name: `nameIsBack`,
        })
      )
        .addUrl(rdf.type, SCHEMA.NoteDigitalDocument)
        .addStringEnglish(SCHEMA.abstract, "Personal notes")
        .addUrl(SCHEMA.accountablePerson, this.$store.getters.getWebId)
        .addUrl(SCHEMA.creator, this.$store.getters.getWebId)
        .addDatetime(SCHEMA.dateCreated, new Date())
        .addStringNoLocale(SCHEMA.Text, "")
        .build();

      solidDataset = setThing(solidDataset, testThing);

      await saveSolidDatasetAt(
        encodeURI(
          `${this.$store.getters.getOrigin}/notes/tab1/untitled kpocsakpo/`
        ),
        solidDataset,
        { fetch }
      );

      await this.loadData();
    },
    async loadData() {
      // first we get the root dataset
      const rootDataSets = await getData(
        `${this.$store.getters.getOrigin}/notes/`
      );
      // from the root dataset we get the tabs
      let tabUrls: string[] = [];
      if (rootDataSets) {
        const urls = getContainedResourceUrlAll(rootDataSets);
        if (Array.isArray(urls)) {
          tabUrls = urls;
        }
      }

      // for every tab we get the related dataset
      for (const tabUrl of tabUrls) {
        const tabKey = getContainerName(tabUrl);
        this.tabItems.push({
          label: tabKey,
          key: tabKey,
          uri: new URL(tabUrl),
        });
        const tabDataset = await getData(tabUrl);
        let tabMenuItemUrls: string[] = [];
        if (tabDataset) {
          tabMenuItemUrls = getContainedResourceUrlAll(tabDataset);
        }
        for (const menuItemUrl of tabMenuItemUrls) {
          if (!this.panelMenuItems[tabKey]) {
            this.panelMenuItems[tabKey] = [
              new PanelItem({
                label: getContainerName(menuItemUrl),
                url: menuItemUrl,
              }),
            ];
          } else {
            this.panelMenuItems[tabKey].push(
              new PanelItem({
                label: getContainerName(menuItemUrl),
                url: menuItemUrl,
              })
            );
          }
        }
      }
      this.currentTab = getContainerName(tabUrls[0]);
      this.currentMenuPanelItem = this.panelMenuItems[this.currentTab][0].key;
      this.currentEditor = this.panelMenuItems[this.currentTab][0].key;
    },
    // Keep track of active tabs and menu items
    updateCurrentTab(event: { index: number }) {
      this.activeIndex = event.index;
      this.currentTab = this.tabItems[this.activeIndex].key;
      this.currentMenuPanelItem = this.panelMenuItems[this.currentTab][0].key;
      this.currentEditor = this.panelMenuItems[this.currentTab][0].key;
      if (this.editor) {
        this.editor.setContents(this.editors[this.currentEditor]);
      }
    },
    addTab() {
      // In order to add a tab we need a the url storage container
      // we need a label
      // we need a check if the label is unique
      // we need to add it to the object locally
      // we need to add it to the solid pod (we do need to wait for this happen)
      // Th default value of a new tab is "untitled", if it already exist then a number is added
      let defaultLabel = "untitled";
      const foundItems = this.tabItems.filter((value) =>
        value.label.includes(defaultLabel)
      );
      if (foundItems.length > 0) {
        const lastItem = foundItems[foundItems.length - 1];
        if (lastItem.label.includes("-")) {
          const labelParts = lastItem.label.split("-");
          const number = Number(labelParts[1]) + 1;
          defaultLabel = defaultLabel + "-" + number;
        } else {
          defaultLabel = defaultLabel + "-0";
        }
      }

      // we create the new tab item
      const newItem: ItemInterface = new Item({
        label: defaultLabel,
        url: this.createTabUrl(defaultLabel).toString(),
      });
      this.tabItems.push(newItem);

      this.currentTab = newItem.key;

      // we create the panelMenuItem object that belongs to the tab
      if (!this.panelMenuItems[this.currentTab]) {
        this.panelMenuItems[this.currentTab] = [];
      } else {
        throw new Error("There is already a tab with the same name");
      }

      // we create the corresponding menu element
      this.addMenuElement();
    },

    addMenuElement() {
      if (!this.panelMenuItems[this.currentTab]) {
        throw new Error("The key for the panelitems does not exist yet");
      }
      let defaultLabel = "untitled";
      const foundItems = this.panelMenuItems[this.currentTab].filter((value) =>
        value.label.includes(defaultLabel)
      );
      if (foundItems.length > 0) {
        const lastItem = foundItems[foundItems.length - 1];
        if (lastItem.label.includes("-")) {
          const labelParts = lastItem.label.split("-");
          const number = Number(labelParts[1]) + 1;
          defaultLabel = defaultLabel + "-" + number;
        } else {
          defaultLabel = defaultLabel + "-0";
        }
      }

      const newPanelItem: ItemInterface = new PanelItem({
        label: defaultLabel,
        url: this.createMenuElementUrl(defaultLabel).toString(),
      });
      this.panelMenuItems[this.currentTab].push(newPanelItem);
      this.currentMenuPanelItem = newPanelItem.key;
      this.createNotePage();
    },
    createTabUrl(name: string): URL {
      return new URL(`${this.$store.getters.getOrigin}/notes/${name}`);
    },
    createMenuElementUrl(name: string): URL {
      const currentTab = this.tabItems.find(
        (value) => value.key === this.currentTab
      );
      if (!currentTab) {
        throw new Error("The curren tab cannot be found");
      }
      return new URL(
        `${this.$store.getters.getOrigin}/notes/${currentTab.label}/${name}`
      );
    },
    updateMenuItem(event: { item: ItemInterface }) {
      this.activeMenuElement = event.item;
      this.currentEditor = this.activeMenuElement.key;
      if (this.editor) {
        this.editor.setContents(this.editors[this.currentEditor]);
      }
    },

    // // Create and delete tabs
    // addTabItem(tabTitel) {
    //   // create the account
    //   const newTab = {
    //     label: tabTitel,
    //     key: `tab-${this.tabItems.length}`,
    //     newKey: `tab${this.tabItems.length}`,
    //   };
    //   this.tabItems.splice(this.tabItems.length - 1, 0, newTab);
    //   this.panelMenuItems[newTab.newKey] = [
    //     {
    //       label: "Untitled",
    //       icon: "pi pi-fw pi-file",
    //       key: "main-item-1",
    //       editor: `editor${Object.keys(this.editors).length}`,
    //     },
    //     {
    //       label: "add page",
    //       icon: "pi pi-fw pi-plus",
    //       key: `${newTab.newKey}-main-item-0`,
    //
    //       command: (event) => {
    //         this.currentItem = event.item;
    //         this.addPanelMenuItem("untitled");
    //       },
    //     },
    //   ];
    //   this.editors[`editor${Object.keys(this.editors).length}`] = null;
    // },
    // removeTabItem() {},

    // // Create and delete PanelMenuItems
    // addPanelMenuItem(tabTitel) {
    //   this.panelMenuItems[this.currentTab].splice(
    //     this.panelMenuItems[this.currentTab].length - 1,
    //     0,
    //     {
    //       label: tabTitel,
    //       icon: "pi pi-fw pi-file",
    //       key: `${this.currentTab}-main-item-${
    //         this.panelMenuItems[this.currentTab].length
    //       }`,
    //       editor: `editor${Object.keys(this.editors).length}`,
    //       command: (event) => {
    //         this.currentItem = event.item;
    //       },
    //       items: [
    //         {
    //           label: "Add page",
    //           parentKey: `${this.currentTab}-main-item-${
    //             this.panelMenuItems[this.currentTab].length
    //           }`,
    //           key: `${this.currentTab}-sub-item-0`,
    //           editor: `editor${Object.keys(this.editors).length}`,
    //           icon: "pi pi-fw pi-file",
    //           command: (event) => {
    //             this.currentItem = event.item;
    //             this.addPanelMenuSubItem("Untitled", event);
    //           },
    //           items: [
    //             {
    //               label: "another item",
    //               key: "sub-sub-item-0",
    //               editor: `editor${Object.keys(this.editors).length + 1}`,
    //               items: [],
    //             },
    //           ],
    //         },
    //       ],
    //     }
    //   );
    //   this.editors[`editor${Object.keys(this.editors).length}`] = null;
    //   this.editors[`editor${Object.keys(this.editors).length + 1}`] = null;
    // },
    // addPanelMenuSubItem(tabTitel, event) {
    //   console.log(
    //     "this is tabTitel and event in addPanelMenuSubItem",
    //     tabTitel,
    //     event,
    //     this.panelMenuItems,
    //     this.currentTab
    //   );
    //   const mainitem = this.panelMenuItems[this.currentTab].find((mainItem) => {
    //     return mainItem.key === event.item.parentKey;
    //   });
    //   mainitem.items.splice(mainitem.items.length - 1, 0, {
    //     label: tabTitel,
    //     parentkey: mainitem.key,
    //     key: `sub-item-${mainitem.items.length}`,
    //     icon: "pi pi-fw pi-file",
    //     editor: `editor${Object.keys(this.editors).length}`,
    //     items: [],
    //   });
    //   this.editors[`editor${Object.keys(this.editors).length}`] = null;
    // },

    // // Store data
    // storeTabItems() {
    //   saveJsonFile(JSON.stringify(this.tabItems), "/data/tab-notes.json");
    // },
    // saveContents() {
    //   saveJsonFile(
    //     JSON.stringify(this.editor.getContents()),
    //     `${this.identifier}.json`
    //   );
    // },

    // setInitialTabs() {
    //   this.menuItems = {};
    //   this.tabItems = [
    //     {
    //       label: "First page",
    //       key: "tab-0",
    //       newKey: "tab0",
    //     },
    //     {
    //       icon: "pi pi-fw pi-plus",
    //       command: (event) => {
    //         this.addTabItem("Untitled");
    //       },
    //     },
    //   ];
    //   this.currentTab = this.tabItems[0].newKey;
    //   this.currentMenuPanelItem = this.panelMenuItems[this.currentTab][0];
    // },
    // getTabItems() {
    //   axios
    //     .get("/data/tab-notes.json")
    //     .then((value) => {
    //       this.tabItems = value.data;
    //     })
    //     .catch(() => {
    //       this.setInitialTabs();
    //     });
    // },
    // // check if notes container exists
    // noteContainerExist() {
    //
    // }
  },
});
</script>

<style scoped>
@import "https://cdn.quilljs.com/1.3.6/quill.snow.css";
</style>
