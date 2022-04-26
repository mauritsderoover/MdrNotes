import {
  createContainerAt,
  deleteSolidDataset,
  getContainedResourceUrlAll,
  getSolidDataset,
} from "@inrupt/solid-client";
import { fetch } from "@inrupt/solid-client-authn-browser";

export const compareObject = (object1: any, object2: any): any => {
  const ok = Object.keys;
  const tx = typeof object1;
  const ty = typeof object2;
  return object1 && object2 && tx === "object" && tx === ty
    ? ok(object1).length === ok(object2).length &&
        ok(object1).every((key) => compareObject(object1[key], object2[key]))
    : object1 === object2;
};

export const downloadFile = (
  content: any,
  fileName: string,
  contentType: string
) => {
  const a = document.createElement("a");
  const file = new Blob([content], { type: contentType });
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
};

export const saveJsonFile = (content: any, fileName: string) => {
  downloadFile(content, fileName, "application/json");
};

/**
 * This function checks whether a container or resource exists on a pod.
 * @param URI The URI of the resource or container which existence is checked.
 */
export async function containerExists(URI: string): Promise<boolean> {
  let container = false;
  await getSolidDataset(URI, { fetch })
    .then(() => {
      container = true;
    })
    .catch(() => {
      container = false;
    });
  return container;
}

export async function getData(URI: string) {
  try {
    return await getSolidDataset(URI, { fetch });
  } catch (e) {
    console.log("this is error", e);
  }
}

export function getContainerName(URI: string) {
  const URIComponents = URI.split("/");
  return decodeURI(URIComponents[URIComponents.length - 2]);
}

export async function createContainerAtUri(URI: string) {
  return await createContainerAt(URI, { fetch });
}

export const deleteContainerContents = async (URI: string) => {
  // ccd  we get the dataset at the URI
  let dataset = null;

  try {
    dataset = await getSolidDataset(URI, { fetch });
  } catch (dataset) {
    // TODO Add Error handling
    console.log("The dataset does not exist", dataset);
  }

  // Check if the dataset contains other datasets
  if (dataset) {
    const urls = getContainedResourceUrlAll(dataset);
    if (urls.length > 0) {
      for (const url of urls) {
        await deleteContainerContents(url);
      }
      await deleteSolidDataset(dataset, { fetch });
    } else {
      await deleteSolidDataset(dataset, { fetch });
    }
  }
};
