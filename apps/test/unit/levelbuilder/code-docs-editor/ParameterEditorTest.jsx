import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import ParameterEditor from '@cdo/apps/levelbuilder/code-docs-editor/ParameterEditor';

describe('ParameterEditor', () => {
  let defaultProps, updateSpy;

  beforeEach(() => {
    updateSpy = jest.fn();
    defaultProps = {
      parameter: {
        name: 'param1',
        type: 'string',
        required: false,
        description: 'The first parameter',
      },
      update: updateSpy,
    };
  });

  it('displays input for name field', () => {
    const wrapper = shallow(<ParameterEditor {...defaultProps} />);
    const nameField = wrapper.find('input').at(0);
    expect(nameField.props().value).toBe('param1');
  });

  it('calls update when name is updated', () => {
    const wrapper = shallow(<ParameterEditor {...defaultProps} />);
    const nameField = wrapper.find('input').at(0);
    nameField.simulate('change', {target: {value: 'new name'}});
    expect(updateSpy).toHaveBeenCalledWith('name', 'new name');
  });

  it('displays input for type field', () => {
    const wrapper = shallow(<ParameterEditor {...defaultProps} />);
    const typeField = wrapper.find('input').at(1);
    expect(typeField.props().value).toBe('string');
  });

  it('calls update when type is updated', () => {
    const wrapper = shallow(<ParameterEditor {...defaultProps} />);
    const typeField = wrapper.find('input').at(1);
    typeField.simulate('change', {target: {value: 'object'}});
    expect(updateSpy).toHaveBeenCalledWith('type', 'object');
  });

  it('displays checkbox for required field', () => {
    const wrapper = shallow(<ParameterEditor {...defaultProps} />);
    const requiredField = wrapper.find('input').at(2);
    expect(requiredField.props().type).toBe('checkbox');
    expect(requiredField.props().checked).toBe(false);
  });

  it('calls update when required is updated', () => {
    const wrapper = shallow(<ParameterEditor {...defaultProps} />);
    const requiredField = wrapper.find('input').at(2);
    requiredField.simulate('change', {target: {checked: true}});
    expect(updateSpy).toHaveBeenCalledWith('required', true);
  });

  it('displays markdown editor for descrption', () => {
    const wrapper = shallow(<ParameterEditor {...defaultProps} />);
    const descriptionEditor = wrapper.find('TextareaWithMarkdownPreview');
    expect(descriptionEditor.props().markdown).toBe('The first parameter');
  });
});
