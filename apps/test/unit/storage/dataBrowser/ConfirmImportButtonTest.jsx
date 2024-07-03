import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import sinon from 'sinon';

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
      sinon.restore();
    });

    it('should render a localized string for the confirmation message', () => {
      sinon.stub(commonI18n, 'confirmImportOverwrite').returns('i18n-confirm');

      const wrapper = createConfirmImportButton();

      let dialog = wrapper.find('Dialog').at(0);
      expect(dialog.prop('body')).toContain('i18n-confirm');
    });

    it('should render a localized string for "Cancel"', () => {
      sinon.stub(commonI18n, 'cancel').returns('i18n-cancel');

      const wrapper = createConfirmImportButton();

      let dialog = wrapper.find('Dialog').at(0);
      expect(dialog.prop('cancelText')).toContain('i18n-cancel');
    });

    it('should render a localized string for "Yes"', () => {
      sinon.stub(commonI18n, 'yes').returns('i18n-yes');

      const wrapper = createConfirmImportButton();

      let dialog = wrapper.find('Dialog').at(0);
      expect(dialog.prop('confirmText')).toContain('i18n-yes');
    });

    it('should render a localized string for the confirm title', () => {
      sinon.stub(commonI18n, 'confirmImportOverwriteTitle').returns('i18n-ct');

      const wrapper = createConfirmImportButton();

      let dialog = wrapper.find('Dialog').at(0);
      expect(dialog.prop('title')).toContain('i18n-ct');
    });

    it('should render a localized string while importing', () => {
      sinon.stub(commonI18n, 'importingWithEllipsis').returns('i18n-importing');

      const wrapper = createConfirmImportButton();

      let button = wrapper.find('PendingButton').at(0);
      expect(button.prop('pendingText')).toContain('i18n-importing');
    });

    it('should render a localized string for the import button', () => {
      sinon.stub(commonI18n, 'importCSV').returns('i18n-import');

      const wrapper = createConfirmImportButton();

      let button = wrapper.find('PendingButton').at(0);
      expect(button.prop('text')).toContain('i18n-import');
    });
  });
});
