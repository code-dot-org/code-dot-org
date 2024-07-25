import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import EditTableRow from '@cdo/apps/storage/dataBrowser/EditTableRow';
import commonI18n from '@cdo/locale';

describe('EditTableRow', () => {
  describe('localization', () => {
    function createEditTableRow() {
      return shallow(
        <EditTableRow
          columnNames={['foo']}
          tableName="tableName"
          record={{foo: 3}}
          readOnly={false}
          showError={() => {}}
          hideError={() => {}}
        />
      );
    }

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should render a localized string for the "Edit" button', () => {
      jest.spyOn(commonI18n, 'edit').mockClear().mockReturnValue('i18n-edit');

      const wrapper = createEditTableRow();

      let button = wrapper.find('button').at(0);
      expect(button.text()).toContain('i18n-edit');
    });

    it('should render a localized string for "Save"', () => {
      jest.spyOn(commonI18n, 'save').mockClear().mockReturnValue('i18n-save');

      const wrapper = createEditTableRow();

      // Ensure it is in 'editing' mode.
      wrapper.setState({isEditing: true});

      let saveButton = wrapper.find('PendingButton').at(0);
      expect(saveButton.prop('text')).toContain('i18n-save');
    });

    it('should render a localized string while saving the row', () => {
      jest
        .spyOn(commonI18n, 'saving')
        .mockClear()
        .mockReturnValue('i18n-saving');

      const wrapper = createEditTableRow();

      // Ensure it is in 'editing' mode.
      wrapper.setState({isEditing: true});

      let saveButton = wrapper.find('PendingButton').at(0);
      expect(saveButton.prop('pendingText')).toContain('i18n-saving');
    });

    it('should render a localized string for "Delete"', () => {
      jest
        .spyOn(commonI18n, 'delete')
        .mockClear()
        .mockReturnValue('i18n-delete');

      const wrapper = createEditTableRow();

      let deleteButton = wrapper.find('PendingButton').at(0);
      expect(deleteButton.prop('text')).toContain('i18n-delete');
    });

    it('should render a localized string while saving the row', () => {
      jest
        .spyOn(commonI18n, 'deletingWithEllipsis')
        .mockClear()
        .mockReturnValue('i18n-deleting');

      const wrapper = createEditTableRow();

      let deleteButton = wrapper.find('PendingButton').at(0);
      expect(deleteButton.prop('pendingText')).toContain('i18n-deleting');
    });
  });
});
