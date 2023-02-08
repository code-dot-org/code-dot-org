import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import commonI18n from '@cdo/locale';
import sinon from 'sinon';

import ConfirmImportButton from '@cdo/apps/storage/dataBrowser/ConfirmImportButton';

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
      expect(dialog.prop('body')).to.contain('i18n-confirm');
    });

    it('should render a localized string for "Cancel"', () => {
      sinon.stub(commonI18n, 'cancel').returns('i18n-cancel');

      const wrapper = createConfirmImportButton();

      let dialog = wrapper.find('Dialog').at(0);
      expect(dialog.prop('cancelText')).to.contain('i18n-cancel');
    });

    it('should render a localized string for "Yes"', () => {
      sinon.stub(commonI18n, 'yes').returns('i18n-yes');

      const wrapper = createConfirmImportButton();

      let dialog = wrapper.find('Dialog').at(0);
      expect(dialog.prop('confirmText')).to.contain('i18n-yes');
    });

    it('should render a localized string for the confirm title', () => {
      sinon.stub(commonI18n, 'confirmImportOverwriteTitle').returns('i18n-ct');

      const wrapper = createConfirmImportButton();

      let dialog = wrapper.find('Dialog').at(0);
      expect(dialog.prop('title')).to.contain('i18n-ct');
    });

    it('should render a localized string while importing', () => {
      sinon.stub(commonI18n, 'importingWithEllipsis').returns('i18n-importing');

      const wrapper = createConfirmImportButton();

      let button = wrapper.find('PendingButton').at(0);
      expect(button.prop('pendingText')).to.contain('i18n-importing');
    });

    it('should render a localized string for the import button', () => {
      sinon.stub(commonI18n, 'importCSV').returns('i18n-import');

      const wrapper = createConfirmImportButton();

      let button = wrapper.find('PendingButton').at(0);
      expect(button.prop('text')).to.contain('i18n-import');
    });
  });
});
