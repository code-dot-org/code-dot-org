import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import MethodNameEditor from '@cdo/apps/lib/levelbuilder/code-docs-editor/MethodNameEditor';

describe('MethodNameEditor', () => {
  let defaultProps, updateSpy;

  beforeEach(() => {
    updateSpy = jest.fn();
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
    expect(nameMethod.props().value).toBe('method 1');
  });

  it('calls update when name is updated', () => {
    const wrapper = shallow(<MethodNameEditor {...defaultProps} />);
    const nameMethod = wrapper.find('input').at(0);
    nameMethod.simulate('change', {target: {value: 'new name'}});
    expect(updateSpy).toHaveBeenCalledWith('name', 'new name');
  });
});
