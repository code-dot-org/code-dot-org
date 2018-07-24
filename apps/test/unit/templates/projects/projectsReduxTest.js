import { assert } from '../../../util/configuredChai';
import projects, {
  setPersonalProjectsList,
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

});
