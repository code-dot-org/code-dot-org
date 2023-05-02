import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import commonI18n from '@cdo/locale';
import sinon from 'sinon';

import AddTableListRow from '@cdo/apps/storage/dataBrowser/AddTableListRow';

describe('AddTableListRow', () => {
  describe('localization', () => {
    function createAddTableListRow() {
      return shallow(<AddTableListRow onTableAdd={() => {}} />);
    }

    afterEach(() => {
      sinon.restore();
    });

    it('should render a localized string for placeholder text', () => {
      sinon.stub(commonI18n, 'dataTableNamePlaceholder').returns('i18n-holder');

      const wrapper = createAddTableListRow();

      let input = wrapper.find('input').at(0);
      expect(input.prop('placeholder')).to.contain('i18n-holder');
    });

    it('should render a localized string for "Add"', () => {
      sinon.stub(commonI18n, 'add').returns('i18n-add');

      const wrapper = createAddTableListRow();

      let addButton = wrapper.find('button.uitest-add-table-btn').at(0);
      expect(addButton.text()).to.contain('i18n-add');
    });
  });
});
