import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import ColumnMenu from '@cdo/apps/storage/dataBrowser/ColumnMenu';
import commonI18n from '@cdo/locale';

describe('ColumnMenu', () => {
  describe('localization', () => {
    function createColumn() {
      return shallow(
        <ColumnMenu
          coerceColumn={() => {}}
          handleDelete={() => {}}
          handleRename={() => {}}
          isEditable={true}
        />
      );
    }

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should render a localized string for "Rename"', () => {
      jest
        .spyOn(commonI18n, 'rename')
        .mockClear()
        .mockReturnValue('i18n-rename');

      const wrapper = createColumn();

      let menuItem = wrapper.find('li').at(0);
      let menuLink = menuItem.find('a');
      expect(menuLink.text()).toContain('i18n-rename');
    });

    it('should render a localized string for "Delete"', () => {
      jest
        .spyOn(commonI18n, 'delete')
        .mockClear()
        .mockReturnValue('i18n-delete');

      const wrapper = createColumn();

      let menuItem = wrapper.find('li').at(1);
      let menuLink = menuItem.find('a');
      expect(menuLink.text()).toContain('i18n-delete');
    });

    it('should render a localized string for "Convert to string"', () => {
      jest
        .spyOn(commonI18n, 'dataTableConvertToString')
        .mockClear()
        .mockReturnValue('i18n-ctos');

      const wrapper = createColumn();

      let menuItem = wrapper.find('li').at(2);
      let menuLink = menuItem.find('a');
      expect(menuLink.text()).toContain('i18n-ctos');
    });

    it('should render a localized number for "Convert to number"', () => {
      jest
        .spyOn(commonI18n, 'dataTableConvertToNumber')
        .mockClear()
        .mockReturnValue('i18n-cton');

      const wrapper = createColumn();

      let menuItem = wrapper.find('li').at(3);
      let menuLink = menuItem.find('a');
      expect(menuLink.text()).toContain('i18n-cton');
    });

    it('should render a localized boolean for "Convert to boolean"', () => {
      jest
        .spyOn(commonI18n, 'dataTableConvertToBoolean')
        .mockClear()
        .mockReturnValue('i18n-ctob');

      const wrapper = createColumn();

      let menuItem = wrapper.find('li').at(4);
      let menuLink = menuItem.find('a');
      expect(menuLink.text()).toContain('i18n-ctob');
    });
  });
});
