import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import commonI18n from '@cdo/locale';
import sinon from 'sinon';

import ColumnMenu from '@cdo/apps/storage/dataBrowser/ColumnMenu';

describe('ColumnMenu', () => {
  describe('localization', () => {
    function createColumn() {
      return shallow(
        <ColumnMenu
          coerceColumn={() => {}}
          handleDelete={() => {}}
          handleRename={() => {}}
          isEditable={true}
        />
      );
    }

    afterEach(() => {
      sinon.restore();
    });

    it('should render a localized string for "Rename"', () => {
      sinon.stub(commonI18n, 'rename').returns('i18n-rename');

      const wrapper = createColumn();

      let menuItem = wrapper.find('li').at(0);
      let menuLink = menuItem.find('a');
      expect(menuLink.text()).to.contain('i18n-rename');
    });

    it('should render a localized string for "Delete"', () => {
      sinon.stub(commonI18n, 'delete').returns('i18n-delete');

      const wrapper = createColumn();

      let menuItem = wrapper.find('li').at(1);
      let menuLink = menuItem.find('a');
      expect(menuLink.text()).to.contain('i18n-delete');
    });

    it('should render a localized string for "Convert to string"', () => {
      sinon.stub(commonI18n, 'dataTableConvertToString').returns('i18n-ctos');

      const wrapper = createColumn();

      let menuItem = wrapper.find('li').at(2);
      let menuLink = menuItem.find('a');
      expect(menuLink.text()).to.contain('i18n-ctos');
    });

    it('should render a localized number for "Convert to number"', () => {
      sinon.stub(commonI18n, 'dataTableConvertToNumber').returns('i18n-cton');

      const wrapper = createColumn();

      let menuItem = wrapper.find('li').at(3);
      let menuLink = menuItem.find('a');
      expect(menuLink.text()).to.contain('i18n-cton');
    });

    it('should render a localized boolean for "Convert to boolean"', () => {
      sinon.stub(commonI18n, 'dataTableConvertToBoolean').returns('i18n-ctob');

      const wrapper = createColumn();

      let menuItem = wrapper.find('li').at(4);
      let menuLink = menuItem.find('a');
      expect(menuLink.text()).to.contain('i18n-ctob');
    });
  });
});
