import { generateDeck, saveDeck } from "./util";

import { getFileDatasFromZIP } from "./file_submit";

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

export function addGithubFunctionality() {
  githubInputButton.onclick = handleGithubSubmit;
}
