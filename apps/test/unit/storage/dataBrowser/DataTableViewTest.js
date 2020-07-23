import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import {UnconnectedDataTableView as DataTableView} from '@cdo/apps/storage/dataBrowser/DataTableView';

const DEFAULT_PROPS = {
  tableColumns: [],
  tableName: 'testTable',
  tableListMap: {},
  view: DataView.TABLE,
  tableRecords: [],
  onShowWarning: () => {},
  onViewChange: () => {}
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
});
