import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import AddLevelTable from '@cdo/apps/lib/levelbuilder/lesson-editor/AddLevelTable';
import sinon from 'sinon';

describe('AddLevelTable', () => {
  let defaultProps, addLevel, setCurrentPage;
  beforeEach(() => {
    addLevel = sinon.spy();
    setCurrentPage = sinon.spy();
    defaultProps = {
      addLevel,
      currentPage: 1,
      setCurrentPage,
      numPages: 7,
      levels: [
        {
          id: 1,
          name: 'Level 1',
          type: 'Applab',
          owner: 'Islay',
          updated_at: '09/30/20 at 08:37:04 PM'
        },
        {
          id: 2,
          name: 'Level 2',
          type: 'Applab',
          owner: 'Tonka',
          updated_at: '09/2/20 at 08:37:04 PM'
        },
        {
          id: 3,
          name: 'Level 3',
          type: 'Multi',
          owner: 'Islay',
          updated_at: '09/30/17 at 01:37:04 PM'
        },
        {
          id: 4,
          name: 'Level 4',
          type: 'Multi',
          owner: 'Tonka',
          updated_at: '01/2/18 at 08:37:04 AM'
        }
      ]
    };
  });

  it('renders default props', () => {
    const wrapper = shallow(<AddLevelTable {...defaultProps} />);
    expect(wrapper.contains('Actions')).to.be.true;
    expect(wrapper.contains('Name')).to.be.true;
    expect(wrapper.contains('Type')).to.be.true;
    expect(wrapper.contains('Owner')).to.be.true;
    expect(wrapper.contains('Last Updated')).to.be.true;

    expect(wrapper.find('PaginationWrapper').length).to.equal(1);
    expect(wrapper.find('tr').length).to.equal(1);
    expect(wrapper.find('AddLevelTableRow').length).to.equal(4);
  });

  it('renders message when no levels found', () => {
    defaultProps.levels = [];
    const wrapper = shallow(<AddLevelTable {...defaultProps} />);
    expect(wrapper.contains('Actions')).to.be.true;
    expect(wrapper.contains('Name')).to.be.true;
    expect(wrapper.contains('Type')).to.be.true;
    expect(wrapper.contains('Owner')).to.be.true;
    expect(wrapper.contains('Last Updated')).to.be.true;

    expect(wrapper.find('PaginationWrapper').length).to.equal(1);
    expect(wrapper.find('tr').length).to.equal(1);
    expect(wrapper.find('AddLevelTableRow').length).to.equal(0);

    expect(
      wrapper.contains('There are no levels matching the search you entered.')
    ).to.be.true;
  });
});
