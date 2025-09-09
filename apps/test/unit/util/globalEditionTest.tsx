import {render} from '@testing-library/react';
import React from 'react';

import {
  getGlobalEditionRegion,
  currentGlobalConfiguration,
} from '@cdo/apps/util/globalEdition';

interface DocumentProps {
  region?: string;
}

const Document: React.FunctionComponent<DocumentProps> = ({region}) => (
  <script data-ge-region={region} />
);

describe('globalEdition', () => {
  describe('getGlobalEditionRegion', () => {
    it('should return the region given in the embedded script data in spite of the location path', () => {
      render(<Document region={'narnia'} />);
      expect(getGlobalEditionRegion()).toBe('narnia');
    });
  });

  describe('currentGlobalConfiguration', () => {
    it('should return the root region configuration when the region is unknown', () => {
      render(<Document region={'bogusweasel'} />);
      // Should match config/global_editions/root.yml
      expect(currentGlobalConfiguration().locales).toEqual(['en-US']);
    });

    it('should return the root region configuration when the region is not in the location', () => {
      render(<Document />);
      // Should match config/global_editions/root.yml
      expect(currentGlobalConfiguration().locales).toEqual(['en-US']);
    });

    it('should return the region configuration for the current region', () => {
      render(<Document region={'fa'} />);
      // Should match config/global_editions/fa.yml
      expect(currentGlobalConfiguration().locales).toEqual(['fa-IR', 'en-US']);
    });
  });
});
