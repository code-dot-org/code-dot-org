import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import CreateNewLevelInputs from '@cdo/apps/lib/levelbuilder/lesson-editor/CreateNewLevelInputs';

describe('CreateNewLevelInputs', () => {
  let defaultProps;
  beforeEach(() => {
    defaultProps = {};
  });

  it('renders default props', () => {
    const wrapper = shallow(<CreateNewLevelInputs {...defaultProps} />);
    expect(wrapper.contains('Level Type:'));
    expect(wrapper.contains('Level Name:'));
    expect(wrapper.find('input').length).to.equal(1);
    expect(wrapper.find('select').length).to.equal(1);
    expect(wrapper.find('Button').length).to.equal(1);
  });
});
