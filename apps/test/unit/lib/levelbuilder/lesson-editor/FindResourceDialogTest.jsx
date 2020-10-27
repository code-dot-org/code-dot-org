import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import FindResourceDialog from '@cdo/apps/lib/levelbuilder/lesson-editor/FindResourceDialog';
import sinon from 'sinon';

describe('FindResourceDialog', () => {
  let defaultProps;
  beforeEach(() => {
    defaultProps = {
      isOpen: true,
      handleConfirm: sinon.spy()
    };
  });

  it('renders default props', () => {
    const wrapper = shallow(<FindResourceDialog {...defaultProps} />);
    expect(wrapper.contains('Add Resource')).to.be.true;
    expect(wrapper.find('BaseDialog').length).to.equal(1);
    expect(wrapper.find('select').length).to.equal(1);
  });
});
