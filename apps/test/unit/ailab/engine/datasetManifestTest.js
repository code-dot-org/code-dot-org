import {localizeDatasets} from '@cdo/apps/ailab/engine/datasetManifest';
import I18n from '@cdo/apps/ailab/engine/i18n';

import {
  premadeDatasets,
  premadeDatasetNameLocalized,
  premadeDatasetTranslations,
} from './testData';

beforeEach(() => {
  I18n.initI18n();
});

afterEach(() => {
  I18n.reset();
});

describe('datasetManifest localizeDatasets', () => {
  test('missing translations, returns given datasets', async () => {
    expect(localizeDatasets(premadeDatasets)).toEqual(premadeDatasets);
  });

  test('given translations, returns localized names', async () => {
    I18n.reset();
    I18n.initI18n(premadeDatasetTranslations);
    expect(localizeDatasets(premadeDatasets)[0].name).toEqual(
      premadeDatasetNameLocalized
    );
  });
});
