import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {UnconnectedFindResourceDialog as FindResourceDialog} from '@cdo/apps/lib/levelbuilder/lesson-editor/FindResourceDialog';

import resourceTestData from './resourceTestData';

describe('FindResourceDialog', () => {
  let defaultProps, handleConfirm;
  beforeEach(() => {
    handleConfirm = jest.fn();
    defaultProps = {
      isOpen: true,
      handleConfirm,
      handleClose: jest.fn(),
      resources: resourceTestData,
    };
  });

  it('renders default props', () => {
    const wrapper = shallow(<FindResourceDialog {...defaultProps} />);
    expect(wrapper.contains('Add Resource')).toBe(true);
    expect(wrapper.find('LessonEditorDialog').length).toBe(1);
    expect(wrapper.find('select').length).toBe(1);
    expect(wrapper.find('Button').length).toBe(1);
  });

  it('adds resource key on confirm, no dropdown change', () => {
    const wrapper = shallow(<FindResourceDialog {...defaultProps} />);
    const closeAndAddButton = wrapper.find('Button').first();
    closeAndAddButton.simulate('click', {preventDefault: () => {}});
    expect(handleConfirm).toHaveBeenCalledWith('resource-1/course/year');
  });

  it('adds resource key on confirm, dropdown change', () => {
    const wrapper = shallow(<FindResourceDialog {...defaultProps} />);
    const select = wrapper.find('select').first();
    select.simulate('change', {target: {value: 'resource-2/course/year'}});
    const closeAndAddButton = wrapper.find('Button').first();
    closeAndAddButton.simulate('click', {preventDefault: () => {}});
    expect(handleConfirm).toHaveBeenCalledWith('resource-2/course/year');
  });
});
