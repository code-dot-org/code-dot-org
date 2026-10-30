import {
  getGlobalEditionRegion,
  currentGlobalConfiguration,
  stripGlobalEditionPrefix,
} from '@cdo/apps/util/globalEdition';
import {Regions} from '@cdo/generated-scripts/globalRegionConstants';
import {GlobalEditionDefaultRegion} from '@cdo/generated-scripts/sharedConstants';

const setGlobalEditionRegion = (region: string) => {
  document.documentElement.dataset.geRegion = region;
};

const clearGlobalEditionRegion = () => {
  delete document.documentElement.dataset.geRegion;
};

describe('globalEdition', () => {
  const defaultConfig = Regions[GlobalEditionDefaultRegion];

  afterEach(() => {
    clearGlobalEditionRegion();
  });

  describe('default configuration', () => {
    it('should be present', () => {
      expect(defaultConfig).toEqual(expect.any(Object));
      expect(defaultConfig.header).toEqual(expect.any(Object));
      expect(defaultConfig.footer).toEqual(expect.any(Object));
    });
  });

  describe('getGlobalEditionRegion', () => {
    it('should return the region given in the embedded html data in spite of the location path', () => {
      setGlobalEditionRegion('narnia');
      expect(getGlobalEditionRegion()).toBe('narnia');
    });

    it('should return null when no region is given in the embedded html data', () => {
      clearGlobalEditionRegion();
      expect(getGlobalEditionRegion()).toBeNull();
    });
  });

  describe('currentGlobalConfiguration', () => {
    it('should return the default region configuration when the region is unknown', () => {
      setGlobalEditionRegion('bogusweasel');
      // Should match config/global_editions/us.yml
      expect(currentGlobalConfiguration()).toEqual(defaultConfig);
    });

    it('should return the default region configuration when no region is given in the embedded html data', () => {
      clearGlobalEditionRegion();
      // Should match config/global_editions/us.yml
      expect(currentGlobalConfiguration()).toEqual(defaultConfig);
    });

    it('should return the region configuration for the current region', () => {
      setGlobalEditionRegion('fa');
      // Should match config/global_editions/fa.yml
      expect(currentGlobalConfiguration().locales).toEqual(['fa-IR']);
    });
  });

  describe('stripGlobalEditionPrefix', () => {
    it('strips the current region prefix', () => {
      setGlobalEditionRegion('br');
      expect(stripGlobalEditionPrefix('/br/courses/csp-2025')).toBe(
        '/courses/csp-2025'
      );
    });

    it('strips the locale segment for multi-locale regions', () => {
      setGlobalEditionRegion('in');
      expect(stripGlobalEditionPrefix('/in/hi/courses/csp-2025')).toBe(
        '/courses/csp-2025'
      );
    });

    it('leaves paths without the region prefix unchanged', () => {
      setGlobalEditionRegion('br');
      expect(stripGlobalEditionPrefix('/courses/csp-2025')).toBe(
        '/courses/csp-2025'
      );
      expect(stripGlobalEditionPrefix('/brazil/home')).toBe('/brazil/home');
    });
  });
});
