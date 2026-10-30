import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {UnconnectedDataTable as DataTable} from '@cdo/apps/storage/dataBrowser/DataTable';
import commonI18n from '@cdo/locale';

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
    jest.restoreAllMocks();
  });

  describe('localization', () => {
    function createDataTable(props = {}) {
      props = {...DEFAULT_PROPS, ...props};
      return shallow(<DataTable {...props} />);
    }

    it('should render a localized string for "Actions" column', () => {
      jest
        .spyOn(commonI18n, 'actions')
        .mockClear()
        .mockReturnValue('i18n-actions');

      const wrapper = createDataTable();

      let header = wrapper.find('th').last();
      expect(header.text()).toContain('i18n-actions');
    });

    it('should render a localized string for labeling the current page', () => {
      jest
        .spyOn(commonI18n, 'paginationLabel')
        .mockClear()
        .mockReturnValue('i18n-page');

      const wrapper = createDataTable({
        rowsPerPage: 1,
        tableRecords: ['{"a": 3}', '{"b": null}'],
      });

      let pagination = wrapper.find('PaginationWrapper').at(0);
      expect(pagination.prop('label')).toContain('i18n-page');
    });
  });
});
