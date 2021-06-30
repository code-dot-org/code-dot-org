import {
  isUserUploadedDataset,
  getDatasetDescription,
  getDatasetDetails
} from '../../src/helpers/datasetDetails';
import {
  userUploadedDatasetState,
  premadeDatasetState,
  playDatasetDescription,
  batDatasetDescription,
  premadeDatasetName
} from './testData';

describe("isUserUploadedDataset", () => {
  test("user uploaded dataset", async () => {
    expect(isUserUploadedDataset(userUploadedDatasetState)).toBe(true);
  });

  test("not user uploaded dataset", async () => {
    expect(isUserUploadedDataset(premadeDatasetState)).toBe(false);
  });
});

describe("getDatasetDescription", () => {
  test("user uploaded dataset", async () => {
    const description = getDatasetDescription(userUploadedDatasetState);
    expect(description).toBe(playDatasetDescription);
  });

  test("not user uploaded dataset", async () => {
    const description = getDatasetDescription(premadeDatasetState);
    expect(description).toBe(batDatasetDescription);
  });
});

describe("getDatasetDetails", () => {
  test("user uploaded dataset", async () => {
    const details = getDatasetDetails(userUploadedDatasetState);
    expect(details.name).toBe(undefined);
    expect(details.description).toBe(playDatasetDescription);
    expect(details.numRows).toBe(userUploadedDatasetState.data.length);
    expect(details.isUserUploaded).toBe(true);
  });

  test("not user uploaded dataset", async () => {
    const details = getDatasetDetails(premadeDatasetState);
    expect(details.name).toBe(premadeDatasetName);
    expect(details.description).toBe(batDatasetDescription);
    expect(details.numRows).toBe(premadeDatasetState.data.length);
    expect(details.isUserUploaded).toBe(false);
  });
});
