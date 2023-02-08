import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import commonI18n from '@cdo/locale';
import sinon from 'sinon';

import AddTableRow from '@cdo/apps/storage/dataBrowser/AddTableRow';

describe('AddTableRow', () => {
  describe('localization', () => {
    function createAddTableRow() {
      return shallow(
        <AddTableRow
          tableName="tableName"
          columnNames={['foo', 'bar']}
          showError={() => {}}
          hideError={() => {}}
        />
      );
    }

    afterEach(() => {
      sinon.restore();
    });

    it('should render a localized string for "Add Row"', () => {
      sinon.stub(commonI18n, 'addRowToTable').returns('i18n-add-to-table');

      const wrapper = createAddTableRow();

      let addButton = wrapper.find('PendingButton').at(0);
      expect(addButton.prop('text')).to.contain('i18n-add-to-table');
    });

    it('should render a localized string while adding the row', () => {
      sinon.stub(commonI18n, 'addingToTable').returns('i18n-adding-to-table');

      const wrapper = createAddTableRow();

      let addButton = wrapper.find('PendingButton').at(0);
      expect(addButton.prop('pendingText')).to.contain('i18n-adding-to-table');
    });

    it('should render a localized string for the placeholder text', () => {
      sinon.stub(commonI18n, 'enterText').returns('i18n-enter-text');

      const wrapper = createAddTableRow();

      let input = wrapper.find('tr#addDataTableRow input').at(0);
      expect(input.prop('placeholder')).to.contain('i18n-enter-text');
    });
  });
});
