import "./assetPath";
import { initAll } from "./index";
import queryString from "query-string";

// A list of sample modes.  Should match the dropdown in index.html.
const sampleModes = {
  minimal: {
    datasets: ["candy"],
    hideSpecifyColumns: true,
    hideSelectTrainer: "knnClassify",
    hideChooseReserve: true,
    hideModelCard: true,
    hideColumnClicking: true,
    hideSelectLabel: true,
  },

  "preload-metadata": {
    hideSpecifyColumns: true,
    hideSelectTrainer: "knnClassify",
    hideChooseReserve: true
  },

  "load-foods": { datasets: ["foods"] },

  "ml-knn-train": {
    datasets: ["candy", "titanic", "foods"],
    hideSelectLabel: true,
    hideSpecifyColumns: true,
    hideChooseReserve: true,
    hideModelCard: true,
    hideSave: true
  },

  "ml-knn-ailab": {
    datasets: ["candy", "titanic", "foods"],
    hideSelectLabel: true,
    hideSpecifyColumns: true,
    hideChooseReserve: true,
    hideModelCard: true
  },

  "ml-mini-project-ailab": {
    datasets: ["candy", "titanic", "foods"],
    hideSelectTrainer: "knnClassify"
  },

  "ml-final-project-ailab": {
    hideSelectTrainer: "knnClassify"
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
  response({ id: 303, status: "success" });
}

function setInstructionsKeyStub(instructionsKey) {
  document.getElementById("instructions").innerText = instructionsKey;
}

// Initialize the app.
initAll({
  mode: mode,
  onContinue: onContinueStub,
  saveTrainedModel: saveTrainedModelStub,
  setInstructionsKey: setInstructionsKeyStub
});
