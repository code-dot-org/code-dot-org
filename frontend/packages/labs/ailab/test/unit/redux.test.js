import {
  getRange,
  getAccuracyRegression
} from "../../src/redux.js";

import { ResultsGrades } from "../../src/constants.js";

const resultsState = {
  data: [
    {
      sun: "high",
      height: 3.8
    },
    {
      sun: "high",
      height: 3.9
    },
    {
      sun: "medium",
      height: 2.6
    },
    {
      sun: "medium",
      height: 2.5
    },
    {
      sun: "low",
      height: 0.9
    },
    {
      sun: "low",
      height: 1.6
    }
  ],
  labelColumn: "height",
  accuracyCheckPredictedLabels: [4.0, 3.75, 2.63, 2.46, 1.6, 1.0],
  accuracyCheckLabels: [3.9, 3.8, 2.6, 2.5, 1.6, 0.9]
};

describe("redux functions", () => {
  test("getAccuracyRegression", async () => {
    const maxMin = getRange(resultsState, resultsState.labelColumn);
    const range = Math.abs(maxMin.max - maxMin.min);
    expect(range).toBe(3);
    const accuracy = getAccuracyRegression(resultsState);
    expect(accuracy.grades).toEqual([
      ResultsGrades.INCORRECT,
      ResultsGrades.CORRECT,
      ResultsGrades.CORRECT,
      ResultsGrades.CORRECT,
      ResultsGrades.CORRECT,
      ResultsGrades.INCORRECT
    ]);
    // error tolerance of +/- 0.09, 4/6 correct
    expect(accuracy.percentCorrect).toBe("66.67");
  });
});
