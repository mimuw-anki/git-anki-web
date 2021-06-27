import { generateDeck, saveDeck, getDataFromFileContent } from "./util";

const textArea = <HTMLTextAreaElement>document.getElementById("deck-text");
const textAreaButton = <HTMLButtonElement>(
  document.getElementById("deck-text-button")
);

function getText(): string {
  return textArea.value;
}

async function handleTextAreaSubmit() {
  const text = getText();

  const data = getDataFromFileContent(text);

  const deck = await generateDeck([data]);
  await saveDeck(deck, data.deckName);
}

export function addTextAreaFunctionality() {
  textAreaButton.onclick = handleTextAreaSubmit;
}
