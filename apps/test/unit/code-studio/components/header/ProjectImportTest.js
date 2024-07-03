import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import $ from 'jquery';
import React from 'react';

import ProjectImport from '@cdo/apps/code-studio/components/header/ProjectImport';


import {replaceOnWindow, restoreOnWindow} from '../../../../util/testUtils';

describe('ProjectImport', () => {
  let wrapper, showImportPopupStub;

  beforeEach(() => {
    replaceOnWindow('Craft', {
      showImportFromShareLinkPopup: () => {},
      showErrorMessagePopup: () => {},
    });
    replaceOnWindow('dashboard', {
      project: {
        getSourceForChannel: () => {},
      },
    });

    showImportPopupStub = jest.spyOn(window.Craft, 'showImportFromShareLinkPopup').mockClear().mockImplementation();
    wrapper = shallow(<ProjectImport />);
  });

  afterEach(() => {
    showImportPopupStub.mockRestore();

    restoreOnWindow('Craft');
    restoreOnWindow('dashboard');
  });

  it('creates an "import from share link" popup', () => {
    wrapper.simulate('click');
    expect(showImportPopupStub).toHaveBeenCalledTimes(1);
  });

  it('can import from level sources', () => {
    showImportPopupStub.mockImplementation((...args) => args[0]('/c/123abc'));
    const ajaxStub = jest.spyOn($, 'ajax').mockClear().mockImplementation();
    // stub a fake, nonresolving promise
    ajaxStub.mockReturnValue({
      done: () => ({
        error: () => {},
      }),
    });
    wrapper.simulate('click');
    expect(ajaxStub).toHaveBeenCalledTimes(1);
    ajaxStub.mockRestore();
  });

  it('can import from channel-backed sources', () => {
    showImportPopupStub.mockImplementation((...args) => args[0]('/projects/minecraft_hero/123abc'));
    const getSourceSpy = jest.spyOn(window.dashboard.project, 'getSourceForChannel').mockClear();
    wrapper.simulate('click');
    expect(getSourceSpy).toHaveBeenCalledTimes(1);
    expect(getSourceSpy).toHaveBeenCalledWith('123abc');
    getSourceSpy.mockRestore();
  });

  it('displays an error if given an invalid link', () => {
    showImportPopupStub.mockImplementation((...args) => args[0]('some invalid link'));
    const errorMessageSpy = jest.spyOn(window.Craft, 'showErrorMessagePopup').mockClear();
    wrapper.simulate('click');
    expect(errorMessageSpy).toHaveBeenCalledTimes(1);
    errorMessageSpy.mockRestore();
  });
});
