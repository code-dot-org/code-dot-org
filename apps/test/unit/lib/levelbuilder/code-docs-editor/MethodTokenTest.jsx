import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import MethodToken from '@cdo/apps/lib/levelbuilder/code-docs-editor/MethodToken';
import sinon from 'sinon';

describe('MethodToken', () => {
  let defaultProps, updateSpy;

  beforeEach(() => {
    updateSpy = sinon.spy();
    defaultProps = {
      method: {
        name: 'method 1'
      },
      updateMethod: updateSpy
    };
  });

  it('displays input for name method', () => {
    const wrapper = shallow(<MethodToken {...defaultProps} />);
    const nameMethod = wrapper.find('input').at(0);
    expect(nameMethod.props().value).to.equal('method 1');
  });

  it('calls update when name is updated', () => {
    const wrapper = shallow(<MethodToken {...defaultProps} />);
    const nameMethod = wrapper.find('input').at(0);
    nameMethod.simulate('change', {target: {value: 'new name'}});
    expect(updateSpy).to.be.calledOnce.and.calledWith('name', 'new name');
  });
});
