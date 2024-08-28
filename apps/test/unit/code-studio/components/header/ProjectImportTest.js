import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import $ from 'jquery';
import React from 'react';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import ProjectImport from '@cdo/apps/code-studio/components/header/ProjectImport';

import {expect} from '../../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports
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

    showImportPopupStub = sinon.stub(
      window.Craft,
      'showImportFromShareLinkPopup'
    );
    wrapper = shallow(<ProjectImport />);
  });

  afterEach(() => {
    showImportPopupStub.restore();

    restoreOnWindow('Craft');
    restoreOnWindow('dashboard');
  });

  it('creates an "import from share link" popup', () => {
    wrapper.simulate('click');
    expect(showImportPopupStub.calledOnce).to.be.true;
  });

  it('can import from level sources', () => {
    showImportPopupStub.callsArgWith(0, '/c/123abc');
    const ajaxStub = sinon.stub($, 'ajax');
    // stub a fake, nonresolving promise
    ajaxStub.returns({
      done: () => ({
        error: () => {},
      }),
    });
    wrapper.simulate('click');
    expect(ajaxStub.calledOnce).to.be.true;
    ajaxStub.restore();
  });

  it('can import from channel-backed sources', () => {
    showImportPopupStub.callsArgWith(0, '/projects/minecraft_hero/123abc');
    const getSourceSpy = sinon.spy(
      window.dashboard.project,
      'getSourceForChannel'
    );
    wrapper.simulate('click');
    expect(getSourceSpy.calledOnce).to.be.true;
    expect(getSourceSpy.calledWith('123abc')).to.be.true;
    getSourceSpy.restore();
  });

  it('displays an error if given an invalid link', () => {
    showImportPopupStub.callsArgWith(0, 'some invalid link');
    const errorMessageSpy = sinon.spy(window.Craft, 'showErrorMessagePopup');
    wrapper.simulate('click');
    expect(errorMessageSpy.calledOnce).to.be.true;
    errorMessageSpy.restore();
  });
});
