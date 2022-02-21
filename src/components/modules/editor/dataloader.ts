import {
  getContainedResourceUrlAll,
  SolidDataset,
  ThingPersisted,
  WithResourceInfo,
} from "@inrupt/solid-client";
import { getData } from "@/components/genericcomponents/utils/utils";
import { getThingFromSolidPod } from "@/components/modules/editor/DataModel";

export default class DataLoader {
  rootDataSet?: SolidDataset & WithResourceInfo;
  things: Record<string, ThingPersisted>;
  resourceUrls: string[];
  ROOT_URL: string;

  constructor(root_url: string) {
    this.things = {};
    this.resourceUrls = [];
    this.ROOT_URL = root_url;
    this.getRootDataSet();
  }

  getRootDataSet(): void {
    console.log("this is getRootDataSetStarted", new Date());
    getData(this.ROOT_URL).then((value) => {
      if (!value) throw new Error("No root dataset has been found");
      this.rootDataSet = value;
      this.getAllContainedUrls();
      this.loadAllThings().then();
    });
  }

  getAllContainedUrls(): void {
    if (this.rootDataSet) {
      this.resourceUrls = getContainedResourceUrlAll(this.rootDataSet);
    }
  }

  async loadAllThings(): Promise<void> {
    const requests: Promise<ThingPersisted>[] = [];
    for (const resourceUrl of this.resourceUrls) {
      requests.push(getThingFromSolidPod(resourceUrl));
    }
    Promise.all(requests).then((results) => {
      results.map((request) => (this.things[request.url] = request));
      this.loadData();
    });
  }

  loadData(): void {
    console.log("loadData in DataLoader has been called", new Date());
    console.log("this is things", this.things);
  }
}
