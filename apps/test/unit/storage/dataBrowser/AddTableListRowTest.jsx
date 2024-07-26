import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import AddTableListRow from '@cdo/apps/storage/dataBrowser/AddTableListRow';
import commonI18n from '@cdo/locale';

describe('AddTableListRow', () => {
  describe('localization', () => {
    function createAddTableListRow() {
      return shallow(<AddTableListRow onTableAdd={() => {}} />);
    }

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should render a localized string for placeholder text', () => {
      jest
        .spyOn(commonI18n, 'dataTableNamePlaceholder')
        .mockClear()
        .mockReturnValue('i18n-holder');

      const wrapper = createAddTableListRow();

      let input = wrapper.find('input').at(0);
      expect(input.prop('placeholder')).toContain('i18n-holder');
    });

    it('should render a localized string for "Add"', () => {
      jest.spyOn(commonI18n, 'add').mockClear().mockReturnValue('i18n-add');

      const wrapper = createAddTableListRow();

      let addButton = wrapper.find('button.uitest-add-table-btn').at(0);
      expect(addButton.text()).toContain('i18n-add');
    });
  });
});
