import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import sinon from 'sinon';
import SaveBar from '@cdo/apps/lib/levelbuilder/SaveBar';
import * as utils from '@cdo/apps/utils';

describe('SaveBar', () => {
  let handleSave;
  beforeEach(() => {
    handleSave = sinon.spy();
  });

  it('renders default props', () => {
    const wrapper = shallow(<SaveBar handleSave={handleSave} />);
    expect(wrapper.find('button').length).to.equal(2); // show button not rendered
    expect(wrapper.find('FontAwesome').length).to.equal(0); //spinner isn't showing
  });

  it('can save and keep editing', () => {
    const handleSave = sinon.spy();
    const wrapper = shallow(<SaveBar handleSave={handleSave} />);

    const saveAndKeepEditingButton = wrapper.find('button').at(0);
    expect(saveAndKeepEditingButton.contains('Save and Keep Editing')).to.be
      .true;
    saveAndKeepEditingButton.simulate('click');

    expect(handleSave).to.have.been.calledOnce;
  });

  it('shows spinner when isSaving is true', () => {
    const wrapper = shallow(
      <SaveBar handleSave={handleSave} isSaving={true} />
    );

    // check the the spinner is showing
    expect(wrapper.find('FontAwesome').length).to.equal(1);
  });

  it('shows lastSaved when there is no error', () => {
    const wrapper = shallow(
      <SaveBar handleSave={handleSave} lastSaved={Date.now()} />
    );

    expect(wrapper.find('.lastSavedMessage').text()).to.include(
      'Last saved at:'
    );
  });

  it('shows error when props error is set', () => {
    const wrapper = shallow(
      <SaveBar handleSave={handleSave} error={'There was an error'} />
    );
    expect(wrapper.find('.saveBar').find('FontAwesome').length).to.equal(0);
    expect(
      wrapper.find('.saveBar').contains('Error Saving: There was an error')
    ).to.be.true;
  });

  it('can save and close', () => {
    const handleSave = sinon.spy();
    const wrapper = shallow(<SaveBar handleSave={handleSave} />);

    const saveAndCloseButton = wrapper.find('button').at(1);
    expect(saveAndCloseButton.contains('Save and Close')).to.be.true;
    saveAndCloseButton.simulate('click');

    expect(handleSave).to.have.been.calledOnce;
  });

  it('can show with custom handleView, even if path is given', () => {
    const handleView = sinon.spy();
    sinon.stub(utils, 'navigateToHref');
    const wrapper = shallow(
      <SaveBar
        handleSave={handleSave}
        handleView={handleView}
        pathForShowButton={'/my/path'}
      />
    );

    const showButton = wrapper.find('button').at(0);
    expect(showButton.contains('Show')).to.be.true;
    showButton.simulate('click');

    expect(utils.navigateToHref).not.to.have.been.called;
    expect(handleView).to.have.been.calledOnce;

    utils.navigateToHref.restore();
  });

  it('can show with custom path', () => {
    const path = '/my/path';
    sinon.stub(utils, 'navigateToHref');
    const wrapper = shallow(
      <SaveBar handleSave={handleSave} pathForShowButton={path} />
    );

    const showButton = wrapper.find('button').at(0);
    expect(showButton.contains('Show')).to.be.true;
    showButton.simulate('click');

    expect(utils.navigateToHref).to.have.been.calledWith(path);

    utils.navigateToHref.restore();
  });
});
