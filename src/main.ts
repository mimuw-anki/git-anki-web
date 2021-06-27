import { addFileSubmitFunctionality } from "./file_submit";
import { addGithubFunctionality } from "./github";
import { addTextAreaFunctionality } from "./textarea_submit";

async function main() {
  addFileSubmitFunctionality();
  addTextAreaFunctionality();
  // addGithubFunctionality(); // It's not ready yet.
}

main();
