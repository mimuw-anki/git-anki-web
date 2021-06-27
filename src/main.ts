import { saveAs } from "file-saver";
import { Export } from "./export";
import { sha256 } from "js-sha256";

import JSZip from "jszip";

interface Card {
  front: string;
  back: string;
  id: string;
}

interface FileData {
  deckId: string;
  deckName: string;
  fileId: string;
  cards: Card[];
}

const fileInput = <HTMLInputElement>document.getElementById("deck-file");
const fileInputButton = <HTMLButtonElement>(
  document.getElementById("deck-file-button")
);

const textArea = <HTMLTextAreaElement>document.getElementById("deck-text");
const textAreaButton = <HTMLButtonElement>(
  document.getElementById("deck-text-button")
);

const githubInput = <HTMLInputElement>document.getElementById("deck-github");
const githubInputButton = <HTMLButtonElement>(
  document.getElementById("deck-github-button")
);

function repoURLToZipDownloadURL(repoURL: string): string {
  return `${repoURL}/archive/refs/heads/master.zip`;
}

async function downloadZIPFromGithub(repoURL: string): Promise<Blob> {
  const zipURL = repoURLToZipDownloadURL(repoURL);

  const response = await fetch(zipURL, { mode: "no-cors" });
  console.log(zipURL);
  console.log(response);

  const file = await response.blob();

  saveAs(file, "dupa.zip");
  saveAs(await response.text(), "dupa2.zip");

  return file;
}

function getFiles(): FileList | null {
  const files = fileInput.files;
  if (files === null) {
    throw "No files";
  }
  return files;
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

function getDataFromFileContent(content: string): FileData {
  const LINES_PER_CARD = 3;

  const cards: Card[] = [];

  const lines = content.split("\n").map((line) => line.trim());
  let [deckIdLine, deckNameLine, fileIdLine, ...dataLines] =
    lines.filter(Boolean);

  if (dataLines.length % LINES_PER_CARD !== 0) {
    throw "Wrong file format";
  }

  let [deckId] = deckIdLine.match(/(?<=deck_id:)(.+)/g) ?? [];
  let [deckName] = deckNameLine.match(/(?<=deck_name:)(.+)/g) ?? [];
  let [fileId] = fileIdLine.match(/(?<=file_id:)(.+)/g) ?? [];

  deckId = deckId?.trim();
  deckName = deckName?.trim();
  fileId = fileId?.trim();

  if (!deckId || !deckName || !fileId) {
    throw "Wrong file format";
  }

  for (let i = 0; i < dataLines.length; i += 3) {
    const card: Card = {
      id: sha256(dataLines[i] + fileId),
      front: dataLines[i + 1],
      back: dataLines[i + 2],
    };

    cards.push(card);
  }

  deckId.trim();

  return { deckId, deckName, fileId, cards };
}

async function importFileData(file: File): Promise<FileData[]> {
  console.log(file, file.name.endsWith(".zip"));
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

async function saveDeck(deck: Export, name: string) {
  const zip = await deck.save();
  console.log(zip);
  saveAs(zip, `${name}.apkg`);
}

async function generateDeck(fileData: FileData[]) {
  const apkg = new Export(fileData[0].deckName, fileData[0].deckId);
  console.log(apkg instanceof Export);

  for (const data of fileData) {
    for (const card of data.cards) {
      apkg.addCard(
        `${card.front}`,
        `${card.front}<hr id="answer">${card.back}`,
        card.id
      );
    }
  }

  return apkg;
}

// function mergeFileData(fileDatas: FileData[]): FileData {
//   return {
//     deckId: fileDatas[0].deckId,
//     deckName: fileDatas[0].deckName,
//     fileId: fileDatas[0].fileId,
//     cards: fileDatas.map((data) => data.cards).flat(),
//   };
// }

async function handleFileSubmit() {
  const fileDatas = await getCards();

  const deck = await generateDeck(fileDatas);
  await saveDeck(deck, fileDatas[0].deckName);
}

function getText(): string {
  return textArea.value;
}

async function handleTextAreaSubmit() {
  const text = getText();

  const data = getDataFromFileContent(text);

  const deck = await generateDeck([data]);
  await saveDeck(deck, data.deckName);
}

function txtFilter(relativePath: string, file: JSZip.JSZipObject): boolean {
  return !file.dir && relativePath.endsWith(".txt");
}

async function getFileDataFromZippedTXT(
  file: JSZip.JSZipObject
): Promise<FileData> {
  const content = await file.async("text");
  console.log(file, content);

  const fileData = getDataFromFileContent(content);

  return fileData;
}

async function getFileDatasFromZIP(zip: Blob | File): Promise<FileData[]> {
  const jszip = new JSZip();

  await jszip.loadAsync(zip);

  jszip.forEach(console.log);

  const files = jszip.filter(txtFilter);

  const promises = files.map(getFileDataFromZippedTXT);

  const data = await Promise.all(promises);

  return data;
}

function getGithubLink(): string {
  return githubInput.value;
}

async function handleGithubSubmit() {
  const link = getGithubLink();
  const file = await downloadZIPFromGithub(link);
  const fileDatas = await getFileDatasFromZIP(file);

  const deck = await generateDeck(fileDatas);
  await saveDeck(deck, fileDatas[0].deckName);
}

function bindListeners() {
  fileInputButton.onclick = handleFileSubmit;
  textAreaButton.onclick = handleTextAreaSubmit;
  githubInputButton.onclick = handleGithubSubmit;
}

bindListeners();
