import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import commonI18n from '@cdo/locale';
import sinon from 'sinon';

import EditTableListRow from '@cdo/apps/storage/dataBrowser/EditTableListRow';

describe('EditTableListRow', () => {
  describe('localization', () => {
    function createEditTableListRow() {
      return shallow(
        <EditTableListRow
          onViewChange={() => {}}
          tableName="tableName"
          tableType="data"
        />
      );
    }

    afterEach(() => {
      sinon.restore();
    });

    it('should render a localized string for delete button text', () => {
      sinon.stub(commonI18n, 'delete').returns('i18n-delete');

      const wrapper = createEditTableListRow();

      let deleteButton = wrapper.find('ConfirmDeleteButton').at(0);
      expect(deleteButton.prop('buttonText')).to.contain('i18n-delete');
    });

    it('should render a localized string for delete confirmation', () => {
      sinon.stub(commonI18n, 'deleteTableConfirm').returns('i18n-delete-body');

      const wrapper = createEditTableListRow();

      let deleteButton = wrapper.find('ConfirmDeleteButton').at(0);
      expect(deleteButton.prop('body')).to.contain('i18n-delete-body');
    });

    it('should render a localized string for delete confirmation title', () => {
      sinon.stub(commonI18n, 'deleteTable').returns('i18n-delete-table');

      const wrapper = createEditTableListRow();

      let deleteButton = wrapper.find('ConfirmDeleteButton').at(0);
      expect(deleteButton.prop('title')).to.contain('i18n-delete-table');
    });
  });
});
