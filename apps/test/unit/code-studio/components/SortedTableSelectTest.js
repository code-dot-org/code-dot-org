import React from 'react';
import {mount, shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import SortedTableSelect from '@cdo/apps/code-studio/components/SortedTableSelect';

const ROW_DATA = [
  {id: 1, name: 'itemb'},
  {id: 3, name: 'itemc'},
  {id: 0, name: 'itema'}
];
const OPTIONS = [
  {id: 0, name: 'optiona'},
  {id: 1, name: 'optionb'},
  {id: 2, name: 'optionc'},
  {id: 3, name: 'optiond'}
];

const DEFAULT_PROPS = {
  rowData: ROW_DATA,
  onRowChecked: () => {},
  options: OPTIONS,
  onChooseOption: () => {}
};

describe('SortedTableSelect', () => {
  it('renders an empty option as default', () => {
    const wrapper = shallow(<SortedTableSelect {...DEFAULT_PROPS} />);
    const options = wrapper.find('option');
    expect(options.at(0).text()).to.equal('');
    expect(options.at(1).text()).to.equal('optiona');
  });

  it('renders row data as rows', () => {
    const wrapper = mount(<SortedTableSelect {...DEFAULT_PROPS} />);
    const rows = wrapper.find('tr');
    expect(rows).to.have.length(ROW_DATA.length + 1);
  });

  it('sorts items by name (ascending) by default', () => {
    const wrapper = mount(<SortedTableSelect {...DEFAULT_PROPS} />);
    const nameCells = wrapper.find('td');
    expect(nameCells.at(1).text()).to.equal('itema');
    expect(nameCells.at(3).text()).to.equal('itemb');
    expect(nameCells.at(5).text()).to.equal('itemc');
  });

  it('areAllSelected returns false on initial render', () => {
    const wrapper = shallow(<SortedTableSelect {...DEFAULT_PROPS} />);
    expect(wrapper.instance().areAllSelected()).to.be.false;
  });

  it('areAllSelected returns true when all rows are checked', () => {
    const rowData = [
      {id: 1, name: '1', isChecked: true},
      {id: 2, name: '2', isChecked: true}
    ];
    const props = {
      ...DEFAULT_PROPS,
      ...{rowData: rowData}
    };
    const wrapper = shallow(<SortedTableSelect {...props} />);
    expect(wrapper.instance().areAllSelected()).to.be.true;
  });

  it('areAllSelected returns false when at least one row is unchecked', () => {
    const rowData = [
      {id: 1, name: '1', isChecked: true},
      {id: 2, name: '2', isChecked: false}
    ];
    const props = {
      ...DEFAULT_PROPS,
      ...{rowData: rowData}
    };
    const wrapper = shallow(<SortedTableSelect {...props} />);
    expect(wrapper.instance().areAllSelected()).to.be.false;
  });
});
