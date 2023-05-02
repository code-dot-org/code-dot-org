import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import commonI18n from '@cdo/locale';
import sinon from 'sinon';

import {UnconnectedDataTable as DataTable} from '@cdo/apps/storage/dataBrowser/DataTable';

const DEFAULT_PROPS = {
  readOnly: false,
  rowsPerPage: 5,
  tableColumns: [],
  tableName: 'tableName',
  tableRecords: [],
  onShowWarning: () => {},
};

describe('DataTable', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('localization', () => {
    function createDataTable(props = {}) {
      props = {...DEFAULT_PROPS, ...props};
      return shallow(<DataTable {...props} />);
    }

    it('should render a localized string for "Actions" column', () => {
      sinon.stub(commonI18n, 'actions').returns('i18n-actions');

      const wrapper = createDataTable();

      let header = wrapper.find('th').last();
      expect(header.text()).to.contain('i18n-actions');
    });

    it('should render a localized string for labeling the current page', () => {
      sinon.stub(commonI18n, 'paginationLabel').returns('i18n-page');

      const wrapper = createDataTable({
        rowsPerPage: 1,
        tableRecords: ['{"a": 3}', '{"b": null}'],
      });

      let pagination = wrapper.find('PaginationWrapper').at(0);
      expect(pagination.prop('label')).to.contain('i18n-page');
    });
  });
});
