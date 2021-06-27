import { generateDeck, saveDeck, getDataFromFileContent } from "./util";
import type { FileData } from "./util";

import JSZip from "jszip";

const fileInput = <HTMLInputElement>document.getElementById("deck-file");
const fileInputButton = <HTMLButtonElement>(
  document.getElementById("deck-file-button")
);

export async function getFileDatasFromZIP(
  zip: Blob | File
): Promise<FileData[]> {
  const jszip = new JSZip();

  await jszip.loadAsync(zip);

  jszip.forEach(console.log);

  const files = jszip.filter(txtFilter);

  const promises = files.map(getFileDataFromZippedTXT);

  const data = await Promise.all(promises);

  return data;
}

async function getFileContent(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const reader = new FileReader();

    reader.onload = (ev) => {
      const result = ev.target?.result;
      if (typeof result === "string") {
        res(result);
      } else {
        rej(ev);
      }
    };

    reader.readAsText(file);
  });
}

function txtFilter(relativePath: string, file: JSZip.JSZipObject): boolean {
  return !file.dir && relativePath.endsWith(".txt");
}

async function getFileDataFromZippedTXT(
  file: JSZip.JSZipObject
): Promise<FileData> {
  const content = await file.async("text");

  const fileData = getDataFromFileContent(content);

  return fileData;
}

function getFiles(): FileList | null {
  const files = fileInput.files;
  if (files === null) {
    throw "No files";
  }
  return files;
}

async function importFileData(file: File): Promise<FileData[]> {
  if (file.name.endsWith(".zip")) {
    const data = await getFileDatasFromZIP(file);
    return data;
  } else {
    const content = await getFileContent(file);

    return [getDataFromFileContent(content)];
  }
}

async function getCards(): Promise<FileData[]> {
  const files = getFiles();

  if (files === null) {
    return [];
  }

  const promises = Array.from(files).map(importFileData);

  const datas = await Promise.all(promises);

  return datas.flat();
}

async function handleFileSubmit() {
  const fileDatas = await getCards();

  const deck = await generateDeck(fileDatas);
  await saveDeck(deck, fileDatas[0].deckName);
}

export function addFileSubmitFunctionality() {
  fileInputButton.onclick = handleFileSubmit;
}
