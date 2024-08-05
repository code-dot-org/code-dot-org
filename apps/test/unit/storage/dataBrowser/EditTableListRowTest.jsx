import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import EditTableListRow from '@cdo/apps/storage/dataBrowser/EditTableListRow';
import commonI18n from '@cdo/locale';

describe('EditTableListRow', () => {
  describe('localization', () => {
    function createEditTableListRow() {
      return shallow(
        <EditTableListRow
          onViewChange={() => {}}
          tableName="tableName"
          tableType="data"
        />
      );
    }

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should render a localized string for delete button text', () => {
      jest
        .spyOn(commonI18n, 'delete')
        .mockClear()
        .mockReturnValue('i18n-delete');

      const wrapper = createEditTableListRow();

      let deleteButton = wrapper.find('ConfirmDeleteButton').at(0);
      expect(deleteButton.prop('buttonText')).toContain('i18n-delete');
    });

    it('should render a localized string for delete confirmation', () => {
      jest
        .spyOn(commonI18n, 'deleteTableConfirm')
        .mockClear()
        .mockReturnValue('i18n-delete-body');

      const wrapper = createEditTableListRow();

      let deleteButton = wrapper.find('ConfirmDeleteButton').at(0);
      expect(deleteButton.prop('body')).toContain('i18n-delete-body');
    });

    it('should render a localized string for delete confirmation title', () => {
      jest
        .spyOn(commonI18n, 'deleteTable')
        .mockClear()
        .mockReturnValue('i18n-delete-table');

      const wrapper = createEditTableListRow();

      let deleteButton = wrapper.find('ConfirmDeleteButton').at(0);
      expect(deleteButton.prop('title')).toContain('i18n-delete-table');
    });
  });
});
