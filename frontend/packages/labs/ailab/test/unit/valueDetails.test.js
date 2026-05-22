import {getLocalizedValue} from '../../src/helpers/valueDetails';
import {
  premadeDatasetValueLocalized,
  premadeDatasetTranslations,
} from './testData';
import I18n from '../../src/i18n';

beforeEach(() => {
  I18n.initI18n();
});

afterEach(() => {
  I18n.reset();
});

describe('getLocalizedValue', () => {
  test('returns the fallback value', async () => {
    const result = getLocalizedValue('value', 'dataset-id');
    expect(result).toEqual('value');
  });

  test('returns the localized value', async () => {
    I18n.reset();
    I18n.initI18n(premadeDatasetTranslations);
    const result = getLocalizedValue('value', 'bats_eat_mozzies');
    expect(result).toEqual(premadeDatasetValueLocalized);
  });
});
