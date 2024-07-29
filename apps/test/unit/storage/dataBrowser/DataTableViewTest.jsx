import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {UnconnectedDataTableView as DataTableView} from '@cdo/apps/storage/dataBrowser/DataTableView';
import commonI18n from '@cdo/locale';

const DEFAULT_PROPS = {
  isRtl: false,
  tableColumns: [],
  tableName: 'testTable',
  tableListMap: {},
  view: DataView.TABLE,
  tableRecords: [],
  libraryManifest: {},
  onShowWarning: () => {},
  onViewChange: () => {},
};

describe('DataTableView', () => {
  it('can show the table as JSON', () => {
    let records = [];
    // records[0] is empty
    records[1] = '{"column1":"foo","column2":"bar","id":1}';
    let expectedJSON = `[
  {
    "column1": "foo",
    "column2": "bar",
    "id": 1
  }
]`;
    let wrapper = shallow(<DataTableView {...DEFAULT_PROPS} />);
    wrapper.setProps({tableRecords: records});
    expect(wrapper.instance().getTableJson()).toBe(expectedJSON);
  });

  describe('localization', () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should render a localized string for "Back to data"', () => {
      jest
        .spyOn(commonI18n, 'backToData')
        .mockClear()
        .mockReturnValue('i18n-back-to-data');

      const wrapper = shallow(<DataTableView {...DEFAULT_PROPS} />);

      let backLink = wrapper.find('#dataTable a#tableBackToOverview').at(0);
      expect(backLink.text()).toContain('i18n-back-to-data');
    });

    it('should render a localized string for the "Debug view"', () => {
      jest
        .spyOn(commonI18n, 'dataTableDebugView')
        .mockClear()
        .mockReturnValue('i18n-debug-view');

      const wrapper = shallow(<DataTableView {...DEFAULT_PROPS} />);

      let viewLink = wrapper.find('#uitest-tableDebugLink').at(0);
      expect(viewLink.text()).toContain('i18n-debug-view');
    });

    it('should render a localized string for the "Table view"', () => {
      jest
        .spyOn(commonI18n, 'dataTableTableView')
        .mockClear()
        .mockReturnValue('i18n-table-view');

      const wrapper = shallow(<DataTableView {...DEFAULT_PROPS} />);

      // Switch to 'Debug view' so we can render the link to the 'Table view'
      wrapper.setState({
        showDebugView: true,
      });

      let viewLink = wrapper.find('#uitest-tableDebugLink').at(0);
      expect(viewLink.text()).toContain('i18n-table-view');
    });
  });
});
