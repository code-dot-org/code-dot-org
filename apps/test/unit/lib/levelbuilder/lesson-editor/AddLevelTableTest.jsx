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
    expect(wrapper.contains('Actions')).to.be.true;
    expect(wrapper.contains('Name')).to.be.true;
    expect(wrapper.contains('Type')).to.be.true;
    expect(wrapper.contains('Owner')).to.be.true;
    expect(wrapper.contains('Last Updated')).to.be.true;
    expect(wrapper.find('Button').length).to.equal(4);
  });
});
