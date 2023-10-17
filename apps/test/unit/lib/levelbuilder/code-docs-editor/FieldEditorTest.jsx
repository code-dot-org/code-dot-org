import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import FieldEditor from '@cdo/apps/lib/levelbuilder/code-docs-editor/FieldEditor';
import sinon from 'sinon';

describe('FieldEditor', () => {
  let defaultProps, updateSpy;

  beforeEach(() => {
    updateSpy = sinon.spy();
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
    expect(nameField.props().value).to.equal('field 1');
  });

  it('calls update when name is updated', () => {
    const wrapper = shallow(<FieldEditor {...defaultProps} />);
    const nameField = wrapper.find('input').at(0);
    nameField.simulate('change', {target: {value: 'new name'}});
    expect(updateSpy).to.be.calledOnce.and.calledWith('name', 'new name');
  });

  it('displays input for type field', () => {
    const wrapper = shallow(<FieldEditor {...defaultProps} />);
    const typeField = wrapper.find('input').at(1);
    expect(typeField.props().value).to.equal('int');
  });

  it('calls update when type is updated', () => {
    const wrapper = shallow(<FieldEditor {...defaultProps} />);
    const typeField = wrapper.find('input').at(1);
    typeField.simulate('change', {target: {value: 'String'}});
    expect(updateSpy).to.be.calledOnce.and.calledWith('type', 'String');
  });

  it('displays markdown editor for description', () => {
    const wrapper = shallow(<FieldEditor {...defaultProps} />);
    const descriptionEditor = wrapper.find('TextareaWithMarkdownPreview').at(0);
    expect(descriptionEditor.props().markdown).to.equal(
      'this is the first field'
    );
  });
});
