import "./assetPath";
import { initAll, instructionsDismissed } from "./index";
import queryString from "query-string";

// A list of sample modes.  Should match the dropdown in index.html.
const sampleModes = {
  minimal: {
    datasets: ["tacos_toy"],
    hideModelCard: true,
    hideSelectLabel: true
  },

  "preload-metadata": {
    requireAccuracy: 50,
    hideSpecifyColumns: true,
    hideChooseReserve: true,
    hideInstructionsOverlay: true
  },

  "intro-ai-tacos": {
    datasets: ["tacos_toy"],
    hideSelectLabel: true,
    hideModelCard: true,
    hideSave: true
  },

  "intro-ai-foods": {
    datasets: [
      "boba_toy",
      "cookies_toy",
      "naan_toy",
      "poke_toy",
      "poutine_toy",
      "raspado_toy",
      "salad_toy",
      "salsa_toy"
    ],
    hideSelectLabel: true,
    hideModelCard: true,
    hideSave: true
  },

  safari: {
    datasets: ["safari_toy"],
    hideSelectLabel: true,
    hideModelCard: true,
    hideSave: true
  },

  zoo: {
    datasets: ["zoo"]
  },

  "final-project": {
    randomizeTestData: true
  }
};

// Look for a ?mode= parameter on the URL
let parameters = queryString.parse(location.search);
const mode = parameters["mode"] ? sampleModes[parameters["mode"]] : null;

function onContinueStub() {
  console.log("This would continue to the next level.");
}

function saveTrainedModelStub(data, response) {
  console.log("This would save a trained model.", data);
  setTimeout(
    () => response({ id: 303, status: "success" }),
    2000
  );
}

function setInstructionsKeyStub(instructionsKey, options) {
  const element = document.getElementById("instructions");

  element.innerText =
    instructionsKey + (options.showOverlay ? " (click to dismiss overlay)" : " (no overlay)");

  element.onclick = () => {
    if (options.showOverlay) {
      element.innerText = instructionsKey + " (overlay dismissed)";
    }
    instructionsDismissed();
  };
}

// Initialize the app.
initAll({
  mode: mode,
  onContinue: onContinueStub,
  saveTrainedModel: saveTrainedModelStub,
  setInstructionsKey: setInstructionsKeyStub
});
