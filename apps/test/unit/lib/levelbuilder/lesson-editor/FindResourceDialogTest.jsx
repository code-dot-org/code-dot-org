import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import {UnconnectedFindResourceDialog as FindResourceDialog} from '@cdo/apps/lib/levelbuilder/lesson-editor/FindResourceDialog';
import sinon from 'sinon';
import resourceTestData from './resourceTestData';

describe('FindResourceDialog', () => {
  let defaultProps, handleConfirm;
  beforeEach(() => {
    handleConfirm = sinon.spy();
    defaultProps = {
      isOpen: true,
      handleConfirm,
      handleClose: sinon.spy(),
      resources: resourceTestData
    };
  });

  it('renders default props', () => {
    const wrapper = shallow(<FindResourceDialog {...defaultProps} />);
    expect(wrapper.contains('Add Resource')).to.be.true;
    expect(wrapper.find('LessonEditorDialog').length).to.equal(1);
    expect(wrapper.find('select').length).to.equal(1);
    expect(wrapper.find('Button').length).to.equal(1);
  });

  it('adds resource key on confirm, no dropdown change', () => {
    const wrapper = shallow(<FindResourceDialog {...defaultProps} />);
    const closeAndAddButton = wrapper.find('Button').first();
    closeAndAddButton.simulate('click', {preventDefault: () => {}});
    expect(handleConfirm).to.have.been.calledWith('resource-1/course/year');
  });

  it('adds resource key on confirm, dropdown change', () => {
    const wrapper = shallow(<FindResourceDialog {...defaultProps} />);
    const select = wrapper.find('select').first();
    select.simulate('change', {target: {value: 'resource-2/course/year'}});
    const closeAndAddButton = wrapper.find('Button').first();
    closeAndAddButton.simulate('click', {preventDefault: () => {}});
    expect(handleConfirm).to.have.been.calledWith('resource-2/course/year');
  });
});
