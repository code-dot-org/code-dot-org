import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import AddLevelTable from '@cdo/apps/lib/levelbuilder/lesson-editor/AddLevelTable';
import sinon from 'sinon';

describe('AddLevelTable', () => {
  let defaultProps;
  beforeEach(() => {
    defaultProps = {
      addLevel: sinon.spy()
    };
  });

  it('renders default props', () => {
    const wrapper = shallow(<AddLevelTable {...defaultProps} />);
    expect(wrapper.contains('Actions'));
    expect(wrapper.contains('Name'));
    expect(wrapper.contains('Type'));
    expect(wrapper.contains('Owner'));
    expect(wrapper.contains('Last Updated'));
    expect(wrapper.find('Button').length).to.equal(4);
  });
});
