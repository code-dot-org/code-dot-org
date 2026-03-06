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

      let button = wrapper.find('[id="editKeyValueButton"]').at(0);
      expect(button.prop('text')).toContain('i18n-edit');
    });

    it('should render a localized string for "Save"', () => {
      jest.spyOn(commonI18n, 'save').mockClear().mockReturnValue('i18n-save');

      const wrapper = createEditKeyRow();

      // Ensure it is in 'editing' mode.
      wrapper.setState({isEditing: true});

      let saveButton = wrapper.find('[id="saveKeyValueButton"]').at(0);
      expect(saveButton.prop('text')).toContain('i18n-save');
    });

    it('should render a localized string for "Delete"', () => {
      jest
        .spyOn(commonI18n, 'delete')
        .mockClear()
        .mockReturnValue('i18n-delete');

      const wrapper = createEditKeyRow();

      let deleteButton = wrapper.find('[id="deleteKeyValueButton"]').at(0);
      expect(deleteButton.prop('text')).toContain('i18n-delete');
    });
  });
});
