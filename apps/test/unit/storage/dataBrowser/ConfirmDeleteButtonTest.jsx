import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import commonI18n from '@cdo/locale';
import sinon from 'sinon';

import ConfirmDeleteButton from '@cdo/apps/storage/dataBrowser/ConfirmDeleteButton';

describe('ConfirmDeleteButton', () => {
  describe('localization', () => {
    function createConfirmDeleteButton() {
      return shallow(
        <ConfirmDeleteButton
          title="confirm"
          body="body"
          buttonId="buttonId"
          buttonText="buttonText"
          containerStyle="containerStyle"
          onConfirmDelete={() => {}}
        />
      );
    }

    afterEach(() => {
      sinon.restore();
    });

    it('should render a localized string for "Cancel"', () => {
      sinon.stub(commonI18n, 'cancel').returns('i18n-cancel');

      const wrapper = createConfirmDeleteButton();

      let dialog = wrapper.find('Dialog').at(0);
      expect(dialog.prop('cancelText')).to.contain('i18n-cancel');
    });

    it('should render a default localized string for "Delete" as the confirmation text', () => {
      sinon.stub(commonI18n, 'delete').returns('i18n-delete');

      const wrapper = createConfirmDeleteButton();

      let dialog = wrapper.find('Dialog').at(0);
      expect(dialog.prop('confirmText')).to.contain('i18n-delete');
    });
  });
});
