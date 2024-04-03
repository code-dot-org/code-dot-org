import $ from 'jquery';
import React from 'react';
import {shallow} from 'enzyme';

import {expect} from '../../../../util/reconfiguredChai';
import {replaceOnWindow, restoreOnWindow} from '../../../../util/testUtils';

import ProjectImport from '@cdo/apps/code-studio/components/header/ProjectImport';

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

    showImportPopupStub = jest
      .spyOn(window.Craft, 'showImportFromShareLinkPopup')
      .mockClear()
      .mockImplementation();
    wrapper = shallow(<ProjectImport />);
  });

  afterEach(() => {
    showImportPopupStub.mockRestore();

    restoreOnWindow('Craft');
    restoreOnWindow('dashboard');
  });

  it('creates an "import from share link" popup', () => {
    wrapper.simulate('click');
    expect(showImportPopupStub.calledOnce).to.be.true;
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
    expect(ajaxStub.calledOnce).to.be.true;
    ajaxStub.mockRestore();
  });

  it('can import from channel-backed sources', () => {
    showImportPopupStub.mockImplementation((...args) =>
      args[0]('/projects/minecraft_hero/123abc')
    );
    const getSourceSpy = jest
      .spyOn(window.dashboard.project, 'getSourceForChannel')
      .mockClear();
    wrapper.simulate('click');
    expect(getSourceSpy.calledOnce).to.be.true;
    expect(getSourceSpy.calledWith('123abc')).to.be.true;
    getSourceSpy.mockRestore();
  });

  it('displays an error if given an invalid link', () => {
    showImportPopupStub.mockImplementation((...args) =>
      args[0]('some invalid link')
    );
    const errorMessageSpy = jest
      .spyOn(window.Craft, 'showErrorMessagePopup')
      .mockClear();
    wrapper.simulate('click');
    expect(errorMessageSpy.calledOnce).to.be.true;
    errorMessageSpy.mockRestore();
  });
});
