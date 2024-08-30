import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import EditKeyRow from '@cdo/apps/storage/dataBrowser/EditKeyRow';
import commonI18n from '@cdo/locale';

describe('EditKeyRow', () => {
  describe('localization', () => {
    function createEditKeyRow() {
      return shallow(
        <EditKeyRow
          keyName="foo"
          value="bar"
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

      const wrapper = createEditKeyRow();

      let button = wrapper.find('button').at(0);
      expect(button.text()).toContain('i18n-edit');
    });

    it('should render a localized string for "Save"', () => {
      jest.spyOn(commonI18n, 'save').mockClear().mockReturnValue('i18n-save');

      const wrapper = createEditKeyRow();

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

      const wrapper = createEditKeyRow();

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

      const wrapper = createEditKeyRow();

      let deleteButton = wrapper.find('PendingButton').at(0);
      expect(deleteButton.prop('text')).toContain('i18n-delete');
    });

    it('should render a localized string while saving the row', () => {
      jest
        .spyOn(commonI18n, 'deletingWithEllipsis')
        .mockClear()
        .mockReturnValue('i18n-deleting');

      const wrapper = createEditKeyRow();

      let deleteButton = wrapper.find('PendingButton').at(0);
      expect(deleteButton.prop('pendingText')).toContain('i18n-deleting');
    });
  });
});
