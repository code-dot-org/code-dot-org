import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import sinon from 'sinon';

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
      sinon.restore();
    });

    it('should render a localized strings for every column header', () => {
      sinon.stub(commonI18n, 'actions').returns('i18n-actions');
      sinon.stub(commonI18n, 'dataTableKey').returns('i18n-data-table-key');
      sinon.stub(commonI18n, 'dataTableValue').returns('i18n-data-table-value');

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
