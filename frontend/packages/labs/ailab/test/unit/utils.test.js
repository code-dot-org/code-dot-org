import {
  isEmpty,
  getKeyByValue,
  areArraysEqual,
  arrayIntersection,
  getRandomInt
} from '../../src/helpers/utils.js';

const menu = {
  breakfast: "pancakes",
  lunch: "sushi",
  dinner: "lasagna"
};

const flavors = ["chocolate", "vanilla", "strawberry"];

describe("isEmpty", () => {
  test("empty", async () => {
    const result = isEmpty({});
    expect(result).toBe(true);
  });

  test("not empty", async () => {
    const result = isEmpty(menu);
    expect(result).toBe(false);
  });
});

describe("getKeyByValue", () => {
  test("key not in object", async () => {
    const result = getKeyByValue(menu, "waffles");
    expect(result).toBe(undefined);
  });

  test("key in object", async () => {
    const result = getKeyByValue(menu, "sushi");
    expect(result).toBe("lunch");
  });
});

describe("areArraysEqual", () => {
  test("equal", async () => {
    const result = areArraysEqual(flavors, flavors);
    expect(result).toBe(true);
  });

  test("not equal - order matters", async () => {
    const sortedFlavors = ["chocolate", "strawberry", "vanilla"];
    const result = areArraysEqual(flavors, sortedFlavors);
    expect(result).toBe(false);
  });

  test("not equal", async () => {
    const result = areArraysEqual(flavors, []);
    expect(result).toBe(false);
  });
});

describe("arrayIntersection", () => {
  test("element in both", async () => {
    const berries = ["strawberry", "raspberry"]
    const result = arrayIntersection(flavors, berries);
    expect(result).toEqual(["strawberry"]);
  });

  test("no intersection", async () => {
    const empty = [];
    const result = arrayIntersection(flavors, empty);
    expect(result).toEqual(empty);
  });
});

describe("getRandomInt", () => {
  let max = 5;

  test("random int is never greater than max", async () => {
    const result = getRandomInt(max)
    expect(result).toBeLessThan(max);
  });

  test("random int is one of expected values", async () => {
    let possibleValues = [0, 1, 2, 3, 4];
    const result = getRandomInt(max)
    expect(possibleValues.includes(result)).toBe(true);
  });
});
