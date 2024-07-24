import {mount, shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import SortedTableSelect from '@cdo/apps/code-studio/components/SortedTableSelect';

const ROW_DATA = [
  {id: 1, name: 'itemb'},
  {id: 3, name: 'itemc'},
  {id: 0, name: 'itema'},
];
const OPTIONS = [
  {id: 0, name: 'optiona'},
  {id: 1, name: 'optionb'},
  {id: 2, name: 'optionc'},
  {id: 3, name: 'optiond'},
];

const DEFAULT_PROPS = {
  rowData: ROW_DATA,
  onRowChecked: () => {},
  options: OPTIONS,
  onChooseOption: () => {},
};

describe('SortedTableSelect', () => {
  it('renders an empty option as default', () => {
    const wrapper = shallow(<SortedTableSelect {...DEFAULT_PROPS} />);
    const options = wrapper.find('option');
    expect(options.at(0).text()).toBe('');
    expect(options.at(1).text()).toBe('optiona');
  });

  it('renders row data as rows', () => {
    const wrapper = mount(<SortedTableSelect {...DEFAULT_PROPS} />);
    const rows = wrapper.find('tr');
    expect(rows).toHaveLength(ROW_DATA.length + 1);
  });

  it('sorts items by name (ascending) by default', () => {
    const wrapper = mount(<SortedTableSelect {...DEFAULT_PROPS} />);
    const nameCells = wrapper.find('td');
    expect(nameCells.at(1).text()).toBe('itema');
    expect(nameCells.at(3).text()).toBe('itemb');
    expect(nameCells.at(5).text()).toBe('itemc');
  });

  it('areAllSelected returns false on initial render', () => {
    const wrapper = shallow(<SortedTableSelect {...DEFAULT_PROPS} />);
    expect(wrapper.instance().areAllSelected()).toBe(false);
  });

  it('areAllSelected returns true when all rows are checked', () => {
    const rowData = [
      {id: 1, name: '1', isChecked: true},
      {id: 2, name: '2', isChecked: true},
    ];
    const props = {
      ...DEFAULT_PROPS,
      ...{rowData: rowData},
    };
    const wrapper = shallow(<SortedTableSelect {...props} />);
    expect(wrapper.instance().areAllSelected()).toBe(true);
  });

  it('areAllSelected returns false when at least one row is unchecked', () => {
    const rowData = [
      {id: 1, name: '1', isChecked: true},
      {id: 2, name: '2', isChecked: false},
    ];
    const props = {
      ...DEFAULT_PROPS,
      ...{rowData: rowData},
    };
    const wrapper = shallow(<SortedTableSelect {...props} />);
    expect(wrapper.instance().areAllSelected()).toBe(false);
  });
});
