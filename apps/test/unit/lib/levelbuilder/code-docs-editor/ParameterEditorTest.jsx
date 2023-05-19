import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import ParameterEditor from '@cdo/apps/lib/levelbuilder/code-docs-editor/ParameterEditor';
import sinon from 'sinon';

describe('ParameterEditor', () => {
  let defaultProps, updateSpy;

  beforeEach(() => {
    updateSpy = sinon.spy();
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
    expect(nameField.props().value).to.equal('param1');
  });

  it('calls update when name is updated', () => {
    const wrapper = shallow(<ParameterEditor {...defaultProps} />);
    const nameField = wrapper.find('input').at(0);
    nameField.simulate('change', {target: {value: 'new name'}});
    expect(updateSpy).to.be.calledOnce.and.calledWith('name', 'new name');
  });

  it('displays input for type field', () => {
    const wrapper = shallow(<ParameterEditor {...defaultProps} />);
    const typeField = wrapper.find('input').at(1);
    expect(typeField.props().value).to.equal('string');
  });

  it('calls update when type is updated', () => {
    const wrapper = shallow(<ParameterEditor {...defaultProps} />);
    const typeField = wrapper.find('input').at(1);
    typeField.simulate('change', {target: {value: 'object'}});
    expect(updateSpy).to.be.calledOnce.and.calledWith('type', 'object');
  });

  it('displays checkbox for required field', () => {
    const wrapper = shallow(<ParameterEditor {...defaultProps} />);
    const requiredField = wrapper.find('input').at(2);
    expect(requiredField.props().type).to.equal('checkbox');
    expect(requiredField.props().checked).to.be.false;
  });

  it('calls update when required is updated', () => {
    const wrapper = shallow(<ParameterEditor {...defaultProps} />);
    const requiredField = wrapper.find('input').at(2);
    requiredField.simulate('change', {target: {checked: true}});
    expect(updateSpy).to.be.calledOnce.and.calledWith('required', true);
  });

  it('displays markdown editor for descrption', () => {
    const wrapper = shallow(<ParameterEditor {...defaultProps} />);
    const descriptionEditor = wrapper.find('TextareaWithMarkdownPreview');
    expect(descriptionEditor.props().markdown).to.equal('The first parameter');
  });
});
