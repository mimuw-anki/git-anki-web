import { Export } from "./export";
import { guid_for as gf } from "./guid_for";
import { saveAs } from "file-saver";
import { sha256 } from "js-sha256";

export interface Card {
  front: string;
  back: string;
  id: string;
}

export interface FileData {
  deckId: string;
  deckName: string;
  fileId: string;
  cards: Card[];
}

export const guid_for = gf;

export async function saveDeck(deck: Export, name: string) {
  const zip = await deck.save();
  console.log(zip);
  saveAs(zip, `${name}.apkg`);
}

export async function generateDeck(fileData: FileData[]) {
  const apkg = new Export(fileData[0].deckName, fileData[0].deckId);

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

export function getDataFromFileContent(content: string): FileData {
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
