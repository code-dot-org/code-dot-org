import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import FieldEditor from '@cdo/apps/levelbuilder/code-docs-editor/FieldEditor';

describe('FieldEditor', () => {
  let defaultProps, updateSpy;

  beforeEach(() => {
    updateSpy = jest.fn();
    defaultProps = {
      field: {
        name: 'field 1',
        type: 'int',
        description: 'this is the first field',
      },
      updateField: updateSpy,
    };
  });

  it('displays input for name field', () => {
    const wrapper = shallow(<FieldEditor {...defaultProps} />);
    const nameField = wrapper.find('input').at(0);
    expect(nameField.props().value).toBe('field 1');
  });

  it('calls update when name is updated', () => {
    const wrapper = shallow(<FieldEditor {...defaultProps} />);
    const nameField = wrapper.find('input').at(0);
    nameField.simulate('change', {target: {value: 'new name'}});
    expect(updateSpy).toHaveBeenCalledWith('name', 'new name');
  });

  it('displays input for type field', () => {
    const wrapper = shallow(<FieldEditor {...defaultProps} />);
    const typeField = wrapper.find('input').at(1);
    expect(typeField.props().value).toBe('int');
  });

  it('calls update when type is updated', () => {
    const wrapper = shallow(<FieldEditor {...defaultProps} />);
    const typeField = wrapper.find('input').at(1);
    typeField.simulate('change', {target: {value: 'String'}});
    expect(updateSpy).toHaveBeenCalledWith('type', 'String');
  });

  it('displays markdown editor for description', () => {
    const wrapper = shallow(<FieldEditor {...defaultProps} />);
    const descriptionEditor = wrapper.find('TextareaWithMarkdownPreview').at(0);
    expect(descriptionEditor.props().markdown).toBe('this is the first field');
  });
});
