import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import AddTableRow from '@cdo/apps/storage/dataBrowser/AddTableRow';
import commonI18n from '@cdo/locale';

describe('AddTableRow', () => {
  describe('localization', () => {
    function createAddTableRow() {
      return shallow(
        <AddTableRow
          tableName="tableName"
          columnNames={['foo', 'bar']}
          showError={() => {}}
          hideError={() => {}}
        />
      );
    }

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should render a localized string for "Add Row"', () => {
      jest
        .spyOn(commonI18n, 'addRowToTable')
        .mockClear()
        .mockReturnValue('i18n-add-to-table');

      const wrapper = createAddTableRow();

      let addButton = wrapper.find('[id="addTableRowButton"]').at(0);
      expect(addButton.prop('text')).toContain('i18n-add-to-table');
    });

    it('should render a localized string for the placeholder text', () => {
      jest
        .spyOn(commonI18n, 'enterText')
        .mockClear()
        .mockReturnValue('i18n-enter-text');

      const wrapper = createAddTableRow();

      let input = wrapper.find('tr#addDataTableRow input').at(0);
      expect(input.prop('placeholder')).toContain('i18n-enter-text');
    });
  });
});
