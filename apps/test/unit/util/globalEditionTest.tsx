import {
  getGlobalEditionRegion,
  currentGlobalConfiguration,
} from '@cdo/apps/util/globalEdition';

const setGlobalEditionRegion = (region?: string) => {
  document.documentElement.dataset.geRegion = region;
};

describe('globalEdition', () => {
  describe('getGlobalEditionRegion', () => {
    it('should return the region given in the embedded html data in spite of the location path', () => {
      setGlobalEditionRegion('narnia');
      expect(getGlobalEditionRegion()).toBe('narnia');
    });
  });

  describe('currentGlobalConfiguration', () => {
    it('should return the root region configuration when the region is unknown', () => {
      setGlobalEditionRegion('bogusweasel');
      // Should match config/global_editions/root.yml
      expect(currentGlobalConfiguration().locales).toEqual(['en-US']);
    });

    it('should return the root region configuration when the region is not in the location', () => {
      setGlobalEditionRegion();
      // Should match config/global_editions/root.yml
      expect(currentGlobalConfiguration().locales).toEqual(['en-US']);
    });

    it('should return the region configuration for the current region', () => {
      setGlobalEditionRegion('fa');
      // Should match config/global_editions/fa.yml
      expect(currentGlobalConfiguration().locales).toEqual(['fa-IR']);

      setGlobalEditionRegion('in');
      // Should match config/global_editions/in.yml
      expect(currentGlobalConfiguration().locales).toEqual([
        'en-IN',
        'hi-IN',
        'ta-IN',
        'te-IN',
        'mr-IN',
        'kn-IN',
      ]);
    });
  });
});
