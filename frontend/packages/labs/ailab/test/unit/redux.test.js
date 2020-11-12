import { getOptionFrequenciesByColumn } from "../../src/redux.js";

const initialState = {
  data: [
    {
      name: "Plain M&Ms",
      chocolate: "yes",
      nuts: "no",
      fruity: "no",
      delicious: "yes"
    },
    {
      name: "Peanut M&Ms",
      chocolate: "yes",
      nuts: "yes",
      fruity: "no",
      delicious: "yes"
    },
    {
      name: "Snickers",
      chocolate: "yes",
      nuts: "yes",
      fruity: "no",
      delicious: "yes"
    },
    {
      name: "Almond Joy",
      chocolate: "yes",
      nuts: "yes",
      fruity: "no",
      delicious: "yes"
    },
    {
      name: "Black Licorice",
      chocolate: "no",
      nuts: "no",
      fruity: "no",
      delicious: "no"
    },
    {
      name: "Skittles",
      chocolate: "no",
      nuts: "no",
      fruity: "yes",
      delicious: "yes"
    }
  ],
  labelColumn: "delicious",
  selectedFeatures: ["chocolate", "nuts"],
  columnsByDataType: {
    chocolate: "categorical",
    nuts: "categorical",
    delicious: "categorical"
  }
};

describe("redux functions", () => {
  test("getOptionFrequenciesByColumn", async () => {
    const frequencies = getOptionFrequenciesByColumn(initialState);
    expect(frequencies["chocolate"]["yes"]).toBe(4);
    expect(frequencies["chocolate"]["no"]).toBe(2);
    expect(frequencies["nuts"]["yes"]).toBe(3);
    expect(frequencies["nuts"]["no"]).toBe(3);
    expect(frequencies["delicious"]["yes"]).toBe(5);
    expect(frequencies["delicious"]["no"]).toBe(1);
  });
});
