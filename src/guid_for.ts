// Port from https://github.com/kerrickstaley/genanki/blob/master/genanki/util.py as we need same guid

import { sha256 } from "js-sha256";

const BASE91_TABLE: string[] = [
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "!",
  "#",
  "$",
  "%",
  "&",
  "(",
  ")",
  "*",
  "+",
  ",",
  "-",
  ".",
  "/",
  ":",
  ";",
  "<",
  "=",
  ">",
  "?",
  "@",
  "[",
  "]",
  "^",
  "_",
  "`",
  "{",
  "|",
  "}",
  "~",
];

const BASE91_TABLE_SIZE: bigint = 91n;

export function guid_for(...values: any[]): string {
  const hash_str = values.join("__");
  const hash = sha256.create();
  hash.update(hash_str);

  const hash_bytes = hash.array().slice(0, 8);
  let hash_int: bigint = 0n;
  for (const byte of hash_bytes) {
    hash_int <<= 8n;
    hash_int += BigInt(byte);
  }

  const rv_reversed = [];
  while (hash_int > 0n) {
    rv_reversed.push(BASE91_TABLE[Number(hash_int % BASE91_TABLE_SIZE)]);
    hash_int = hash_int / BASE91_TABLE_SIZE;
  }

  return rv_reversed.reverse().join("");
}
