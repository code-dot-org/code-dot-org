import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import ConfirmImportButton from '@cdo/apps/storage/dataBrowser/ConfirmImportButton';
import commonI18n from '@cdo/locale';

describe('ConfirmImportButton', () => {
  describe('localization', () => {
    function createConfirmImportButton() {
      return shallow(
        <ConfirmImportButton
          importCsv={() => {}}
          containerStyle="containerStyle"
        />
      );
    }

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should render a localized string for the confirmation message', () => {
      jest
        .spyOn(commonI18n, 'confirmImportOverwrite')
        .mockClear()
        .mockReturnValue('i18n-confirm');

      const wrapper = createConfirmImportButton();

      let dialog = wrapper.find('Dialog').at(0);
      expect(dialog.prop('body')).toContain('i18n-confirm');
    });

    it('should render a localized string for "Cancel"', () => {
      jest
        .spyOn(commonI18n, 'cancel')
        .mockClear()
        .mockReturnValue('i18n-cancel');

      const wrapper = createConfirmImportButton();

      let dialog = wrapper.find('Dialog').at(0);
      expect(dialog.prop('cancelText')).toContain('i18n-cancel');
    });

    it('should render a localized string for "Yes"', () => {
      jest.spyOn(commonI18n, 'yes').mockClear().mockReturnValue('i18n-yes');

      const wrapper = createConfirmImportButton();

      let dialog = wrapper.find('Dialog').at(0);
      expect(dialog.prop('confirmText')).toContain('i18n-yes');
    });

    it('should render a localized string for the confirm title', () => {
      jest
        .spyOn(commonI18n, 'confirmImportOverwriteTitle')
        .mockClear()
        .mockReturnValue('i18n-ct');

      const wrapper = createConfirmImportButton();

      let dialog = wrapper.find('Dialog').at(0);
      expect(dialog.prop('title')).toContain('i18n-ct');
    });

    it('should render a localized string while importing', () => {
      jest
        .spyOn(commonI18n, 'importingWithEllipsis')
        .mockClear()
        .mockReturnValue('i18n-importing');

      const wrapper = createConfirmImportButton();

      let button = wrapper.find('PendingButton').at(0);
      expect(button.prop('pendingText')).toContain('i18n-importing');
    });

    it('should render a localized string for the import button', () => {
      jest
        .spyOn(commonI18n, 'importCSV')
        .mockClear()
        .mockReturnValue('i18n-import');

      const wrapper = createConfirmImportButton();

      let button = wrapper.find('PendingButton').at(0);
      expect(button.prop('text')).toContain('i18n-import');
    });
  });
});
