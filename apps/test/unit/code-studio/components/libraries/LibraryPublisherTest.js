import {assert, expect} from '../../../../util/reconfiguredChai';
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
  let publishSpy,
    libraryClientApi,
    libraryDetails,
    onPublishSuccess,
    onUnpublishSuccess,
    unpublishProjectLibrary,
    findProfanity,
    defaultSelectedFunctions,
    sourceFunctionList,
    DEFAULT_PROPS;
  const defaultDescription = '';
  const librarySource = '//comment\nfunction foo(){}';
  const libraryName = 'libraryName';
  const CHECKBOX_SELECTOR = 'input[type="checkbox"]';

  before(() => {
    replaceOnWindow('dashboard', {
      project: {
        setLibraryDetails: () => {}
      }
    });
    sinon
      .stub(window.dashboard.project, 'setLibraryDetails')
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
    unpublishProjectLibrary = sinon.stub();
    findProfanity = sinon.stub().resolves(null);

    DEFAULT_PROPS = {
      onPublishSuccess,
      onUnpublishSuccess,
      libraryDetails,
      libraryClientApi,
      unpublishProjectLibrary,
      findProfanity
    };
  });

  afterEach(() => {
    onPublishSuccess.resetHistory();
    onUnpublishSuccess.resetHistory();
  });

  describe('On Load', () => {
    it('suggests a default library name', () => {
      libraryDetails.libraryName = 'foo';
      let wrapper = shallow(
        <LibraryPublisher {...DEFAULT_PROPS} libraryDetails={libraryDetails} />
      );

      expect(wrapper.state().libraryName).to.equal(libraryName);
      expect(
        wrapper
          .find('input')
          .first()
          .props().value
      ).to.equal(libraryName);
    });

    it('filters invalid functions from selectedFunctions', () => {
      libraryDetails.sourceFunctionList = libraryDetails.sourceFunctionList.concat(
        [
          {functionName: 'invalidFunc', comment: ''},
          {functionName: 'validFunc', comment: 'hey'}
        ]
      );
      libraryDetails.selectedFunctions = {
        invalidFunc: true,
        validFunc: true
      };
      let wrapper = shallow(
        <LibraryPublisher {...DEFAULT_PROPS} libraryDetails={libraryDetails} />
      );

      assert.deepEqual({validFunc: true}, wrapper.state('selectedFunctions'));
    });

    it('disables checkbox for items without comments', () => {
      libraryDetails.sourceFunctionList.push({
        functionName: 'bar',
        comment: ''
      });
      let wrapper = shallow(
        <LibraryPublisher {...DEFAULT_PROPS} libraryDetails={libraryDetails} />
      );

      let checkboxes = wrapper.find(CHECKBOX_SELECTOR);
      expect(checkboxes.at(1).prop('disabled')).to.be.false;
      expect(checkboxes.at(2).prop('disabled')).to.be.true;
    });

    it('disables checkbox for functions with duplicate names', () => {
      libraryDetails.sourceFunctionList = libraryDetails.sourceFunctionList.concat(
        [
          {functionName: 'duplicate', comment: 'first dup!'},
          {functionName: 'duplicate', comment: 'another dup!'}
        ]
      );
      let wrapper = shallow(
        <LibraryPublisher {...DEFAULT_PROPS} libraryDetails={libraryDetails} />
      );

      let checkboxes = wrapper.find(CHECKBOX_SELECTOR);
      expect(checkboxes.at(1).prop('disabled')).to.be.false;
      expect(checkboxes.at(2).prop('disabled')).to.be.true;
    });

    it('checks checkboxes of selected functions', () => {
      libraryDetails.sourceFunctionList.push({
        functionName: 'bar',
        comment: 'comment'
      });
      libraryDetails.sourceFunctionList.push({
        functionName: 'baz',
        comment: ''
      });
      libraryDetails.selectedFunctions = {bar: true, baz: true};
      let wrapper = shallow(
        <LibraryPublisher {...DEFAULT_PROPS} libraryDetails={libraryDetails} />
      );

      let checkboxes = wrapper.find(CHECKBOX_SELECTOR);
      expect(checkboxes.at(1).prop('disabled')).to.be.false;
      expect(checkboxes.at(2).prop('disabled')).to.be.false;
      expect(checkboxes.at(3).prop('disabled')).to.be.true;
      expect(checkboxes.at(1).prop('checked')).to.be.false;
      expect(checkboxes.at(2).prop('checked')).to.be.true;
      expect(checkboxes.at(3).prop('checked')).to.be.false;
    });
  });

  describe('validateAndPublish', () => {
    let wrapper, server;
    const description = 'description';
    const selectedFunctions = {foo: true};

    beforeEach(() => {
      wrapper = shallow(<LibraryPublisher {...DEFAULT_PROPS} />);
      server = sinon.fakeServer.create();
      server.autoRespond = true;
    });

    afterEach(() => {
      server.restore();
    });

    const stubFindProfanityRequest = (status, serverData) => {
      server.respondWith('POST', `/profanity/find`, [
        status,
        {'Content-Type': 'application/json'},
        JSON.stringify(serverData)
      ]);
    };

    it('is disabled when no functions are checked', async () => {
      wrapper.setState({
        libraryDescription: description
      });

      await wrapper.instance().validateAndPublish();

      expect(wrapper.state().publishState).to.equal(PublishState.INVALID_INPUT);
    });

    it('is disabled when description is unset', async () => {
      wrapper.setState({
        selectedFunctions: selectedFunctions
      });

      await wrapper.instance().validateAndPublish();

      expect(wrapper.state().publishState).to.equal(PublishState.INVALID_INPUT);
    });

    it('is enabled once description and functions are set', async () => {
      await wrapper.instance().validateAndPublish();
      expect(wrapper.state().publishState).to.equal(PublishState.INVALID_INPUT);

      wrapper.instance().resetErrorMessage();
      expect(wrapper.state().publishState).to.equal(PublishState.INVALID_INPUT);

      wrapper.setState({
        selectedFunctions: selectedFunctions,
        libraryDescription: description
      });
      wrapper.instance().resetErrorMessage();

      expect(wrapper.state().publishState).to.equal(PublishState.DEFAULT);
    });

    it('does not call publish if profanity is found', async () => {
      stubFindProfanityRequest(200, ['fart']);
      wrapper.setState({
        libraryDescription: description,
        selectedFunctions: selectedFunctions
      });
      const publishSpy = sinon.spy(wrapper.instance(), 'publish');

      await wrapper.instance().validateAndPublish();

      expect(wrapper.state().publishState).to.equal(PublishState.PROFANE_INPUT);
      expect(publishSpy.callCount).to.equal(0);
    });

    it('calls publish if no profanity is found', async () => {
      stubFindProfanityRequest(200, null);
      wrapper.setState({
        libraryDescription: description,
        selectedFunctions: selectedFunctions
      });
      const publishSpy = sinon.spy(wrapper.instance(), 'publish');

      await wrapper.instance().validateAndPublish();

      expect(publishSpy.callCount).to.equal(1);
    });

    it('calls publish if request to find profanity fails', async () => {
      stubFindProfanityRequest(500, null);
      wrapper.setState({
        libraryDescription: description,
        selectedFunctions: selectedFunctions
      });
      const publishSpy = sinon.spy(wrapper.instance(), 'publish');

      await wrapper.instance().validateAndPublish();

      expect(publishSpy.callCount).to.equal(1);
    });

    describe('with valid input', () => {
      it('sets error state when publish fails', async () => {
        publishSpy.callsArgWith(1, {
          message: ''
        });
        sinon.stub(console, 'warn');
        wrapper.setState({
          libraryDescription: description,
          selectedFunctions: selectedFunctions
        });

        await wrapper.instance().validateAndPublish();

        expect(wrapper.state().publishState).to.equal(
          PublishState.ERROR_PUBLISH
        );

        console.warn.restore();
      });

      it('sets error state if library is too long', async () => {
        publishSpy.callsArgWith(1, {
          message: 'httpStatusCode: 413; status: error; error: '
        });
        sinon.stub(console, 'warn');
        wrapper.setState({
          libraryDescription: description,
          selectedFunctions: selectedFunctions
        });

        await wrapper.instance().validateAndPublish();

        expect(wrapper.state().publishState).to.equal(PublishState.TOO_LONG);

        console.warn.restore();
      });

      it('calls onPublishSuccess when it succeeds', async () => {
        publishSpy.callsArg(2);
        wrapper.setState({
          libraryDescription: description,
          selectedFunctions: selectedFunctions
        });

        await wrapper.instance().validateAndPublish();

        expect(onPublishSuccess.called).to.be.true;
      });

      it('publishes only the selected functions and description', async () => {
        let libraryJsonSpy = sinon.stub(libraryParser, 'createLibraryJson');
        let description = 'description';
        let selectedFunctions = {bar: true};
        let newFunction = {functionName: 'bar', comment: 'comment'};
        libraryDetails.sourceFunctionList.push(newFunction);
        let wrapper = shallow(
          <LibraryPublisher
            {...DEFAULT_PROPS}
            libraryDetails={libraryDetails}
          />
        );

        wrapper.setState({
          libraryDescription: description,
          selectedFunctions: selectedFunctions
        });

        await wrapper.instance().validateAndPublish();

        expect(libraryJsonSpy).to.have.been.calledWith(
          librarySource,
          [newFunction],
          libraryName,
          description
        );

        libraryParser.createLibraryJson.restore();
      });
    });
  });

  describe('unpublish', () => {
    let wrapper, deleteSpy;
    beforeEach(() => {
      deleteSpy = sinon.stub(libraryClientApi, 'delete');
      libraryDetails.alreadyPublished = true;
      wrapper = shallow(
        <LibraryPublisher {...DEFAULT_PROPS} libraryDetails={libraryDetails} />
      );
    });

    afterEach(() => {
      libraryClientApi.delete.restore();
    });

    it('calls onUnpublishSuccess when it succeeds', () => {
      deleteSpy.callsArg(0);
      wrapper.instance().unpublish();
      expect(onUnpublishSuccess.called).to.be.true;
    });

    it('sets ERROR_UNPUBLISH when it fails', () => {
      sinon.stub(console, 'warn');
      deleteSpy.callsArg(1);
      wrapper.instance().unpublish();
      expect(wrapper.state().publishState).to.equal(
        PublishState.ERROR_UNPUBLISH
      );
      expect(onUnpublishSuccess.called).to.be.false;
      console.warn.restore();
    });
  });

  describe('isFunctionValid', () => {
    it('is false if the function does not have a comment', () => {
      let wrapper = shallow(<LibraryPublisher {...DEFAULT_PROPS} />);
      const isValid = wrapper
        .instance()
        .isFunctionValid({functionName: 'invalidFunc', comment: ''});
      expect(isValid).to.be.false;
    });

    it('is false if the function is a duplicate', () => {
      const duplicateFunction = {functionName: 'duplicate', comment: 'comment'};
      libraryDetails.sourceFunctionList = [
        {...duplicateFunction},
        {...duplicateFunction}
      ];
      let wrapper = shallow(
        <LibraryPublisher {...DEFAULT_PROPS} libraryDetails={libraryDetails} />
      );
      const isValid = wrapper.instance().isFunctionValid(duplicateFunction);
      expect(isValid).to.be.false;
    });

    it('is true if the function has a comment and is not a duplicate', () => {
      const validFunction = {functionName: 'validFunc', comment: 'hey'};
      libraryDetails.sourceFunctionList = [validFunction];
      let wrapper = shallow(
        <LibraryPublisher {...DEFAULT_PROPS} libraryDetails={libraryDetails} />
      );
      const isValid = wrapper.instance().isFunctionValid(validFunction);
      expect(isValid).to.be.true;
    });
  });

  describe('allFunctionsSelected', () => {
    beforeEach(() => {
      libraryDetails.sourceFunctionList = [
        {functionName: 'foo', comment: 'comment'},
        {functionName: 'bar', comment: 'comment'},
        {functionName: 'invalidFunc'}
      ];
    });

    it('is false if any valid functions are not selected', () => {
      libraryDetails.selectedFunctions = {foo: true};
      let wrapper = shallow(
        <LibraryPublisher {...DEFAULT_PROPS} libraryDetails={libraryDetails} />
      );
      expect(wrapper.instance().allFunctionsSelected()).to.be.false;
    });

    it('is true if all valid functions are selected', () => {
      libraryDetails.selectedFunctions = {foo: true, bar: true};
      let wrapper = shallow(
        <LibraryPublisher {...DEFAULT_PROPS} libraryDetails={libraryDetails} />
      );
      expect(wrapper.instance().allFunctionsSelected()).to.be.true;
    });
  });

  describe('toggleAllFunctionsSelected', () => {
    beforeEach(() => {
      libraryDetails.sourceFunctionList = [
        {functionName: 'foo', comment: 'comment'},
        {functionName: 'bar', comment: 'comment'},
        {functionName: 'invalidFunc'}
      ];
    });

    it('empties selectedFunctions in state if all functions are selected', () => {
      libraryDetails.selectedFunctions = {foo: true, bar: true};
      let wrapper = shallow(
        <LibraryPublisher {...DEFAULT_PROPS} libraryDetails={libraryDetails} />
      );
      wrapper.instance().toggleAllFunctionsSelected();
      assert.deepEqual({}, wrapper.state('selectedFunctions'));
    });

    it('selects all valid functions if not all functions are selected', () => {
      libraryDetails.selectedFunctions = {foo: true};
      let wrapper = shallow(
        <LibraryPublisher {...DEFAULT_PROPS} libraryDetails={libraryDetails} />
      );
      wrapper.instance().toggleAllFunctionsSelected();
      assert.deepEqual(
        {foo: true, bar: true},
        wrapper.state('selectedFunctions')
      );
    });
  });
});
