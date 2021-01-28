import { initAll } from "./index";
import "./assetPath";
import queryString from "query-string";

// A list of sample modes.  Should match the dropdown in index.html.
const sampleModes = {
  minimal: {
    datasets: ["candy"],
    hideSpecifyColumns: true,
    hideSelectTrainer: "knnClassify",
    hideChooseReserve: true,
    hideModelCard: true
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

  "ml-svm-train": {
    datasets: ["candy"],
    hideChooseReserve: true,
    hideModelCard: true
  },

  "ml-svm-ailab": {
    datasets: ["candy", "titanic", "foods"],
    hideChooseReserve: true,
    hideModelCard: true
  },

  "ml-mini-project-ailab": {
    datasets: ["candy", "titanic", "foods"]
  },

  "ml-final-project-ailab": {}
};

// Look for a ?mode= parameter on the URL
let parameters = queryString.parse(location.search);
const mode = parameters["mode"] ? sampleModes[parameters["mode"]] : null;

function saveTrainedModelStub(data) {
  console.log("This would save a trained model.", data);
}

// Initialize the app.
initAll({ mode: mode, saveTrainedModel: saveTrainedModelStub });
