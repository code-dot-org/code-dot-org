import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import AddKeyRow from '@cdo/apps/storage/dataBrowser/AddKeyRow';
import commonI18n from '@cdo/locale';

describe('AddKeyRow', () => {
  describe('localization', () => {
    function createAddKeyRow() {
      return shallow(
        <AddKeyRow
          onShowWarning={() => {}}
          showError={() => {}}
          hideError={() => {}}
        />
      );
    }

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should render a localized string for "Add Pair"', () => {
      jest
        .spyOn(commonI18n, 'addPairToTable')
        .mockClear()
        .mockReturnValue('i18n-add-to-table');

      const wrapper = createAddKeyRow();

      let addButton = wrapper.find('PendingButton').at(0);
      expect(addButton.prop('text')).toContain('i18n-add-to-table');
    });

    it('should render a localized string while adding the row', () => {
      jest
        .spyOn(commonI18n, 'addingToTable')
        .mockClear()
        .mockReturnValue('i18n-adding-to-table');

      const wrapper = createAddKeyRow();

      let addButton = wrapper.find('PendingButton').at(0);
      expect(addButton.prop('pendingText')).toContain('i18n-adding-to-table');
    });

    it('should render a localized string for the placeholder text', () => {
      jest
        .spyOn(commonI18n, 'enterText')
        .mockClear()
        .mockReturnValue('i18n-enter-text');

      const wrapper = createAddKeyRow();

      let input = wrapper.find('tr#uitest-addKeyValuePairRow input').at(0);
      expect(input.prop('placeholder')).toContain('i18n-enter-text');
    });
  });
});
