import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import SaveBar from '@cdo/apps/lib/levelbuilder/SaveBar';
import * as utils from '@cdo/apps/utils';

describe('SaveBar', () => {
  let handleSave;
  beforeEach(() => {
    handleSave = jest.fn();
  });

  it('renders default props', () => {
    const wrapper = shallow(<SaveBar handleSave={handleSave} />);
    expect(wrapper.find('button').length).toBe(2); // show button not rendered
    expect(wrapper.find('FontAwesome').length).toBe(0); //spinner isn't showing
  });

  it('can save and keep editing', () => {
    const handleSave = jest.fn();
    const wrapper = shallow(<SaveBar handleSave={handleSave} />);

    const saveAndKeepEditingButton = wrapper.find('button').at(0);
    expect(saveAndKeepEditingButton.contains('Save and Keep Editing')).toBe(
      true
    );
    saveAndKeepEditingButton.simulate('click');

    expect(handleSave).toHaveBeenCalledTimes(1);
  });

  it('shows spinner when isSaving is true', () => {
    const wrapper = shallow(
      <SaveBar handleSave={handleSave} isSaving={true} />
    );

    // check the the spinner is showing
    expect(wrapper.find('FontAwesome').length).toBe(1);
  });

  it('shows lastSaved when there is no error', () => {
    const wrapper = shallow(
      <SaveBar handleSave={handleSave} lastSaved={Date.now()} />
    );

    expect(wrapper.find('.lastSavedMessage').text()).toContain(
      'Last saved at:'
    );
  });

  it('shows error when props error is set', () => {
    const wrapper = shallow(
      <SaveBar handleSave={handleSave} error={'There was an error'} />
    );
    expect(wrapper.find('.saveBar').find('FontAwesome').length).toBe(0);
    expect(
      wrapper.find('.saveBar').contains('Error Saving: There was an error')
    ).toBe(true);
  });

  it('can save and close', () => {
    const handleSave = jest.fn();
    const wrapper = shallow(<SaveBar handleSave={handleSave} />);

    const saveAndCloseButton = wrapper.find('button').at(1);
    expect(saveAndCloseButton.contains('Save and Close')).toBe(true);
    saveAndCloseButton.simulate('click');

    expect(handleSave).toHaveBeenCalledTimes(1);
  });

  it('can show with custom handleView, even if path is given', () => {
    const handleView = jest.fn();
    jest.spyOn(utils, 'navigateToHref').mockClear().mockImplementation();
    const wrapper = shallow(
      <SaveBar
        handleSave={handleSave}
        handleView={handleView}
        pathForShowButton={'/my/path'}
      />
    );

    const showButton = wrapper.find('button').at(0);
    expect(showButton.contains('Show')).toBe(true);
    showButton.simulate('click');

    expect(utils.navigateToHref).not.toHaveBeenCalled();
    expect(handleView).toHaveBeenCalledTimes(1);

    utils.navigateToHref.mockRestore();
  });

  it('can show with custom path', () => {
    const path = '/my/path';
    jest.spyOn(utils, 'navigateToHref').mockClear().mockImplementation();
    const wrapper = shallow(
      <SaveBar handleSave={handleSave} pathForShowButton={path} />
    );

    const showButton = wrapper.find('button').at(0);
    expect(showButton.contains('Show')).toBe(true);
    showButton.simulate('click');

    expect(utils.navigateToHref).toHaveBeenCalledWith(path);

    utils.navigateToHref.mockRestore();
  });
});
