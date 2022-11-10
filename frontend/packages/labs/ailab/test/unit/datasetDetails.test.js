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
  batDatasetDescriptionLocalized,
  premadeDatasetName,
  premadeDatasetTranslations,
  batDatasetUses,
  batDatasetUsesLocalized,
  batDatasetMisuses,
  batDatasetMisusesLocalized
} from './testData';
import I18n from "../../src/i18n";

beforeEach(() => {
  I18n.initI18n();
});

afterEach(() => {
  I18n.reset();
});

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

  test("returns localized description", async () => {
    I18n.reset();
    I18n.initI18n(premadeDatasetTranslations);
    const description = getDatasetDescription(premadeDatasetState);
    expect(description).toBe(batDatasetDescriptionLocalized);
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
    expect(details.potentialUses).toBe(batDatasetUses);
    expect(details.potentialMisuses).toBe(batDatasetMisuses);
  });

  test("returns localized strings", async () => {
    I18n.reset();
    I18n.initI18n(premadeDatasetTranslations);
    const details = getDatasetDetails(premadeDatasetState);
    expect(details.description).toBe(batDatasetDescriptionLocalized);
    expect(details.potentialUses).toBe(batDatasetUsesLocalized);
    expect(details.potentialMisuses).toBe(batDatasetMisusesLocalized);
    I18n.reset();
  });
});
