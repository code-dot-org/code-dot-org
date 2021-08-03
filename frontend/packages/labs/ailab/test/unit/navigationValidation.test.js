import { isPanelEnabled } from "../../src/helpers/navigationValidation.js";

const initialState = {
  data: [],
  selectedFeatures: [],
  accuracyCheckExamples: [],
  saveStatus: "notStarted",
  trainedModelDetails: {}
};

const dataUploadedState = {
  ...initialState,
  data: [
    {
      name: "Hermione",
      isEvil: false,
      house: "Gryffindor"
    },
    {
      name: "Harry",
      isEvil: false,
      house: "Gryffindor"
    },
    {
      name: "Voldemort",
      isEvil: true,
      house: "Slytherin"
    }
  ]
};

const selectedLabelState = {
  ...dataUploadedState,
  labelColumn: "isEvil"
};

const selectedFeaturesState = {
  ...selectedLabelState,
  selectedFeatures: ["house"]
};

/*
  Given the constraints of the UI, this is not a state we expect users to ever
  be in, but it's important that the model training step happen only when
  features and label are unique.
*/
const sameFeatureLabelState = {
  ...dataUploadedState,
  labelColumn: "isEvil",
  selectedFeatures: ["isEvil"]
};

const resultsState = {
  ...selectedFeaturesState,
  accuracyCheckExamples: [0, 0]
};

const savingModelState = {
  ...resultsState,
  trainedModelDetails: {
    name: "Which Hogwarts House is Evil?"
  },
  saveStatus: "started"
};

const savedModelState = {
  ...savingModelState,
  saveStatus: "success"
};

describe("isPanelEnabled", () => {
  test("dataDisplayLabel - disabled", async () => {
    const result = isPanelEnabled(initialState, "dataDisplayLabel");
    expect(result).toBe(false);
  });

  test("dataDisplayLabel - enabled", async () => {
    const result = isPanelEnabled(dataUploadedState, "dataDisplayLabel");
    expect(result).toBe(true);
  });

  test("dataDisplayFeatures - disabled", async () => {
    const result = isPanelEnabled(dataUploadedState, "dataDisplayFeatures");
    expect(result).toBe(false);
  });

  test("dataDisplayFeatures - enabled", async () => {
    const result = isPanelEnabled(selectedLabelState, "dataDisplayFeatures");
    expect(result).toBe(true);
  });

  test("selectFeatures - disabled", async () => {
    const result = isPanelEnabled(selectedLabelState, "selectFeatures");
    expect(result).toBe(false);
  });

  test("selectFeatures - enabled", async () => {
    const result = isPanelEnabled(selectedFeaturesState, "selectFeatures");
    expect(result).toBe(true);
  });

  test("trainModel - disabled", async () => {
    const result = isPanelEnabled(sameFeatureLabelState, "trainModel");
    expect(result).toBe(false);
  });

  test("trainModel - enabled", async () => {
    const result = isPanelEnabled(selectedFeaturesState, "trainModel");
    expect(result).toBe(true);
  });

  test("results - disabled", async () => {
    const result = isPanelEnabled(selectedFeaturesState, "results");
    expect(result).toBe(false);
  });

  test("results - enabled", async () => {
    const result = isPanelEnabled(resultsState, "results");
    expect(result).toBe(true);
  });

  test("modelSummary - disabled, no model name", async () => {
    const result = isPanelEnabled(resultsState, "modelSummary");
    expect(result).toBe(false);
  });

  test("modelSummary - disabled, save in progress", async () => {
    const result = isPanelEnabled(savingModelState, "modelSummary");
    expect(result).toBe(false);
  });

  test("modelSummary - enabled", async () => {
    const result = isPanelEnabled(savedModelState, "modelSummary");
    expect(result).toBe(true);
  });
});
