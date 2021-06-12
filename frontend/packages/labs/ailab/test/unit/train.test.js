import {
  getExtrema,
  getAccuracyRegression,
  getAccuracyClassification
} from "../../src/redux.js";

import train from "../../src/train";

import { ResultsGrades } from "../../src/constants.js";

import { createStore } from "redux";

import rootReducer, {
  setFirehoseMetricsLogger,
  setImportedData,
  setLabelColumn,
  addSelectedFeature
} from "../../src/redux";

describe("train functions", () => {
  test("do some training", async () => {
    const store = createStore(rootReducer);

    store.dispatch(setFirehoseMetricsLogger(() => {}));

    const data = [
      { temperature: "45", cost: "23", rain: "97" },
      { temperature: "52", cost: "21", rain: "82" },
      { temperature: "72", cost: "25", rain: "42" }
    ];

    store.dispatch(setImportedData(data));

    store.dispatch(setLabelColumn("cost"));
    store.dispatch(addSelectedFeature("temperature"));

    train.init(store);
    train.onClickTrain(store);
    train.onClickPredict(store);

    const newState = store.getState();
    expect(newState.prediction).toBe(25);
  });
});
