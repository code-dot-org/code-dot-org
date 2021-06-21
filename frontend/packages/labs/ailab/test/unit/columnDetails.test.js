import { getUniqueOptions } from '../../src/helpers/columnDetails.js';
import { classificationState } from './testData';

describe("get unique options", () => {
  test("get unique options", async () => {
    const options = getUniqueOptions(classificationState, 'weather').sort();
    expect(options).toEqual(['sunny', 'rainy', 'overcast'].sort());
  });
});
