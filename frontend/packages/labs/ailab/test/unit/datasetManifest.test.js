import {
  premadeDataset,
  premadeDatasets,
  premadeDatasetNameLocalized,
  premadeDatasetTranslations
} from './testData';
import {localizeDatasets} from "../../src/datasetManifest";
import I18n from "../../src/i18n";

beforeEach(() => {
  I18n.initI18n();
});

afterEach(() => {
  I18n.reset();
});

describe("datasetManifest localizeDatasets", () => {
  test("missing translations, returns given datasets", async () => {
    expect(localizeDatasets(premadeDatasets)).toEqual(premadeDatasets);
  });

  test("given translations, returns localized names", async () => {
    I18n.reset();
    I18n.initI18n(premadeDatasetTranslations);
    expect(localizeDatasets(premadeDatasets)[0].name).toEqual(premadeDatasetNameLocalized);
  });
});
