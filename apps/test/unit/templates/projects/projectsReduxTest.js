import {assert} from '../../../util/deprecatedChai';
import sinon from 'sinon';
import {
  stubRedux,
  restoreRedux,
  registerReducers,
  getStore
} from '@cdo/apps/redux';
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
  unpublishProjectLibrary
} from '@cdo/apps/templates/projects/projectsRedux';
import {stubFakePersonalProjectData} from '@cdo/apps/templates/projects/generateFakeProjects';
import LibraryClientApi from '@cdo/apps/code-studio/components/libraries/LibraryClientApi';

describe('projectsRedux', () => {
  const initialState = projects(undefined, {});

  describe('setPersonalProjectsList', () => {
    it('sets the personal projects list', () => {
      const action = setPersonalProjectsList(stubFakePersonalProjectData);
      const nextState = projects(initialState, action);
      assert.deepEqual(
        nextState.personalProjectsList.projects,
        stubFakePersonalProjectData
      );
    });
  });

  describe('updatePersonalProjectData', () => {
    const personalProjects = [
      {channel: 'abc123', name: 'first project'},
      {channel: 'def456', name: 'second project'}
    ];
    const updatedProject = {
      channel: 'def456',
      name: 'second project (edited)'
    };

    const action = setPersonalProjectsList(personalProjects);
    const nextState = projects(initialState, action);
    const nextAction = updatePersonalProjectData(
      updatedProject.channel,
      updatedProject
    );
    const nextNextState = projects(nextState, nextAction);

    const expectedProjects = [personalProjects[0], updatedProject];
    assert.deepEqual(
      nextNextState.personalProjectsList.projects,
      expectedProjects
    );
  });

  describe('publishSuccess', () => {
    it('sets the publishedAt field for the recently published project', () => {
      const action = setPersonalProjectsList(stubFakePersonalProjectData);
      const nextState = projects(initialState, action);
      const nextAction = publishSuccess('2016-11-30T23:59:59.999-08:00', {
        channel: 'abcd2'
      });
      const nextNextState = projects(nextState, nextAction);
      assert.equal(
        nextNextState.personalProjectsList.projects[1].channel,
        'abcd2'
      );
      assert.equal(
        nextNextState.personalProjectsList.projects[1].publishedAt,
        '2016-11-30T23:59:59.999-08:00'
      );
    });
  });

  describe('unpublishSuccess', () => {
    it('sets the publishedAt field for the recently unpublished project to null', () => {
      const action = setPersonalProjectsList(stubFakePersonalProjectData);
      const nextState = projects(initialState, action);
      assert.deepEqual(
        nextState.personalProjectsList.projects,
        stubFakePersonalProjectData
      );
      assert.equal(nextState.personalProjectsList.projects[2].channel, 'abcd3');
      assert.equal(
        nextState.personalProjectsList.projects[2].publishedAt,
        '2015-12-31T23:59:59.999-08:00'
      );
      const nextAction = unpublishSuccess('abcd3');
      const nextNextState = projects(nextState, nextAction);
      assert.equal(
        nextNextState.personalProjectsList.projects[2].channel,
        'abcd3'
      );
      assert.equal(
        nextNextState.personalProjectsList.projects[2].publishedAt,
        null
      );
    });
  });

  describe('deleteSuccess', () => {
    it('removes the recently deleted project from the projects list', () => {
      const action = setPersonalProjectsList(stubFakePersonalProjectData);
      const nextState = projects(initialState, action);
      assert.deepEqual(
        nextState.personalProjectsList.projects,
        stubFakePersonalProjectData
      );
      assert.equal(nextState.personalProjectsList.projects.length, 4);
      const nextAction = deleteSuccess('abcd3');
      const nextNextState = projects(nextState, nextAction);
      assert.equal(nextNextState.personalProjectsList.projects.length, 3);
    });
  });

  describe('startRenamingProject', () => {
    it('startRenamingProject sets isEditing to true', () => {
      const action = setPersonalProjectsList(stubFakePersonalProjectData);
      const nextState = projects(initialState, action);
      assert.deepEqual(
        nextState.personalProjectsList.projects,
        stubFakePersonalProjectData
      );
      const nextAction = startRenamingProject('abcd3');
      const nextNextState = projects(nextState, nextAction);
      assert.equal(
        nextNextState.personalProjectsList.projects[2].isEditing,
        true
      );
      assert.equal(
        nextNextState.personalProjectsList.projects[2].updatedName,
        nextNextState.personalProjectsList.projects[2].name
      );
    });
  });

  describe('updateProjectName', () => {
    it('updateProjectName saves the new name as updatedName', () => {
      const action = setPersonalProjectsList(stubFakePersonalProjectData);
      const nextState = projects(initialState, action);
      assert.deepEqual(
        nextState.personalProjectsList.projects,
        stubFakePersonalProjectData
      );
      const nextAction = updateProjectName('abcd3', 'new name');
      const nextNextState = projects(nextState, nextAction);
      assert.equal(
        nextNextState.personalProjectsList.projects[2].updatedName,
        'new name'
      );
    });
  });

  describe('cancelRenamingProject', () => {
    it('cancelRenamingProject sets isEditing to false', () => {
      const action = setPersonalProjectsList(stubFakePersonalProjectData);
      const nextState = projects(initialState, action);
      assert.deepEqual(
        nextState.personalProjectsList.projects,
        stubFakePersonalProjectData
      );
      const nextAction = startRenamingProject('abcd3');
      const nextNextState = projects(nextState, nextAction);
      assert.equal(
        nextNextState.personalProjectsList.projects[2].isEditing,
        true
      );
      const nextNextAction = cancelRenamingProject('abcd3');
      const nextNextNextState = projects(nextNextState, nextNextAction);
      assert.equal(
        nextNextNextState.personalProjectsList.projects[2].isEditing,
        false
      );
    });
  });

  describe('saveSuccess', () => {
    it('saveSuccess sets project name to the updated name and isSaving to false', () => {
      const updatedName = 'new name';
      const action = setPersonalProjectsList(stubFakePersonalProjectData);
      const nextState = projects(initialState, action);
      assert.deepEqual(
        nextState.personalProjectsList.projects,
        stubFakePersonalProjectData
      );
      nextState.personalProjectsList.projects[3].updatedName = updatedName;
      const nextAction = saveSuccess('abcd4');
      const nextNextState = projects(nextState, nextAction);
      assert.equal(
        nextNextState.personalProjectsList.projects[3].name,
        updatedName
      );
      assert.equal(
        nextNextState.personalProjectsList.projects[3].isSaving,
        false
      );
      assert.equal(
        nextNextState.personalProjectsList.projects[3].isEditing,
        false
      );
    });
  });

  describe('saveFailure', () => {
    it('saveFailure does not change the project name and setHasOlderProjects isSaving to false', () => {
      const updatedName = 'new name';
      const action = setPersonalProjectsList(stubFakePersonalProjectData);
      const nextState = projects(initialState, action);
      assert.deepEqual(
        nextState.personalProjectsList.projects,
        stubFakePersonalProjectData
      );
      nextState.personalProjectsList.projects[3].updatedName = updatedName;
      const nextAction = saveFailure('abcd4');
      const nextNextState = projects(nextState, nextAction);
      // Name doesn't change after saveFailure.
      assert.equal(
        nextNextState.personalProjectsList.projects[3].name,
        nextState.personalProjectsList.projects[3].name
      );
      assert.equal(
        nextNextState.personalProjectsList.projects[3].isSaving,
        false
      );
      assert.equal(
        nextNextState.personalProjectsList.projects[3].isEditing,
        false
      );
    });

    it('saveFailure with a projectNameFailure sets the project isEditing to true and sets projectNameFailure', () => {
      const profanity = 'farts';
      const updatedName = profanity;
      const action = setPersonalProjectsList(stubFakePersonalProjectData);
      const nextState = projects(initialState, action);
      assert.deepEqual(
        nextState.personalProjectsList.projects,
        stubFakePersonalProjectData
      );
      nextState.personalProjectsList.projects[3].updatedName = updatedName;
      const nextAction = saveFailure('abcd4', profanity);
      const nextNextState = projects(nextState, nextAction);
      // Name doesn't change after saveFailure.
      assert.equal(
        nextNextState.personalProjectsList.projects[3].name,
        nextState.personalProjectsList.projects[3].name
      );
      assert.equal(
        nextNextState.personalProjectsList.projects[3].projectNameFailure,
        profanity
      );
      assert.equal(
        nextNextState.personalProjectsList.projects[3].isSaving,
        false
      );
      // Should still be editing because you need to pick a new name without profanity.
      assert.equal(
        nextNextState.personalProjectsList.projects[3].isEditing,
        true
      );
    });
  });

  describe('unsetNameFailure', () => {
    it('unsetNameFailure sets the project projectNameFailure to undefined', () => {
      const profanity = 'farts';
      const action = setPersonalProjectsList(stubFakePersonalProjectData);
      const nextState = projects(initialState, action);
      assert.deepEqual(
        nextState.personalProjectsList.projects,
        stubFakePersonalProjectData
      );
      nextState.personalProjectsList.projects[3].projectNameFailure = profanity;
      const nextAction = unsetNameFailure('abcd4');
      const nextNextState = projects(nextState, nextAction);
      assert.equal(
        nextNextState.personalProjectsList.projects[3].projectNameFailure,
        undefined
      );
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
        unpublish: sinon.stub()
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
        JSON.stringify([])
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

      assert(libraryApiStub.unpublish.calledOnce);
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

      assert.equal(0, libraryApiStub.unpublish.callCount);
      assert(onCompleteSpy.calledOnce);
    });
  });
});
