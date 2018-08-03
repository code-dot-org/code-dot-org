import { assert } from '../../../util/configuredChai';
import projects, {
  setPersonalProjectsList,
  publishSuccess,
  unpublishSuccess,
  deleteSuccess,
} from '@cdo/apps/templates/projects/projectsRedux';
import {stubFakePersonalProjectData} from '@cdo/apps/templates/projects/generateFakeProjects';

describe('projectsRedux', () => {
  const initialState = projects(undefined, {});

  describe('setPersonalProjectsList', () => {
    it('sets the personal projects list', () => {
      const action = setPersonalProjectsList(stubFakePersonalProjectData);
      const nextState = projects(initialState, action);
      assert.deepEqual(nextState.personalProjectsList.projects, stubFakePersonalProjectData);
    });
  });

  describe('publishSuccess', () => {
    it('sets the publishedAt field for the recently published project', () => {
      const action = setPersonalProjectsList(stubFakePersonalProjectData);
      const nextState = projects(initialState, action);
      const nextAction = publishSuccess('2016-11-30T23:59:59.999-08:00', {channel: 'abcd2'});
      const nextNextState = projects(nextState, nextAction);
      assert.deepEqual(nextNextState.personalProjectsList.projects[1].channel, 'abcd2');
      assert.deepEqual(nextNextState.personalProjectsList.projects[1].publishedAt, '2016-11-30T23:59:59.999-08:00');
    });
  });

  describe('unpublishSuccess', () => {
    it('sets the publishedAt field for the recently unpublished project to null', () => {
      const action = setPersonalProjectsList(stubFakePersonalProjectData);
      const nextState = projects(initialState, action);
      assert.deepEqual(nextState.personalProjectsList.projects, stubFakePersonalProjectData);
      assert.deepEqual(nextState.personalProjectsList.projects[2].channel, 'abcd3');
      assert.deepEqual(nextState.personalProjectsList.projects[2].publishedAt, '2015-12-31T23:59:59.999-08:00');
      const nextAction = unpublishSuccess('abcd3');
      const nextNextState = projects(nextState, nextAction);
      assert.deepEqual(nextNextState.personalProjectsList.projects[2].channel, 'abcd3');
      assert.deepEqual(nextNextState.personalProjectsList.projects[2].publishedAt, null);
    });
  });

  describe('deleteSuccess', () => {
    it('removes the recently deleted project from the projects list', () => {
      const action = setPersonalProjectsList(stubFakePersonalProjectData);
      const nextState = projects(initialState, action);
      assert.deepEqual(nextState.personalProjectsList.projects, stubFakePersonalProjectData);
      assert.deepEqual(nextState.personalProjectsList.projects.length, 4);
      const nextAction = deleteSuccess('abcd3');
      const nextNextState = projects(nextState, nextAction);
      assert.deepEqual(nextNextState.personalProjectsList.projects.length, 3);
    });
  });
});
