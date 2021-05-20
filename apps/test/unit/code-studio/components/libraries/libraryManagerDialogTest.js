import {expect, assert} from '../../../../util/reconfiguredChai';
import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import LibraryManagerDialog, {
  mapUserNameToProjectLibraries
} from '@cdo/apps/code-studio/components/libraries/LibraryManagerDialog';
import LibraryListItem from '@cdo/apps/code-studio/components/libraries/LibraryListItem';
import LibraryClientApi from '@cdo/apps/code-studio/components/libraries/LibraryClientApi';
import libraryParser from '@cdo/apps/code-studio/components/libraries/libraryParser';
import {replaceOnWindow, restoreOnWindow} from '../../../../util/testUtils';

describe('LibraryManagerDialog', () => {
  const ID = 123;
  const IMPORT_ERROR_MSG =
    'An error occurred while importing your library. Please make sure you have a valid ID and an internet connection.';

  describe('viewCode', () => {
    it('sets displayLibrary and displayLibraryMode in state', () => {
      const wrapper = shallow(
        <LibraryManagerDialog onClose={() => {}} isOpen={false} />
      );
      let library = {foo: 'bar'};
      expect(wrapper.state().displayLibrary).to.be.null;
      expect(wrapper.state().displayLibraryMode).to.equal('none');
      wrapper.instance().viewCode(library);
      expect(wrapper.state().displayLibraryMode).to.equal('view');
      expect(wrapper.state().displayLibrary).to.deep.equal(library);
      library = {new: 'library'};
      wrapper.instance().viewCode(library, 'update');
      expect(wrapper.state().displayLibraryMode).to.equal('update');
      expect(wrapper.state().displayLibrary).to.deep.equal(library);
      wrapper.instance().viewCode(library, null);
      expect(wrapper.state().displayLibraryMode).to.equal('view');
      expect(wrapper.state().displayLibrary).to.deep.equal(library);
    });
  });

  describe('cachedClassLibraries', () => {
    it('are cleared onClose', () => {
      const wrapper = shallow(
        <LibraryManagerDialog onClose={() => {}} isOpen={true} />
      );
      let library = {channelId: ID};
      wrapper.setState({cachedClassLibraries: [library]});
      expect(wrapper.state().cachedClassLibraries).to.deep.equal([library]);
      wrapper.instance().closeLibraryManager();
      expect(wrapper.state().cachedClassLibraries).to.be.empty;
    });

    it('are used by fetchLatestLibrary', () => {
      let callback = sinon.fake();
      const wrapper = shallow(
        <LibraryManagerDialog onClose={() => {}} isOpen={true} />
      );
      let library = {channelId: ID};
      wrapper.setState({cachedClassLibraries: [library]});
      wrapper.instance().fetchLatestLibrary(ID, callback);
      expect(callback).to.have.been.calledOnce;
      expect(callback).to.have.been.calledWith(library);
    });

    it('are set by fetchLatestLibrary', () => {
      let library = {channelId: ID};
      let callback = sinon.fake();
      sinon.stub(libraryParser, 'prepareLibraryForImport').returns(library);
      sinon
        .stub(LibraryClientApi.prototype, 'fetchByVersion')
        .callsArgWith(1, library);
      sinon
        .stub(LibraryClientApi.prototype, 'fetchLatestVersionId')
        .callsArgWith(0, ID);

      const wrapper = shallow(
        <LibraryManagerDialog onClose={() => {}} isOpen={true} />
      );
      wrapper.instance().fetchLatestLibrary(ID, callback);
      expect(wrapper.state().cachedClassLibraries).to.deep.equal([library]);
      expect(callback).to.have.been.calledOnce;
      expect(callback).to.have.been.calledWith(library);

      LibraryClientApi.prototype.fetchLatestVersionId.restore();
      LibraryClientApi.prototype.fetchByVersion.restore();
      libraryParser.prepareLibraryForImport.restore();
    });
  });

  describe('With call to onOpen', () => {
    let getProjectLibrariesStub, getClassLibrariesStub;
    beforeEach(() => {
      replaceOnWindow('dashboard', {
        project: {
          getProjectLibraries: () => {},
          setProjectLibraries: () => {}
        }
      });
      getProjectLibrariesStub = sinon.stub(
        window.dashboard.project,
        'getProjectLibraries'
      );
      getClassLibrariesStub = sinon.stub(
        LibraryClientApi.prototype,
        'getClassLibraries'
      );
    });

    afterEach(() => {
      window.dashboard.project.getProjectLibraries.restore();
      LibraryClientApi.prototype.getClassLibraries.restore();
      restoreOnWindow('dashboard');
    });

    it('displays no LibraryListItem when no libraries exist', () => {
      getProjectLibrariesStub.returns(undefined);
      getClassLibrariesStub.returns(undefined);
      const wrapper = shallow(
        <LibraryManagerDialog onClose={() => {}} isOpen={true} />
      );
      expect(wrapper.find(LibraryListItem)).to.be.empty;
    });

    it('displays LibraryListItem when the project contains libraries', () => {
      getProjectLibrariesStub.returns([
        {name: 'first', channelId: 'abc123', sectionName: 'section'},
        {name: 'second', channelId: 'def456', sectionName: 'section'}
      ]);
      const wrapper = shallow(
        <LibraryManagerDialog onClose={() => {}} isOpen={true} />
      );
      wrapper.instance().onOpen();
      expect(wrapper.find(LibraryListItem)).to.have.lengthOf(2);
      expect(wrapper.state().classLibraries).to.have.lengthOf(0);
      expect(wrapper.state().projectLibraries).to.have.lengthOf(2);
    });

    it('displays LibraryListItem when class libraries are available', () => {
      getProjectLibrariesStub.returns(undefined);
      getClassLibrariesStub.callsFake(callback =>
        callback([
          {channel: '1', sectionName: 'section'},
          {channel: '2', sectionName: 'section'}
        ])
      );
      const wrapper = shallow(
        <LibraryManagerDialog onClose={() => {}} isOpen={true} />
      );
      wrapper.instance().onOpen();
      expect(wrapper.find(LibraryListItem)).to.have.lengthOf(2);
      expect(wrapper.state().classLibraries).to.have.lengthOf(2);
      expect(wrapper.state().projectLibraries).to.have.lengthOf(0);
    });

    it('displays all libraries from the project and the class', () => {
      getProjectLibrariesStub.returns([
        {name: 'first', channelId: 'abc123', sectionName: 'section'},
        {name: 'second', channelId: 'def456', sectionName: 'section'}
      ]);
      getClassLibrariesStub.callsFake(callback =>
        callback([
          {channel: '1', sectionName: 'section'},
          {channel: '2', sectionName: 'section'}
        ])
      );
      const wrapper = shallow(
        <LibraryManagerDialog onClose={() => {}} isOpen={true} />
      );
      wrapper.instance().onOpen();
      expect(wrapper.find(LibraryListItem)).to.have.lengthOf(4);
      expect(wrapper.state().classLibraries).to.have.lengthOf(2);
      expect(wrapper.state().projectLibraries).to.have.lengthOf(2);
    });

    it('allows filtering class libraries by section', () => {
      getProjectLibrariesStub.returns(undefined);
      getClassLibrariesStub.callsFake(callback =>
        callback([
          {channel: 'abc123', sectionName: 'section1'},
          {channel: 'def456', sectionName: 'section2'},
          {channel: 'ghi789', sectionName: 'section1'},
          {channel: 'jkl1011', sectionName: 'section3'}
        ])
      );
      const wrapper = shallow(
        <LibraryManagerDialog onClose={() => {}} isOpen={true} />
      );
      wrapper.instance().onOpen();
      expect(wrapper.find(LibraryListItem)).to.have.lengthOf(4);
      wrapper.setState({sectionFilter: 'section1'});
      expect(wrapper.find(LibraryListItem)).to.have.lengthOf(2);
    });

    it('setLibraryToImport sets the import library', () => {
      getProjectLibrariesStub.returns(undefined);
      const wrapper = shallow(
        <LibraryManagerDialog onClose={() => {}} isOpen={true} />
      );
      wrapper.instance().onOpen();
      wrapper.instance().setLibraryToImport({target: {value: 'id'}});
      expect(wrapper.state().importLibraryId).to.equal('id');
    });

    it('setLibraryToImport resets the error in state to null', () => {
      const wrapper = shallow(
        <LibraryManagerDialog onClose={() => {}} isOpen={true} />
      );
      wrapper
        .instance()
        .setState({errorMessages: {importFromId: IMPORT_ERROR_MSG}});

      wrapper.instance().setLibraryToImport({target: {value: 'id'}});
      expect(wrapper.state().errorMessages.importFromId).to.be.undefined;
    });

    it('addLibraryById adds the library to the project if given libraryJson', () => {
      let setProjectLibrariesSpy = sinon.spy(
        window.dashboard.project,
        'setProjectLibraries'
      );
      const wrapper = shallow(
        <LibraryManagerDialog onClose={() => {}} isOpen={true} />
      );
      const library = {libraryName: 'my favorite library'};

      wrapper.instance().addLibraryById(library, null);
      expect(setProjectLibrariesSpy).to.have.been.called;
      setProjectLibrariesSpy.restore();
    });

    it('addLibraryById sets an error in state if given an error', () => {
      const wrapper = shallow(
        <LibraryManagerDialog onClose={() => {}} isOpen={true} />
      );
      expect(wrapper.state().errorMessages.importFromId).to.be.undefined;
      wrapper.instance().addLibraryById(null, 'an error occurred!');
      expect(wrapper.state().errorMessages.importFromId).to.equal(
        IMPORT_ERROR_MSG
      );
    });

    it('removeLibrary calls setProjectLibrary without the given library', () => {
      const projectLibraries = [
        {name: 'first', channelId: 'abc123', sectionName: 'section'},
        {name: 'second', channelId: 'def456', sectionName: 'section'}
      ];
      getProjectLibrariesStub.returns(projectLibraries);
      let setProjectLibraries = sinon.spy(
        window.dashboard.project,
        'setProjectLibraries'
      );
      const wrapper = shallow(
        <LibraryManagerDialog onClose={() => {}} isOpen={true} />
      );
      wrapper.instance().onOpen();
      expect(setProjectLibraries.notCalled).to.be.true;
      wrapper.instance().removeLibrary('abc123');
      expect(setProjectLibraries.withArgs([projectLibraries[1]]).calledOnce).to
        .be.true;
      window.dashboard.project.setProjectLibraries.restore();
    });
  });

  describe('fetchUpdates', () => {
    let wrapper, server;

    beforeEach(() => {
      wrapper = shallow(
        <LibraryManagerDialog onClose={() => {}} isOpen={false} />
      );
      server = sinon.fakeServer.create();
    });

    afterEach(() => {
      server.restore();
    });

    it('sets updatedLibraryChannels in state', () => {
      const libraries = [
        {channelId: 'abc123', versionId: '1'},
        {channelId: 'def456', versionId: '2'}
      ];
      server.respondWith('GET', /\/libraries\/get_updates\?libraries=.+/, [
        200,
        {'Content-Type': 'application/json'},
        '["abc123"]'
      ]);

      wrapper.instance().fetchUpdates(libraries);
      server.respond();

      expect(server.requests.length).to.equal(1);
      expect(server.requests[0].url).to.equal(
        '/libraries/get_updates?libraries=[{"channel_id":"abc123","version":"1"},{"channel_id":"def456","version":"2"}]'
      );
      assert.deepEqual(wrapper.state('updatedLibraryChannels'), ['abc123']);
    });

    it('does not request updates if there are no libraries', () => {
      wrapper.instance().fetchUpdates([]);
      server.respond();

      expect(server.requests.length).to.equal(0);
    });
  });

  describe('renderDisplayLibrary', () => {
    let wrapper, library;

    beforeEach(() => {
      wrapper = shallow(
        <LibraryManagerDialog onClose={() => {}} isOpen={false} />
      );
      library = {
        name: 'MyLibrary',
        description: 'Very fun!',
        source: 'function myLibrary() {};'
      };
    });

    it('returns the view mode component if displayLibraryMode is "view"', () => {
      wrapper.setState({displayLibrary: library, displayLibraryMode: 'view'});

      const libraryComponent = wrapper.instance().renderDisplayLibrary();
      expect(libraryComponent.props.title).to.equal(library.name);
      expect(libraryComponent.props.description).to.equal(library.description);
      expect(libraryComponent.props.sourceCode).to.equal(library.source);
      expect(libraryComponent.props.buttons).to.be.undefined;
    });

    it('returns the update mode component if displayLibraryMode is "update"', () => {
      wrapper.setState({displayLibrary: library, displayLibraryMode: 'update'});

      const libraryComponent = wrapper.instance().renderDisplayLibrary();
      expect(libraryComponent.props.title).to.equal(
        `Are you sure you want to update ${library.name}?`
      );
      expect(libraryComponent.props.description).to.equal(library.description);
      expect(libraryComponent.props.sourceCode).to.equal(library.source);
      expect(libraryComponent.props.buttons).to.not.be.undefined;
    });

    it('returns null if displayLibraryMode is not "update" or "view"', () => {
      wrapper.setState({displayLibrary: library, displayLibraryMode: 'hi'});

      const libraryComponent = wrapper.instance().renderDisplayLibrary();
      expect(libraryComponent).to.be.null;
    });

    it('returns null if displayLibrary is not set in state', () => {
      wrapper.setState({displayLibrary: null, displayLibraryMode: 'view'});

      const libraryComponent = wrapper.instance().renderDisplayLibrary();
      expect(libraryComponent).to.be.null;
    });
  });

  describe('mapUserNameToProjectLibraries', () => {
    it('maps userName from classLibraries to project libraries', () => {
      const projectLibraries = [{channelId: '123456'}, {channelId: '654321'}];
      const classLibraries = [{channel: '123456', userName: 'Library Author'}];

      const mappedProjectLibraries = mapUserNameToProjectLibraries(
        projectLibraries,
        classLibraries
      );

      expect(mappedProjectLibraries[0].userName).to.equal('Library Author');
      expect(mappedProjectLibraries[1].userName).to.be.undefined;
    });
  });
});
