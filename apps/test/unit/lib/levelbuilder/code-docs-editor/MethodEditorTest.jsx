import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import MethodEditor from '@cdo/apps/lib/levelbuilder/code-docs-editor/MethodEditor';
import sinon from 'sinon';

describe('MethodEditor', () => {
  let defaultProps, updateSpy;

  beforeEach(() => {
    updateSpy = sinon.spy();
    defaultProps = {
      method: {
        name: 'method 1',
        type: 'int',
        content: 'this is the first method'
      },
      updateMethod: updateSpy
    };
  });

  it('displays input for name method', () => {
    const wrapper = shallow(<MethodEditor {...defaultProps} />);
    const nameMethod = wrapper.find('input').at(0);
    expect(nameMethod.props().value).to.equal('method 1');
  });

  it('calls update when name is updated', () => {
    const wrapper = shallow(<MethodEditor {...defaultProps} />);
    const nameMethod = wrapper.find('input').at(0);
    nameMethod.simulate('change', {target: {value: 'new name'}});
    expect(updateSpy).to.be.calledOnce.and.calledWith('name', 'new name');
  });

  it('displays markdown editor for content', () => {
    const wrapper = shallow(<MethodEditor {...defaultProps} />);
    const contentEditor = wrapper.find('TextareaWithMarkdownPreview').at(0);
    expect(contentEditor.props().markdown).to.equal('this is the first method');
  });
});
