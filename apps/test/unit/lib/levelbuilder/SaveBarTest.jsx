import React from 'react';
import {mount} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import sinon from 'sinon';
import SaveBar from '@cdo/apps/lib/levelbuilder/SaveBar';

describe('SaveBar', () => {
  let defaultProps, handleSave;
  beforeEach(() => {
    handleSave = sinon.spy();
    defaultProps = {
      isSaving: false,
      error: null,
      lastSaved: null,
      handleSave
    };
  });

  it('renders default props', () => {
    const wrapper = mount(<SaveBar {...defaultProps} />);
    expect(wrapper.find('button').length).to.equal(2);
    expect(wrapper.find('FontAwesome').length).to.equal(0); //spinner isn't showing
  });

  it('can save and keep editing', () => {
    const wrapper = mount(<SaveBar {...defaultProps} />);

    const saveAndKeepEditingButton = wrapper.find('button').at(0);
    expect(saveAndKeepEditingButton.contains('Save and Keep Editing')).to.be
      .true;
    saveAndKeepEditingButton.simulate('click');

    expect(handleSave).to.have.been.calledOnce;
  });

  it('shows spinner when isSaving is true', () => {
    const wrapper = mount(<SaveBar {...defaultProps} isSaving={true} />);

    // check the the spinner is showing
    expect(wrapper.find('FontAwesome').length).to.equal(1);
  });

  it('shows lastSaved when there is no error', () => {
    const wrapper = mount(<SaveBar {...defaultProps} lastSaved={Date.now()} />);

    expect(wrapper.find('.lastSavedMessage').text()).to.include(
      'Last saved at:'
    );
  });

  it('shows error when props error is set', () => {
    const wrapper = mount(
      <SaveBar {...defaultProps} error={'There was an error'} />
    );
    expect(wrapper.find('.saveBar').find('FontAwesome').length).to.equal(0);
    expect(
      wrapper.find('.saveBar').contains('Error Saving: There was an error')
    ).to.be.true;
  });

  it('can save and close', () => {
    const wrapper = mount(<SaveBar {...defaultProps} />);

    const saveAndCloseButton = wrapper.find('button').at(1);
    expect(saveAndCloseButton.contains('Save and Close')).to.be.true;
    saveAndCloseButton.simulate('click');

    expect(handleSave).to.have.been.calledOnce;
  });
});
