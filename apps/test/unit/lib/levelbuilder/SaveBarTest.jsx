import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import sinon from 'sinon';
import SaveBar from '@cdo/apps/lib/levelbuilder/SaveBar';

describe('SaveBar', () => {
  let defaultProps, handleSave, handleView;
  beforeEach(() => {
    handleSave = sinon.spy();
    handleView = sinon.spy();
    defaultProps = {
      isSaving: false,
      error: null,
      lastSaved: null,
      handleSave,
      handleView
    };
  });

  it('renders default props', () => {
    const wrapper = shallow(<SaveBar {...defaultProps} />);
    expect(wrapper.find('button').length).to.equal(3);
    expect(wrapper.find('FontAwesome').length).to.equal(0); //spinner isn't showing
  });

  it('can save and keep editing', () => {
    const wrapper = shallow(<SaveBar {...defaultProps} />);

    const saveAndKeepEditingButton = wrapper.find('button').at(1);
    expect(saveAndKeepEditingButton.contains('Save and Keep Editing')).to.be
      .true;
    saveAndKeepEditingButton.simulate('click');

    expect(handleSave).to.have.been.calledOnce;
  });

  it('shows spinner when isSaving is true', () => {
    const wrapper = shallow(<SaveBar {...defaultProps} isSaving={true} />);

    // check the the spinner is showing
    expect(wrapper.find('FontAwesome').length).to.equal(1);
  });

  it('shows lastSaved when there is no error', () => {
    const wrapper = shallow(
      <SaveBar {...defaultProps} lastSaved={Date.now()} />
    );

    expect(wrapper.find('.lastSavedMessage').text()).to.include(
      'Last saved at:'
    );
  });

  it('shows error when props error is set', () => {
    const wrapper = shallow(
      <SaveBar {...defaultProps} error={'There was an error'} />
    );
    expect(wrapper.find('.saveBar').find('FontAwesome').length).to.equal(0);
    expect(
      wrapper.find('.saveBar').contains('Error Saving: There was an error')
    ).to.be.true;
  });

  it('can save and close', () => {
    const wrapper = shallow(<SaveBar {...defaultProps} />);

    const saveAndCloseButton = wrapper.find('button').at(2);
    expect(saveAndCloseButton.contains('Save and Close')).to.be.true;
    saveAndCloseButton.simulate('click');

    expect(handleSave).to.have.been.calledOnce;
  });

  it('can go to item with show', () => {
    const wrapper = shallow(<SaveBar {...defaultProps} />);

    const saveAndCloseButton = wrapper.find('button').at(0);
    expect(saveAndCloseButton.contains('Show')).to.be.true;
    saveAndCloseButton.simulate('click');

    expect(handleView).to.have.been.calledOnce;
  });
});
