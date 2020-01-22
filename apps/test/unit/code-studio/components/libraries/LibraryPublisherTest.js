import {expect} from '../../../../util/reconfiguredChai';
import React from 'react';
import {shallow} from 'enzyme';
import LibraryPublisher, {
  PublishState
} from '@cdo/apps/code-studio/components/libraries/LibraryPublisher';
import LibraryClientApi from '@cdo/apps/code-studio/components/libraries/LibraryClientApi';
import libraryParser from '@cdo/apps/code-studio/components/libraries/libraryParser';
import sinon from 'sinon';
import {replaceOnWindow, restoreOnWindow} from '../../../../util/testUtils';

describe('LibraryPublisher', () => {
  let publishSpy, libraryClientApi, libraryDetails;
  let defaultSelectedFunctions, sourceFunctionList;
  const defaultDescription = '';
  const librarySource = '//comment\nfunction foo(){}';
  const libraryName = 'libraryName';
  const CHECKBOX_SELECTOR = 'input[type="checkbox"]';

  before(() => {
    replaceOnWindow('dashboard', {
      project: {
        setLibraryName: () => {},
        setLibraryDescription: () => {}
      }
    });
    sinon.stub(window.dashboard.project, 'setLibraryName').returns(undefined);
    sinon
      .stub(window.dashboard.project, 'setLibraryDescription')
      .returns(undefined);
    sinon.stub(libraryParser, 'suggestName').returns(libraryName);
    sinon.stub(libraryParser, 'sanitizeName').returns(libraryName);
    libraryClientApi = new LibraryClientApi('123');
    publishSpy = sinon.stub(libraryClientApi, 'publish');
  });

  after(() => {
    libraryParser.suggestName.restore();
    libraryParser.sanitizeName.restore();
    restoreOnWindow('dashboard');
  });

  let onPublishSuccess, onUnpublishSuccess;
  beforeEach(() => {
    defaultSelectedFunctions = {};
    sourceFunctionList = [{functionName: 'foo', comment: 'comment'}];
    libraryDetails = {
      libraryName: libraryName,
      libraryDescription: defaultDescription,
      selectedFunctions: defaultSelectedFunctions,
      sourceFunctionList: sourceFunctionList,
      librarySource: librarySource
    };
    onPublishSuccess = sinon.stub();
    onUnpublishSuccess = sinon.stub();
  });

  afterEach(() => {
    onPublishSuccess.resetHistory();
    onUnpublishSuccess.resetHistory();
  });

  describe('On Load', () => {
    it('suggests a default library name', () => {
      libraryDetails.libraryName = 'foo';
      let wrapper = shallow(
        <LibraryPublisher
          onPublishSuccess={onPublishSuccess}
          onUnpublishSuccess={onUnpublishSuccess}
          libraryDetails={libraryDetails}
          libraryClientApi={libraryClientApi}
        />
      );

      expect(wrapper.state().libraryName).to.equal(libraryName);
    });

    it('disables checkbox for items without comments', () => {
      libraryDetails.sourceFunctionList.push({
        functionName: 'bar',
        comment: ''
      });
      let wrapper = shallow(
        <LibraryPublisher
          onPublishSuccess={onPublishSuccess}
          onUnpublishSuccess={onUnpublishSuccess}
          libraryDetails={libraryDetails}
          libraryClientApi={libraryClientApi}
        />
      );

      let checkboxes = wrapper.find(CHECKBOX_SELECTOR);
      expect(checkboxes.first().prop('disabled')).to.be.false;
      expect(checkboxes.last().prop('disabled')).to.be.true;
    });
  });

  describe('publish', () => {
    let wrapper;
    const description = 'description';
    const selectedFunctions = {foo: true};
    beforeEach(() => {
      wrapper = shallow(
        <LibraryPublisher
          onPublishSuccess={onPublishSuccess}
          onUnpublishSuccess={onUnpublishSuccess}
          libraryDetails={libraryDetails}
          libraryClientApi={libraryClientApi}
        />
      );
    });

    it('is disabled when no functions are checked', () => {
      wrapper.setState({
        libraryDescription: description
      });

      wrapper.instance().publish();
      wrapper.update();

      expect(wrapper.state().publishState).to.equal(PublishState.INVALID_INPUT);
    });

    it('is disabled when description is unset', () => {
      wrapper.setState({
        selectedFunctions: selectedFunctions
      });

      wrapper.instance().publish();
      wrapper.update();

      expect(wrapper.state().publishState).to.equal(PublishState.INVALID_INPUT);
    });

    it('is enabled once description and functions are set', () => {
      wrapper.instance().publish();
      wrapper.update();
      expect(wrapper.state().publishState).to.equal(PublishState.INVALID_INPUT);

      wrapper.instance().resetErrorMessage();
      wrapper.update();
      expect(wrapper.state().publishState).to.equal(PublishState.INVALID_INPUT);

      wrapper.setState({
        selectedFunctions: selectedFunctions,
        libraryDescription: description
      });
      wrapper.instance().resetErrorMessage();
      wrapper.update();

      expect(wrapper.state().publishState).to.equal(PublishState.DEFAULT);
    });

    describe('with valid input', () => {
      it('sets error state when publish fails', () => {
        publishSpy.callsArg(1);
        sinon.stub(console, 'warn');
        wrapper.setState({
          libraryDescription: description,
          selectedFunctions: selectedFunctions
        });

        wrapper.instance().publish();
        wrapper.update();

        expect(wrapper.state().publishState).to.equal(
          PublishState.ERROR_PUBLISH
        );

        console.warn.restore();
      });

      it('calls onPublishSuccess when it succeeds', () => {
        publishSpy.callsArg(2);
        wrapper.setState({
          libraryDescription: description,
          selectedFunctions: selectedFunctions
        });

        wrapper.instance().publish();
        wrapper.update();

        expect(onPublishSuccess.called).to.be.true;
      });
    });
  });

  it('publishes only the selected functions and description', () => {
    let libraryJsonSpy = sinon.stub(libraryParser, 'createLibraryJson');
    let description = 'description';
    let selectedFunctions = {bar: true};
    let newFunction = {functionName: 'bar', comment: 'comment'};
    libraryDetails.sourceFunctionList.push(newFunction);
    let wrapper = shallow(
      <LibraryPublisher
        onPublishSuccess={onPublishSuccess}
        onUnpublishSuccess={onUnpublishSuccess}
        libraryDetails={libraryDetails}
        libraryClientApi={libraryClientApi}
      />
    );

    wrapper.setState({
      libraryDescription: description,
      selectedFunctions: selectedFunctions
    });

    wrapper.instance().publish();
    wrapper.update();

    expect(libraryJsonSpy).to.have.been.calledWith(
      librarySource,
      [newFunction],
      libraryName,
      description
    );

    libraryParser.createLibraryJson.restore();
  });
});
