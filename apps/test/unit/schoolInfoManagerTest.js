import {assertVisible, assertHidden} from '../util/assertions';
import SchoolInfoManager from '@cdo/apps/schoolInfoManager';
import {enforceDocumentBodyCleanup} from '../util/testUtils';

// This is the very beginning of testing for SchoolInfoManager.
// It can be expanded to give full coverage.
// Right now, it just tests the "assume USA" option.

describe('schoolInfoManagerTest', () => {
  enforceDocumentBodyCleanup({checkEveryTest: true}, () => {
    let rootElement, options;

    beforeEach(() => {
      options = {};

      rootElement = document.createElement('div');
      rootElement.innerHTML = `
      <div id="school-country-group">
      </div>`;
      document.body.appendChild(rootElement);
    });

    afterEach(() => {
      document.body.removeChild(rootElement);
    });

    it('hides country when assume USA', () => {
      const optionsAssumeUsa = {...options, assumeUsa: true};
      SchoolInfoManager(optionsAssumeUsa);
      assertHidden('#school-country-group');
    });

    it('shows country when do not assume USA', () => {
      SchoolInfoManager(options);
      assertVisible('#school-country-group');
    });
  });
});
