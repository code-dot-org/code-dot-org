import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import sinon from 'sinon';

import MethodNameEditor from '@cdo/apps/lib/levelbuilder/code-docs-editor/MethodNameEditor';

import {expect} from '../../../../util/reconfiguredChai';

describe('MethodNameEditor', () => {
  let defaultProps, updateSpy;

  beforeEach(() => {
    updateSpy = sinon.spy();
    defaultProps = {
      method: {
        name: 'method 1',
      },
      updateMethod: updateSpy,
    };
  });

  it('displays input for name method', () => {
    const wrapper = shallow(<MethodNameEditor {...defaultProps} />);
    const nameMethod = wrapper.find('input').at(0);
    expect(nameMethod.props().value).to.equal('method 1');
  });

  it('calls update when name is updated', () => {
    const wrapper = shallow(<MethodNameEditor {...defaultProps} />);
    const nameMethod = wrapper.find('input').at(0);
    nameMethod.simulate('change', {target: {value: 'new name'}});
    expect(updateSpy).to.be.calledOnce.and.calledWith('name', 'new name');
  });
});
