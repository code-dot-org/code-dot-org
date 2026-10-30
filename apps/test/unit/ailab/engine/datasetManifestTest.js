import fs from 'fs';
import path from 'path';

import {parseCsvText} from '@cdo/apps/ailab/engine/csvReaderWrapper';
import {
  getRawDatasets,
  localizeDatasets,
} from '@cdo/apps/ailab/engine/datasetManifest';
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

describe('datasetManifest rowCount', () => {
  const assetDir = path.join(__dirname, '../../../../static/skins/ailab');

  test.each(getRawDatasets().map(dataset => [dataset.id, dataset]))(
    '%s matches the rows its CSV loads',
    async (_id, dataset) => {
      const csv = fs.readFileSync(path.join(assetDir, dataset.path), 'utf8');
      expect(parseCsvText(csv).rows.length).toBe(dataset.rowCount);
    }
  );
});
