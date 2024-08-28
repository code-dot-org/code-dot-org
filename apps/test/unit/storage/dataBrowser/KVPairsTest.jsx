import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {UnconnectedKVPairs as KVPairs} from '@cdo/apps/storage/dataBrowser/KVPairs';
import commonI18n from '@cdo/locale';

describe('KVPairs', () => {
  describe('localization', () => {
    function createKVPairs() {
      return shallow(
        <KVPairs
          view="TABLE"
          keyValueData={{foo: 3}}
          onShowWarning={() => {}}
          onViewChange={() => {}}
        />
      );
    }

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should render a localized strings for every column header', () => {
      jest
        .spyOn(commonI18n, 'actions')
        .mockClear()
        .mockReturnValue('i18n-actions');
      jest
        .spyOn(commonI18n, 'dataTableKey')
        .mockClear()
        .mockReturnValue('i18n-data-table-key');
      jest
        .spyOn(commonI18n, 'dataTableValue')
        .mockClear()
        .mockReturnValue('i18n-data-table-value');

      const wrapper = createKVPairs();

      // Get the KV table itself.
      let table = wrapper.find('table.uitest-kv-table');

      // Each column header is localized.
      let keyHeader = table.find('th').at(0);
      let valueHeader = table.find('th').at(1);
      let actionsHeader = table.find('th').at(2);

      expect(keyHeader.text()).toContain('i18n-data-table-key');
      expect(valueHeader.text()).toContain('i18n-data-table-value');
      expect(actionsHeader.text()).toContain('i18n-actions');
    });
  });
});
