import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import AddLevelTable from '@cdo/apps/levelbuilder/lesson-editor/AddLevelTable';

describe('AddLevelTable', () => {
  let defaultProps, addLevel, setCurrentPage;
  beforeEach(() => {
    addLevel = jest.fn();
    setCurrentPage = jest.fn();
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
          updated_at: '09/30/20 at 08:37:04 PM',
        },
        {
          id: 2,
          name: 'Level 2',
          type: 'Applab',
          owner: 'Tonka',
          updated_at: '09/2/20 at 08:37:04 PM',
        },
        {
          id: 3,
          name: 'Level 3',
          type: 'Multi',
          owner: 'Islay',
          updated_at: '09/30/17 at 01:37:04 PM',
        },
        {
          id: 4,
          name: 'Level 4',
          type: 'Multi',
          owner: 'Tonka',
          updated_at: '01/2/18 at 08:37:04 AM',
        },
      ],
    };
  });

  it('renders default props', () => {
    const wrapper = shallow(<AddLevelTable {...defaultProps} />);
    expect(wrapper.contains('Actions')).toBe(true);
    expect(wrapper.contains('Name')).toBe(true);
    expect(wrapper.contains('Type')).toBe(true);
    expect(wrapper.contains('Owner')).toBe(true);
    expect(wrapper.contains('Last Updated')).toBe(true);

    expect(wrapper.find('PaginationWrapper').length).toBe(1);
    expect(wrapper.find('tr').length).toBe(1);
    expect(wrapper.find('AddLevelTableRow').length).toBe(4);
  });

  it('renders message when no levels found', () => {
    defaultProps.levels = [];
    const wrapper = shallow(<AddLevelTable {...defaultProps} />);
    expect(wrapper.contains('Actions')).toBe(true);
    expect(wrapper.contains('Name')).toBe(true);
    expect(wrapper.contains('Type')).toBe(true);
    expect(wrapper.contains('Owner')).toBe(true);
    expect(wrapper.contains('Last Updated')).toBe(true);

    expect(wrapper.find('PaginationWrapper').length).toBe(1);
    expect(wrapper.find('tr').length).toBe(1);
    expect(wrapper.find('AddLevelTableRow').length).toBe(0);

    expect(
      wrapper.contains('There are no levels matching the search you entered.')
    ).toBe(true);
  });
});
