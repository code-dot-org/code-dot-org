import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import commonI18n from '@cdo/locale';
import sinon from 'sinon';

import EditKeyRow from '@cdo/apps/storage/dataBrowser/EditKeyRow';

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
      sinon.restore();
    });

    it('should render a localized string for the "Edit" button', () => {
      sinon.stub(commonI18n, 'edit').returns('i18n-edit');

      const wrapper = createEditKeyRow();

      let button = wrapper.find('button').at(0);
      expect(button.text()).to.contain('i18n-edit');
    });

    it('should render a localized string for "Save"', () => {
      sinon.stub(commonI18n, 'save').returns('i18n-save');

      const wrapper = createEditKeyRow();

      // Ensure it is in 'editing' mode.
      wrapper.setState({isEditing: true});

      let saveButton = wrapper.find('PendingButton').at(0);
      expect(saveButton.prop('text')).to.contain('i18n-save');
    });

    it('should render a localized string while saving the row', () => {
      sinon.stub(commonI18n, 'saving').returns('i18n-saving');

      const wrapper = createEditKeyRow();

      // Ensure it is in 'editing' mode.
      wrapper.setState({isEditing: true});

      let saveButton = wrapper.find('PendingButton').at(0);
      expect(saveButton.prop('pendingText')).to.contain('i18n-saving');
    });

    it('should render a localized string for "Delete"', () => {
      sinon.stub(commonI18n, 'delete').returns('i18n-delete');

      const wrapper = createEditKeyRow();

      let deleteButton = wrapper.find('PendingButton').at(0);
      expect(deleteButton.prop('text')).to.contain('i18n-delete');
    });

    it('should render a localized string while saving the row', () => {
      sinon.stub(commonI18n, 'deletingWithEllipsis').returns('i18n-deleting');

      const wrapper = createEditKeyRow();

      let deleteButton = wrapper.find('PendingButton').at(0);
      expect(deleteButton.prop('pendingText')).to.contain('i18n-deleting');
    });
  });
});
