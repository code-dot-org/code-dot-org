import React from 'react';
import {mount} from 'enzyme';
import sinon from 'sinon';
import UnassignSectionDialog from '@cdo/apps/templates/UnassignSectionDialog';
import {expect} from 'chai';

const DEFAULT_PROPS = {
  isOpen: true,
  sectionId: 1,
  onClose: () => {},
  unassignSection: () => {},
  courseName: 'myCourse',
  sectionName: 'mySection'
};

const setUp = overrideProps => {
  const props = {...DEFAULT_PROPS, ...overrideProps};
  return mount(<UnassignSectionDialog {...props} />);
};

describe('UnassignSectionDialog', () => {
  it('calls unassign function when unassign button clicked', () => {
    const unassignSpy = sinon.spy();
    const wrapper = setUp({unassignSection: unassignSpy});

    const button = wrapper.find('Button').at(1);

    button.simulate('click');
    expect(unassignSpy).to.have.been.calledOnce;
  });

  it('calls close function when user clicks cancel', () => {
    const closeSpy = sinon.spy();
    const wrapper = setUp({onClose: closeSpy});
    const button = wrapper.find('Button').at(0);

    button.simulate('click');
    expect(closeSpy).to.have.been.calledOnce;
  });

  it('displays the right section and unit text', () => {
    const wrapper = setUp();

    expect(
      wrapper
        .find({id: 'unassign-dialog-body'})
        .contains(
          'Your students in mySection will no longer be taken to myCourse when they sign in.'
        )
    ).to.be.true;

    expect(wrapper.text().includes('Unassign myCourse')).to.be.true;
  });
});
