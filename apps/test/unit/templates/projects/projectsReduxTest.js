import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import LibraryClientApi from '@cdo/apps/code-studio/components/libraries/LibraryClientApi';
import {
  stubRedux,
  restoreRedux,
  registerReducers,
  getStore,
} from '@cdo/apps/redux';
import {stubFakePersonalProjectData} from '@cdo/apps/templates/projects/generateFakeProjects';
import projects, {
  setPersonalProjectsList,
  updatePersonalProjectData,
  publishSuccess,
  unpublishSuccess,
  deleteSuccess,
  startRenamingProject,
  updateProjectName,
  cancelRenamingProject,
  saveSuccess,
  saveFailure,
  unsetNameFailure,
  unpublishProjectLibrary,
} from '@cdo/apps/templates/projects/projectsRedux';

describe('projectsRedux', () => {
  const initialState = projects(undefined, {});

  describe('setPersonalProjectsList', () => {
    it('sets the personal projects list', () => {
      const action = setPersonalProjectsList(stubFakePersonalProjectData);
      const nextState = projects(initialState, action);
      expect(nextState.personalProjectsList.projects).toEqual(
        stubFakePersonalProjectData
      );
    });
  });

  describe('updatePersonalProjectData', () => {
    const personalProjects = [
      {channel: 'abc123', name: 'first project'},
      {channel: 'def456', name: 'second project'},
    ];
    const updatedProject = {
      channel: 'def456',
      name: 'second project (edited)',
    };

    const action = setPersonalProjectsList(personalProjects);
    const nextState = projects(initialState, action);
    const nextAction = updatePersonalProjectData(
      updatedProject.channel,
      updatedProject
    );
    const nextNextState = projects(nextState, nextAction);

    const expectedProjects = [personalProjects[0], updatedProject];
    expect(nextNextState.personalProjectsList.projects).toEqual(
      expectedProjects
    );
  });

  describe('publishSuccess', () => {
    it('sets the publishedAt field for the recently published project', () => {
      const action = setPersonalProjectsList(stubFakePersonalProjectData);
      const nextState = projects(initialState, action);
      const nextAction = publishSuccess('2016-11-30T23:59:59.999-08:00', {
        channel: 'abcd2',
      });
      const nextNextState = projects(nextState, nextAction);
      expect(nextNextState.personalProjectsList.projects[1].channel).toEqual(
        'abcd2'
      );
      expect(
        nextNextState.personalProjectsList.projects[1].publishedAt
      ).toEqual('2016-11-30T23:59:59.999-08:00');
    });
  });

  describe('unpublishSuccess', () => {
    it('sets the publishedAt field for the recently unpublished project to null', () => {
      const action = setPersonalProjectsList(stubFakePersonalProjectData);
      const nextState = projects(initialState, action);
      expect(nextState.personalProjectsList.projects).toEqual(
        stubFakePersonalProjectData
      );
      expect(nextState.personalProjectsList.projects[2].channel).toEqual(
        'abcd3'
      );
      expect(nextState.personalProjectsList.projects[2].publishedAt).toEqual(
        '2015-12-31T23:59:59.999-08:00'
      );
      const nextAction = unpublishSuccess('abcd3');
      const nextNextState = projects(nextState, nextAction);
      expect(nextNextState.personalProjectsList.projects[2].channel).toEqual(
        'abcd3'
      );
      expect(
        nextNextState.personalProjectsList.projects[2].publishedAt
      ).toEqual(null);
    });
  });

  describe('deleteSuccess', () => {
    it('removes the recently deleted project from the projects list', () => {
      const action = setPersonalProjectsList(stubFakePersonalProjectData);
      const nextState = projects(initialState, action);
      expect(nextState.personalProjectsList.projects).toEqual(
        stubFakePersonalProjectData
      );
      expect(nextState.personalProjectsList.projects.length).toEqual(4);
      const nextAction = deleteSuccess('abcd3');
      const nextNextState = projects(nextState, nextAction);
      expect(nextNextState.personalProjectsList.projects.length).toEqual(3);
    });
  });

  describe('startRenamingProject', () => {
    it('startRenamingProject sets isEditing to true', () => {
      const action = setPersonalProjectsList(stubFakePersonalProjectData);
      const nextState = projects(initialState, action);
      expect(nextState.personalProjectsList.projects).toEqual(
        stubFakePersonalProjectData
      );
      const nextAction = startRenamingProject('abcd3');
      const nextNextState = projects(nextState, nextAction);
      expect(nextNextState.personalProjectsList.projects[2].isEditing).toEqual(
        true
      );
      expect(
        nextNextState.personalProjectsList.projects[2].updatedName
      ).toEqual(nextNextState.personalProjectsList.projects[2].name);
    });
  });

  describe('updateProjectName', () => {
    it('updateProjectName saves the new name as updatedName', () => {
      const action = setPersonalProjectsList(stubFakePersonalProjectData);
      const nextState = projects(initialState, action);
      expect(nextState.personalProjectsList.projects).toEqual(
        stubFakePersonalProjectData
      );
      const nextAction = updateProjectName('abcd3', 'new name');
      const nextNextState = projects(nextState, nextAction);
      expect(
        nextNextState.personalProjectsList.projects[2].updatedName
      ).toEqual('new name');
    });
  });

  describe('cancelRenamingProject', () => {
    it('cancelRenamingProject sets isEditing to false', () => {
      const action = setPersonalProjectsList(stubFakePersonalProjectData);
      const nextState = projects(initialState, action);
      expect(nextState.personalProjectsList.projects).toEqual(
        stubFakePersonalProjectData
      );
      const nextAction = startRenamingProject('abcd3');
      const nextNextState = projects(nextState, nextAction);
      expect(nextNextState.personalProjectsList.projects[2].isEditing).toEqual(
        true
      );
      const nextNextAction = cancelRenamingProject('abcd3');
      const nextNextNextState = projects(nextNextState, nextNextAction);
      expect(
        nextNextNextState.personalProjectsList.projects[2].isEditing
      ).toEqual(false);
    });
  });

  describe('saveSuccess', () => {
    it('saveSuccess sets project name to the updated name and isSaving to false', () => {
      const updatedName = 'new name';
      const action = setPersonalProjectsList(stubFakePersonalProjectData);
      const nextState = projects(initialState, action);
      expect(nextState.personalProjectsList.projects).toEqual(
        stubFakePersonalProjectData
      );
      nextState.personalProjectsList.projects[3].updatedName = updatedName;
      const nextAction = saveSuccess('abcd4');
      const nextNextState = projects(nextState, nextAction);
      expect(nextNextState.personalProjectsList.projects[3].name).toEqual(
        updatedName
      );
      expect(nextNextState.personalProjectsList.projects[3].isSaving).toEqual(
        false
      );
      expect(nextNextState.personalProjectsList.projects[3].isEditing).toEqual(
        false
      );
    });
  });

  describe('saveFailure', () => {
    it('saveFailure does not change the project name and setHasOlderProjects isSaving to false', () => {
      const updatedName = 'new name';
      const action = setPersonalProjectsList(stubFakePersonalProjectData);
      const nextState = projects(initialState, action);
      expect(nextState.personalProjectsList.projects).toEqual(
        stubFakePersonalProjectData
      );
      nextState.personalProjectsList.projects[3].updatedName = updatedName;
      const nextAction = saveFailure('abcd4');
      const nextNextState = projects(nextState, nextAction);
      // Name doesn't change after saveFailure.
      expect(nextNextState.personalProjectsList.projects[3].name).toEqual(
        nextState.personalProjectsList.projects[3].name
      );
      expect(nextNextState.personalProjectsList.projects[3].isSaving).toEqual(
        false
      );
      expect(nextNextState.personalProjectsList.projects[3].isEditing).toEqual(
        false
      );
    });

    it('saveFailure with a projectNameFailure sets the project isEditing to true and sets projectNameFailure', () => {
      const profanity = 'farts';
      const updatedName = profanity;
      const action = setPersonalProjectsList(stubFakePersonalProjectData);
      const nextState = projects(initialState, action);
      expect(nextState.personalProjectsList.projects).toEqual(
        stubFakePersonalProjectData
      );
      nextState.personalProjectsList.projects[3].updatedName = updatedName;
      const nextAction = saveFailure('abcd4', profanity);
      const nextNextState = projects(nextState, nextAction);
      // Name doesn't change after saveFailure.
      expect(nextNextState.personalProjectsList.projects[3].name).toEqual(
        nextState.personalProjectsList.projects[3].name
      );
      expect(
        nextNextState.personalProjectsList.projects[3].projectNameFailure
      ).toEqual(profanity);
      expect(nextNextState.personalProjectsList.projects[3].isSaving).toEqual(
        false
      );
      // Should still be editing because you need to pick a new name without profanity.
      expect(nextNextState.personalProjectsList.projects[3].isEditing).toEqual(
        true
      );
    });
  });

  describe('unsetNameFailure', () => {
    it('unsetNameFailure sets the project projectNameFailure to undefined', () => {
      const profanity = 'farts';
      const action = setPersonalProjectsList(stubFakePersonalProjectData);
      const nextState = projects(initialState, action);
      expect(nextState.personalProjectsList.projects).toEqual(
        stubFakePersonalProjectData
      );
      nextState.personalProjectsList.projects[3].projectNameFailure = profanity;
      const nextAction = unsetNameFailure('abcd4');
      const nextNextState = projects(nextState, nextAction);
      expect(
        nextNextState.personalProjectsList.projects[3].projectNameFailure
      ).toEqual(undefined);
    });
  });

  describe('unpublishProjectLibrary', () => {
    let server, store, libraryApiStub;
    const projectId = 'abc123';

    beforeEach(() => {
      server = sinon.fakeServer.create();
      stubRedux();
      registerReducers({projects});
      store = getStore();
      libraryApiStub = sinon.createStubInstance(LibraryClientApi, {
        unpublish: sinon.stub(),
      });
    });

    afterEach(() => {
      server.restore();
      restoreRedux();
    });

    const setFetchPersonalProjectsResponse = status => {
      server.respondWith('GET', `/v3/channels/${projectId}`, [
        status,
        {'Content-Type': 'application/json'},
        JSON.stringify([]),
      ]);
    };

    it('unpublishes library', () => {
      setFetchPersonalProjectsResponse(200);

      const action = unpublishProjectLibrary(
        projectId,
        () => {},
        libraryApiStub
      );
      store.dispatch(action);
      server.respond();

      expect(libraryApiStub.unpublish.calledOnce).toBeTruthy();
    });

    it('does not unpublish library if fetchProjectToUpdate fails', () => {
      setFetchPersonalProjectsResponse(500);
      const onCompleteSpy = sinon.spy();

      const action = unpublishProjectLibrary(
        projectId,
        onCompleteSpy,
        libraryApiStub
      );
      store.dispatch(action);
      server.respond();

      expect(0).toEqual(libraryApiStub.unpublish.callCount);
      expect(onCompleteSpy.calledOnce).toBeTruthy();
    });
  });
});
