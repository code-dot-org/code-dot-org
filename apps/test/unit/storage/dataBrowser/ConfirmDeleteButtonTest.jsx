import Dialog from '@code-dot-org/component-library/dialog';
import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import ConfirmDeleteButton from '@cdo/apps/storage/dataBrowser/ConfirmDeleteButton';
import commonI18n from '@cdo/locale';

describe('ConfirmDeleteButton', () => {
  describe('localization', () => {
    function createOpenConfirmDeleteButton() {
      const wrapper = shallow(
        <ConfirmDeleteButton
          title="confirm"
          body="body"
          buttonId="buttonId"
          buttonText="buttonText"
          containerStyle="containerStyle"
          onConfirmDelete={() => {}}
        />
      );
      wrapper.setState({open: true});
      return wrapper;
    }

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should render a localized string for "Cancel"', () => {
      jest
        .spyOn(commonI18n, 'cancel')
        .mockClear()
        .mockReturnValue('i18n-cancel');

      const wrapper = createOpenConfirmDeleteButton();

      const dialog = wrapper.find(Dialog).at(0);
      expect(dialog.prop('secondaryButtonProps').children).toContain(
        'i18n-cancel'
      );
    });

    it('should render a default localized string for "Delete" as the confirmation text', () => {
      jest
        .spyOn(commonI18n, 'delete')
        .mockClear()
        .mockReturnValue('i18n-delete');

      const wrapper = createOpenConfirmDeleteButton();

      const dialog = wrapper.find(Dialog).at(0);
      expect(dialog.prop('primaryButtonProps').children).toContain(
        'i18n-delete'
      );
    });
  });
});
