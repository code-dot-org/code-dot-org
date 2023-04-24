import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import {UnconnectedDataTableView as DataTableView} from '@cdo/apps/storage/dataBrowser/DataTableView';
import commonI18n from '@cdo/locale';
import sinon from 'sinon';

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
    expect(wrapper.instance().getTableJson()).to.equal(expectedJSON);
  });

  describe('localization', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should render a localized string for "Back to data"', () => {
      sinon.stub(commonI18n, 'backToData').returns('i18n-back-to-data');

      const wrapper = shallow(<DataTableView {...DEFAULT_PROPS} />);

      let backLink = wrapper.find('#dataTable a#tableBackToOverview').at(0);
      expect(backLink.text()).to.contain('i18n-back-to-data');
    });

    it('should render a localized string for the "Debug view"', () => {
      sinon.stub(commonI18n, 'dataTableDebugView').returns('i18n-debug-view');

      const wrapper = shallow(<DataTableView {...DEFAULT_PROPS} />);

      let viewLink = wrapper.find('#uitest-tableDebugLink').at(0);
      expect(viewLink.text()).to.contain('i18n-debug-view');
    });

    it('should render a localized string for the "Table view"', () => {
      sinon.stub(commonI18n, 'dataTableTableView').returns('i18n-table-view');

      const wrapper = shallow(<DataTableView {...DEFAULT_PROPS} />);

      // Switch to 'Debug view' so we can render the link to the 'Table view'
      wrapper.setState({
        showDebugView: true,
      });

      let viewLink = wrapper.find('#uitest-tableDebugLink').at(0);
      expect(viewLink.text()).to.contain('i18n-table-view');
    });
  });
});
