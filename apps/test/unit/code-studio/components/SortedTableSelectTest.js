import React from 'react';
import {mount, shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import SortedTableSelect from '@cdo/apps/code-studio/components/SortedTableSelect';
import sinon from 'sinon';

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
    expect(wrapper.state().rowsChecked).to.be.empty;
  });

  it('toggleRowChecked adds the row selected to rowsChecked', () => {
    const wrapper = shallow(<SortedTableSelect {...DEFAULT_PROPS} />);
    expect(wrapper.state().rowsChecked).to.be.empty;
    wrapper.instance().toggleRowChecked(1);
    wrapper.update();
    expect(wrapper.state().rowsChecked).to.include(1);
    expect(wrapper.instance().areAllSelected()).to.be.false;
  });

  it('toggling all the rows sets areAllSelected to true', () => {
    const wrapper = shallow(<SortedTableSelect {...DEFAULT_PROPS} />);
    expect(wrapper.state().rowsChecked).to.be.empty;
    expect(wrapper.instance().areAllSelected()).to.be.false;
    wrapper.instance().toggleRowChecked(1);
    wrapper.instance().toggleRowChecked(3);
    wrapper.instance().toggleRowChecked(0);
    wrapper.update();
    expect(wrapper.state().rowsChecked).to.include(1);
    expect(wrapper.state().rowsChecked).to.include(3);
    expect(wrapper.state().rowsChecked).to.include(0);
    expect(wrapper.instance().areAllSelected()).to.be.true;
  });

  it('calling toggleSelectAll adds all rows to rowsChecked', () => {
    const wrapper = shallow(<SortedTableSelect {...DEFAULT_PROPS} />);
    expect(wrapper.state().rowsChecked).to.be.empty;
    expect(wrapper.instance().areAllSelected()).to.be.false;
    wrapper.instance().toggleSelectAll();
    wrapper.update();
    expect(wrapper.state().rowsChecked).to.include(1);
    expect(wrapper.state().rowsChecked).to.include(3);
    expect(wrapper.state().rowsChecked).to.include(0);
    expect(wrapper.instance().areAllSelected()).to.be.true;
  });

  it('toggleSelectAll unchecks all rows when all rows are checked', () => {
    const wrapper = shallow(<SortedTableSelect {...DEFAULT_PROPS} />);
    expect(wrapper.state().rowsChecked).to.be.empty;
    expect(wrapper.instance().areAllSelected()).to.be.false;
    wrapper.instance().toggleSelectAll();
    wrapper.update();
    wrapper.instance().toggleSelectAll();
    wrapper.update();
    expect(wrapper.state().rowsChecked).to.be.empty;
    expect(wrapper.instance().areAllSelected()).to.be.false;
  });

  describe('onRowChecked', () => {
    let onRowChecked;
    beforeEach(() => {
      onRowChecked = sinon.spy();
    });

    it('is called once by toggleRowChecked', () => {
      const props = {...DEFAULT_PROPS, ...{onRowChecked: onRowChecked}};
      const wrapper = shallow(<SortedTableSelect {...props} />);
      wrapper.instance().toggleRowChecked(0);
      expect(onRowChecked).to.have.been.called.once;
    });

    it('is called once by toggleSelectAll', () => {
      const props = {...DEFAULT_PROPS, ...{onRowChecked: onRowChecked}};
      const wrapper = shallow(<SortedTableSelect {...props} />);
      wrapper.instance().toggleSelectAll();
      expect(onRowChecked).to.have.been.called.once;
    });
  });
});
