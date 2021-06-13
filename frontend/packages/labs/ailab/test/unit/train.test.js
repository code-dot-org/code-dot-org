import { createStore } from "redux";
import train from "../../src/train";
import { ResultsGrades } from "../../src/constants.js";
import { ColumnTypes } from "../../src/constants.js";
import rootReducer, {
  setFirehoseMetricsLogger,
  setImportedData,
  setLabelColumn,
  addSelectedFeature,
  setColumnsByDataType,
  setTestData,
  getConvertedPredictedLabel
} from "../../src/redux";

describe("train functions", () => {
  test("train and predict with numerical data", async () => {
    const store = createStore(rootReducer);

    store.dispatch(setFirehoseMetricsLogger(() => {}));

    const data = [
      { temperature: "0", cost: "20", rain: "1000" },
      { temperature: "50", cost: "25", rain: "1010" },
      { temperature: "100", cost: "30", rain: "1020" }
    ];

    store.dispatch(setImportedData(data));
    store.dispatch(setLabelColumn("cost"));
    store.dispatch(addSelectedFeature("temperature"));
    store.dispatch(addSelectedFeature("rain"));

    train.init(store);
    train.onClickTrain(store);

    store.dispatch(setTestData({temperature: "150", rain: "1030"}));

    train.onClickPredict(store);

    const predictedValue = getConvertedPredictedLabel(store.getState());
    expect(predictedValue).toBe(30);
  });

  test("train and predict with categorical data", async () => {
    const store = createStore(rootReducer);

    store.dispatch(setFirehoseMetricsLogger(() => {}));

    const data = [
      { color: "blue", flavor: "sour", texture: "crunchy" },
      { color: "green", flavor: "sweet", texture: "crunchy" },
      { color: "blue", flavor: "sweet", texture: "soft" }
    ];

    store.dispatch(setImportedData(data));
    store.dispatch(setColumnsByDataType("color", ColumnTypes.CATEGORICAL));
    store.dispatch(setColumnsByDataType("flavor", ColumnTypes.CATEGORICAL));
    store.dispatch(setColumnsByDataType("texture", ColumnTypes.CATEGORICAL));
    store.dispatch(setLabelColumn("color"));
    store.dispatch(addSelectedFeature("flavor"));
    store.dispatch(addSelectedFeature("texture"));

    train.init(store);
    train.onClickTrain(store);

    store.dispatch(setTestData({flavor: "sweet", texture: "crunchy"}));

    train.onClickPredict(store);

    const predictedLabel = getConvertedPredictedLabel(store.getState());

    expect(predictedLabel).toBe("green");
  });
});
