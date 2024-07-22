import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {UnconnectedAddLevelFilters as AddLevelFilters} from '@cdo/apps/lib/levelbuilder/lesson-editor/AddLevelFilters';

import {searchOptions} from './activitiesTestData';

describe('AddLevelFilters', () => {
  let defaultProps,
    handleSearch,
    handleChangeLevelName,
    handleChangeLevelType,
    handleChangeUnit,
    handleChangeOwner;
  beforeEach(() => {
    handleSearch = jest.fn();
    handleChangeLevelName = jest.fn();
    handleChangeLevelType = jest.fn();
    handleChangeUnit = jest.fn();
    handleChangeOwner = jest.fn();
    defaultProps = {
      searchOptions: searchOptions,
      handleSearch,
      handleChangeLevelName,
      handleChangeLevelType,
      handleChangeUnit,
      handleChangeOwner,
      ownerId: '',
      unitId: '',
      levelType: '',
      levelName: '',
    };
  });

  it('renders default props', () => {
    const wrapper = shallow(<AddLevelFilters {...defaultProps} />);
    expect(wrapper.contains('By Name:')).toBe(true);
    expect(wrapper.contains('By Type:')).toBe(true);
    expect(wrapper.contains('By Unit:')).toBe(true);
    expect(wrapper.contains('By Owner:')).toBe(true);
    expect(wrapper.find('input').length).toBe(1);
    expect(wrapper.find('select').length).toBe(3);
    expect(wrapper.find('button').length).toBe(1);
  });

  it('change values for search', () => {
    const wrapper = shallow(<AddLevelFilters {...defaultProps} />);

    const input = wrapper.find('input');
    expect(input.props().value).toContain('');
    input.simulate('change', {
      target: {value: 'Level Name'},
    });
    expect(handleChangeLevelName).toHaveBeenCalledTimes(1);

    const levelTypeDropdown = wrapper.find('select').at(0);
    expect(levelTypeDropdown.props().value).toBe('');
    levelTypeDropdown.simulate('change', {target: {value: 'Dancelab'}});
    expect(handleChangeLevelType).toHaveBeenCalledTimes(1);

    const unitDropdown = wrapper.find('select').at(1);
    expect(unitDropdown.props().value).toBe('');
    unitDropdown.simulate('change', {target: {value: 2}});
    expect(handleChangeUnit).toHaveBeenCalledTimes(1);

    const ownerDropdown = wrapper.find('select').at(2);
    expect(ownerDropdown.props().value).toBe('');
    ownerDropdown.simulate('change', {target: {value: 1}});
    expect(handleChangeOwner).toHaveBeenCalledTimes(1);

    const button = wrapper.find('button');
    button.simulate('click');
    expect(handleSearch).toHaveBeenCalledTimes(1);
  });
});
