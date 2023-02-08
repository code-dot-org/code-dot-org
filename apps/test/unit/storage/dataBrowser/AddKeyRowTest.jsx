import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import commonI18n from '@cdo/locale';
import sinon from 'sinon';

import AddKeyRow from '@cdo/apps/storage/dataBrowser/AddKeyRow';

describe('AddKeyRow', () => {
  describe('localization', () => {
    function createAddKeyRow() {
      return shallow(
        <AddKeyRow
          onShowWarning={() => {}}
          showError={() => {}}
          hideError={() => {}}
        />
      );
    }

    afterEach(() => {
      sinon.restore();
    });

    it('should render a localized string for "Add Pair"', () => {
      sinon.stub(commonI18n, 'addPairToTable').returns('i18n-add-to-table');

      const wrapper = createAddKeyRow();

      let addButton = wrapper.find('PendingButton').at(0);
      expect(addButton.prop('text')).to.contain('i18n-add-to-table');
    });

    it('should render a localized string while adding the row', () => {
      sinon.stub(commonI18n, 'addingToTable').returns('i18n-adding-to-table');

      const wrapper = createAddKeyRow();

      let addButton = wrapper.find('PendingButton').at(0);
      expect(addButton.prop('pendingText')).to.contain('i18n-adding-to-table');
    });

    it('should render a localized string for the placeholder text', () => {
      sinon.stub(commonI18n, 'enterText').returns('i18n-enter-text');

      const wrapper = createAddKeyRow();

      let input = wrapper.find('tr#uitest-addKeyValuePairRow input').at(0);
      expect(input.prop('placeholder')).to.contain('i18n-enter-text');
    });
  });
});
