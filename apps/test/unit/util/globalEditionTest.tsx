import {render} from '@testing-library/react';
import cookies from 'js-cookie';
import React from 'react';
//import {* as jsCookie} from 'js-cookie';

import {
  getGlobalEditionRegionFromLocation,
  getGlobalEditionRegion,
  currentGlobalConfiguration,
} from '@cdo/apps/util/globalEdition';

let oldWindowLocation: Location | undefined;
const mockLocation = (url: string) => {
  oldWindowLocation ||= window.location;
  const newLocation = new URL(url);
  Object.defineProperty(window, 'location', {
    get: () => newLocation,
    enumerable: true,
    configurable: true,
  });
};

const restoreLocation = () => {
  const newLocation = new URL(
    oldWindowLocation?.href || 'https://localhost-studio.code.org'
  );
  Object.defineProperty(window, 'location', {
    get: () => newLocation,
    enumerable: true,
    configurable: true,
  });
  oldWindowLocation = undefined;
};

interface DocumentProps {
  region: string;
}

const Document: React.FunctionComponent<DocumentProps> = ({region}) => (
  <script data-ge-region={region} />
);

describe('globalEdition', () => {
  describe('getGlobalEditionRegionFromLocation', () => {
    afterEach(() => {
      restoreLocation();
    });

    it('should return the region given in the location path', () => {
      mockLocation('https://studio.code.org/global/fa/teacher_dashboard');

      expect(getGlobalEditionRegionFromLocation()).toBe('fa');
    });

    it('should return root if the location path has no region', () => {
      mockLocation('https://studio.code.org/teacher_dashboard');

      expect(getGlobalEditionRegionFromLocation()).toBe('root');
    });

    it('should return root if the location path has no known region', () => {
      mockLocation(
        'https://studio.code.org/global/bogusweasel/teacher_dashboard'
      );

      expect(getGlobalEditionRegionFromLocation()).toBe('root');
    });
  });

  describe('getGlobalEditionRegion', () => {
    afterEach(() => {
      restoreLocation();
    });

    it('should return the region given in the embedded script data in spite of the location path', () => {
      mockLocation('https://studio.code.org/global/fa/teacher_dashboard');

      render(<Document region={'narnia'} />);

      expect(getGlobalEditionRegion()).toBe('narnia');
    });

    it('should return the region given in the embedded script data in spite of the current cookie', () => {
      mockLocation('https://studio.code.org/global/fa/teacher_dashboard');

      render(<Document region={'narnia'} />);

      cookies.set('ge_region', 'middle-earth');

      expect(getGlobalEditionRegion()).toBe('narnia');

      cookies.remove('ge_region');
    });

    it('should return the region given in the cookie if there is no script in spite of the location path', () => {
      mockLocation('https://studio.code.org/global/fa/teacher_dashboard');

      cookies.set('ge_region', 'middle-earth');

      expect(getGlobalEditionRegion()).toBe('middle-earth');

      cookies.remove('ge_region');
    });

    it('should return the region given in the location path when no script data exists', () => {
      mockLocation('https://studio.code.org/global/fa/teacher_dashboard');

      expect(getGlobalEditionRegion()).toBe('fa');
    });

    it('should return root if the location path has no region when no script data exists', () => {
      mockLocation('https://studio.code.org/teacher_dashboard');

      expect(getGlobalEditionRegion()).toBe('root');
    });

    it('should return root if the location path has no known region when no script data exists', () => {
      mockLocation(
        'https://studio.code.org/global/bogusweasel/teacher_dashboard'
      );

      expect(getGlobalEditionRegion()).toBe('root');
    });
  });

  describe('currentGlobalConfiguration', () => {
    afterEach(() => {
      restoreLocation();
    });

    it('should return the Farsi region configuration when the region is "fa"', () => {
      mockLocation('https://studio.code.org/global/fa/teacher_dashboard');

      // Should match config/global_editions/fa.yml
      expect(currentGlobalConfiguration().locales).toEqual(['fa-IR', 'en-US']);
    });

    it('should return the root region configuration when the region is unknown', () => {
      mockLocation(
        'https://studio.code.org/global/bogusweasel/teacher_dashboard'
      );

      // Should match config/global_editions/fa.yml
      expect(currentGlobalConfiguration().locales).toEqual(['en-US']);
    });

    it('should return the root region configuration when the region is not in the location', () => {
      mockLocation('https://studio.code.org/teacher_dashboard');

      // Should match config/global_editions/fa.yml
      expect(currentGlobalConfiguration().locales).toEqual(['en-US']);
    });

    it('should return the region configuration for the given cookie', () => {
      mockLocation('https://studio.code.org/teacher_dashboard');

      cookies.set('ge_region', 'fa');

      // Should match config/global_editions/fa.yml
      expect(currentGlobalConfiguration().locales).toEqual(['fa-IR', 'en-US']);

      cookies.remove('ge_region');
    });

    it('should return the region configuration for the region described by the embedded script data', () => {
      mockLocation('https://studio.code.org/teacher_dashboard');

      render(<Document region={'fa'} />);

      // Should match config/global_editions/fa.yml
      expect(currentGlobalConfiguration().locales).toEqual(['fa-IR', 'en-US']);
    });
  });
});
