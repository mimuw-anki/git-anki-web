import ankiExportFactory from "anki-apkg-export";
import { guid_for } from "./guid_for";

export class Export {
  private card_id = "";
  private deck_id = "";

  private instance;

  constructor(deckName: string, deckId: string) {
    this.instance = ankiExportFactory(deckName);

    this.monkeyPatchInstance();
  }

  monkeyPatchInstance() {
    const org = this.instance._getId.bind(this.instance);

    this.instance._getId = (table: string, col: string, ts: number) => {
      if (col === "guid") {
        return guid_for(this.deck_id, this.card_id);
      } else {
        return org(table, col, ts);
      }
    };
  }

  addCard(front: string, back: string, card_id: string, options = {}) {
    this.card_id = card_id;

    return this.instance.addCard(front, back, options);
  }

  save() {
    return this.instance.save();
  }
}
