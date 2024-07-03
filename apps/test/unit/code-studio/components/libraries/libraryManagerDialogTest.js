import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import LibraryClientApi from '@cdo/apps/code-studio/components/libraries/LibraryClientApi';
import LibraryListItem from '@cdo/apps/code-studio/components/libraries/LibraryListItem';
import LibraryManagerDialog, {
  mapUserNameToProjectLibraries,
} from '@cdo/apps/code-studio/components/libraries/LibraryManagerDialog';
import libraryParser from '@cdo/apps/code-studio/components/libraries/libraryParser';

import {assert} from '../../../../util/reconfiguredChai';
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
      expect(wrapper.state().displayLibrary).toBeNull();
      expect(wrapper.state().displayLibraryMode).toBe('none');
      wrapper.instance().viewCode(library);
      expect(wrapper.state().displayLibraryMode).toBe('view');
      expect(wrapper.state().displayLibrary).toEqual(library);
      library = {new: 'library'};
      wrapper.instance().viewCode(library, 'update');
      expect(wrapper.state().displayLibraryMode).toBe('update');
      expect(wrapper.state().displayLibrary).toEqual(library);
      wrapper.instance().viewCode(library, null);
      expect(wrapper.state().displayLibraryMode).toBe('view');
      expect(wrapper.state().displayLibrary).toEqual(library);
    });
  });

  describe('cachedClassLibraries', () => {
    it('are cleared onClose', () => {
      const wrapper = shallow(
        <LibraryManagerDialog onClose={() => {}} isOpen={true} />
      );
      let library = {channelId: ID};
      wrapper.setState({cachedClassLibraries: [library]});
      expect(wrapper.state().cachedClassLibraries).toEqual([library]);
      wrapper.instance().closeLibraryManager();
      expect(wrapper.state().cachedClassLibraries).toHaveLength(0);
    });

    it('are used by fetchLatestLibrary', () => {
      let callback = sinon.fake();
      const wrapper = shallow(
        <LibraryManagerDialog onClose={() => {}} isOpen={true} />
      );
      let library = {channelId: ID};
      wrapper.setState({cachedClassLibraries: [library]});
      wrapper.instance().fetchLatestLibrary(ID, callback);
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(library);
    });

    it('are set by fetchLatestLibrary', () => {
      let library = {channelId: ID};
      let callback = sinon.fake();
      jest.spyOn(libraryParser, 'prepareLibraryForImport').mockClear().mockReturnValue(library);
      jest.spyOn(LibraryClientApi.prototype, 'fetchByVersion').mockClear().mockImplementation().mockImplementation((...args) => args[1](library));
      jest.spyOn(LibraryClientApi.prototype, 'fetchLatestVersionId').mockClear().mockImplementation().mockImplementation((...args) => args[0](ID));

      const wrapper = shallow(
        <LibraryManagerDialog onClose={() => {}} isOpen={true} />
      );
      wrapper.instance().fetchLatestLibrary(ID, callback);
      expect(wrapper.state().cachedClassLibraries).toEqual([library]);
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(library);

      LibraryClientApi.prototype.fetchLatestVersionId.mockRestore();
      LibraryClientApi.prototype.fetchByVersion.mockRestore();
      libraryParser.prepareLibraryForImport.mockRestore();
    });
  });

  describe('With call to onOpen', () => {
    let getProjectLibrariesStub, getClassLibrariesStub;
    beforeEach(() => {
      replaceOnWindow('dashboard', {
        project: {
          getProjectLibraries: () => {},
          setProjectLibraries: () => {},
        },
      });
      getProjectLibrariesStub = jest.spyOn(window.dashboard.project, 'getProjectLibraries').mockClear().mockImplementation();
      getClassLibrariesStub = jest.spyOn(LibraryClientApi.prototype, 'getClassLibraries').mockClear().mockImplementation();
    });

    afterEach(() => {
      window.dashboard.project.getProjectLibraries.mockRestore();
      LibraryClientApi.prototype.getClassLibraries.mockRestore();
      restoreOnWindow('dashboard');
    });

    it('displays no LibraryListItem when no libraries exist', () => {
      getProjectLibrariesStub.mockReturnValue(undefined);
      getClassLibrariesStub.mockReturnValue(undefined);
      const wrapper = shallow(
        <LibraryManagerDialog onClose={() => {}} isOpen={true} />
      );
      expect(wrapper.find(LibraryListItem)).toHaveLength(0);
    });

    it('displays LibraryListItem when the project contains libraries', () => {
      getProjectLibrariesStub.mockReturnValue([
        {name: 'first', channelId: 'abc123', sectionName: 'section'},
        {name: 'second', channelId: 'def456', sectionName: 'section'},
      ]);
      const wrapper = shallow(
        <LibraryManagerDialog onClose={() => {}} isOpen={true} />
      );
      wrapper.instance().onOpen();
      expect(wrapper.find(LibraryListItem)).toHaveLength(2);
      expect(wrapper.state().classLibraries).toHaveLength(0);
      expect(wrapper.state().projectLibraries).toHaveLength(2);
    });

    it('displays LibraryListItem when class libraries are available', () => {
      getProjectLibrariesStub.mockReturnValue(undefined);
      getClassLibrariesStub.callsFake(callback =>
        callback([
          {channel: '1', sectionName: 'section'},
          {channel: '2', sectionName: 'section'},
        ])
      );
      const wrapper = shallow(
        <LibraryManagerDialog onClose={() => {}} isOpen={true} />
      );
      wrapper.instance().onOpen();
      expect(wrapper.find(LibraryListItem)).toHaveLength(2);
      expect(wrapper.state().classLibraries).toHaveLength(2);
      expect(wrapper.state().projectLibraries).toHaveLength(0);
    });

    it('displays all libraries from the project and the class', () => {
      getProjectLibrariesStub.mockReturnValue([
        {name: 'first', channelId: 'abc123', sectionName: 'section'},
        {name: 'second', channelId: 'def456', sectionName: 'section'},
      ]);
      getClassLibrariesStub.callsFake(callback =>
        callback([
          {channel: '1', sectionName: 'section'},
          {channel: '2', sectionName: 'section'},
        ])
      );
      const wrapper = shallow(
        <LibraryManagerDialog onClose={() => {}} isOpen={true} />
      );
      wrapper.instance().onOpen();
      expect(wrapper.find(LibraryListItem)).toHaveLength(4);
      expect(wrapper.state().classLibraries).toHaveLength(2);
      expect(wrapper.state().projectLibraries).toHaveLength(2);
    });

    it('allows filtering class libraries by section', () => {
      getProjectLibrariesStub.mockReturnValue(undefined);
      getClassLibrariesStub.callsFake(callback =>
        callback([
          {channel: 'abc123', sectionName: 'section1'},
          {channel: 'def456', sectionName: 'section2'},
          {channel: 'ghi789', sectionName: 'section1'},
          {channel: 'jkl1011', sectionName: 'section3'},
        ])
      );
      const wrapper = shallow(
        <LibraryManagerDialog onClose={() => {}} isOpen={true} />
      );
      wrapper.instance().onOpen();
      expect(wrapper.find(LibraryListItem)).toHaveLength(4);
      wrapper.setState({sectionFilter: 'section1'});
      expect(wrapper.find(LibraryListItem)).toHaveLength(2);
    });

    it('setLibraryToImport sets the import library', () => {
      getProjectLibrariesStub.mockReturnValue(undefined);
      const wrapper = shallow(
        <LibraryManagerDialog onClose={() => {}} isOpen={true} />
      );
      wrapper.instance().onOpen();
      wrapper.instance().setLibraryToImport({target: {value: 'id'}});
      expect(wrapper.state().importLibraryId).toBe('id');
    });

    it('setLibraryToImport resets the error in state to null', () => {
      const wrapper = shallow(
        <LibraryManagerDialog onClose={() => {}} isOpen={true} />
      );
      wrapper
        .instance()
        .setState({errorMessages: {importFromId: IMPORT_ERROR_MSG}});

      wrapper.instance().setLibraryToImport({target: {value: 'id'}});
      expect(wrapper.state().errorMessages.importFromId).toBeUndefined();
    });

    it('addLibraryById adds the library to the project if given libraryJson', () => {
      let setProjectLibrariesSpy = jest.spyOn(window.dashboard.project, 'setProjectLibraries').mockClear();
      const wrapper = shallow(
        <LibraryManagerDialog onClose={() => {}} isOpen={true} />
      );
      const library = {libraryName: 'my favorite library'};

      wrapper.instance().addLibraryById(library, null);
      expect(setProjectLibrariesSpy).toHaveBeenCalled();
      setProjectLibrariesSpy.mockRestore();
    });

    it('addLibraryById sets an error in state if given an error', () => {
      const wrapper = shallow(
        <LibraryManagerDialog onClose={() => {}} isOpen={true} />
      );
      expect(wrapper.state().errorMessages.importFromId).toBeUndefined();
      wrapper.instance().addLibraryById(null, 'an error occurred!');
      expect(wrapper.state().errorMessages.importFromId).toBe(IMPORT_ERROR_MSG);
    });

    it('removeLibrary calls setProjectLibrary without the given library', () => {
      const projectLibraries = [
        {name: 'first', channelId: 'abc123', sectionName: 'section'},
        {name: 'second', channelId: 'def456', sectionName: 'section'},
      ];
      getProjectLibrariesStub.mockReturnValue(projectLibraries);
      let setProjectLibraries = jest.spyOn(window.dashboard.project, 'setProjectLibraries').mockClear();
      const wrapper = shallow(
        <LibraryManagerDialog onClose={() => {}} isOpen={true} />
      );
      wrapper.instance().onOpen();
      expect(setProjectLibraries).not.toHaveBeenCalled();
      wrapper.instance().removeLibrary('abc123');
      expect(setProjectLibraries).toHaveBeenCalledWith([projectLibraries[1]]);
      window.dashboard.project.setProjectLibraries.mockRestore();
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
      server.mockRestore();
    });

    it('sets updatedLibraryChannels in state', () => {
      const libraries = [
        {channelId: 'abc123', versionId: '1'},
        {channelId: 'def456', versionId: '2'},
      ];
      server.respondWith('GET', /\/libraries\/get_updates\?libraries=.+/, [
        200,
        {'Content-Type': 'application/json'},
        '["abc123"]',
      ]);

      wrapper.instance().fetchUpdates(libraries);
      server.respond();

      expect(server.requests.length).toBe(1);
      expect(server.requests[0].url).toBe(
        '/libraries/get_updates?libraries=[{"channel_id":"abc123","version":"1"},{"channel_id":"def456","version":"2"}]'
      );
      assert.deepEqual(wrapper.state('updatedLibraryChannels'), ['abc123']);
    });

    it('does not request updates if there are no libraries', () => {
      wrapper.instance().fetchUpdates([]);
      server.respond();

      expect(server.requests.length).toBe(0);
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
        source: 'function myLibrary() {};',
      };
    });

    it('returns the view mode component if displayLibraryMode is "view"', () => {
      wrapper.setState({displayLibrary: library, displayLibraryMode: 'view'});

      const libraryComponent = wrapper.instance().renderDisplayLibrary();
      expect(libraryComponent.props.title).toBe(library.name);
      expect(libraryComponent.props.description).toBe(library.description);
      expect(libraryComponent.props.sourceCode).toBe(library.source);
      expect(libraryComponent.props.buttons).toBeUndefined();
    });

    it('returns the update mode component if displayLibraryMode is "update"', () => {
      wrapper.setState({displayLibrary: library, displayLibraryMode: 'update'});

      const libraryComponent = wrapper.instance().renderDisplayLibrary();
      expect(libraryComponent.props.title).toBe(`Are you sure you want to update ${library.name}?`);
      expect(libraryComponent.props.description).toBe(library.description);
      expect(libraryComponent.props.sourceCode).toBe(library.source);
      expect(libraryComponent.props.buttons).toBeDefined();
    });

    it('returns null if displayLibraryMode is not "update" or "view"', () => {
      wrapper.setState({displayLibrary: library, displayLibraryMode: 'hi'});

      const libraryComponent = wrapper.instance().renderDisplayLibrary();
      expect(libraryComponent).toBeNull();
    });

    it('returns null if displayLibrary is not set in state', () => {
      wrapper.setState({displayLibrary: null, displayLibraryMode: 'view'});

      const libraryComponent = wrapper.instance().renderDisplayLibrary();
      expect(libraryComponent).toBeNull();
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

      expect(mappedProjectLibraries[0].userName).toBe('Library Author');
      expect(mappedProjectLibraries[1].userName).toBeUndefined();
    });
  });
});
