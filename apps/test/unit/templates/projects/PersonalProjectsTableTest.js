import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import {Provider} from 'react-redux';

import {
  stubRedux,
  restoreRedux,
  registerReducers,
  getStore,
} from '@cdo/apps/redux';
import deleteDialog from '@cdo/apps/templates/projects/deleteDialog/deleteProjectDialogRedux';
import frozenProjectInfoDialog from '@cdo/apps/templates/projects/frozenProjectInfoDialog/frozenProjectInfoDialogRedux';
import {stubFakePersonalProjectData} from '@cdo/apps/templates/projects/generateFakeProjects';
import {UnconnectedPersonalProjectsTable as PersonalProjectsTable} from '@cdo/apps/templates/projects/PersonalProjectsTable';
import publishDialog from '@cdo/apps/templates/projects/publishDialog/publishDialogRedux';
import i18n from '@cdo/locale';

import {allowConsoleWarnings} from '../../../util/throwOnConsole';

describe('PersonalProjectsTable', () => {
  allowConsoleWarnings();

  beforeEach(() => {
    stubRedux();
    registerReducers({publishDialog, deleteDialog, frozenProjectInfoDialog});
  });

  afterEach(() => {
    restoreRedux();
  });

  describe('personal project data has loaded', () => {
    // In the fake data used, the recency of the projects' updatedAt field is consistent with the numbering in the name; for example, the project named "Personal Project 1" has the most recent updatedAt time.
    it('renders project rows in order of recency of updatedAt if there are projects', () => {
      const wrapper = mount(
        <Provider store={getStore()}>
          <PersonalProjectsTable
            personalProjectsList={stubFakePersonalProjectData}
            isLoadingPersonalProjectsList={false}
            isUserSignedIn={true}
          />
        </Provider>
      );
      const firstProjectName = wrapper
        .find('PersonalProjectsNameCell')
        .at(0)
        .find('a');
      const secondProjectName = wrapper
        .find('PersonalProjectsNameCell')
        .at(1)
        .find('a');
      const thirdProjectName = wrapper
        .find('PersonalProjectsNameCell')
        .at(2)
        .find('a');
      const fourthProjectName = wrapper
        .find('PersonalProjectsNameCell')
        .at(3)
        .find('a');
      expect(firstProjectName.text()).toBe(stubFakePersonalProjectData[0].name);
      expect(secondProjectName.text()).toBe(
        stubFakePersonalProjectData[1].name
      );
      expect(thirdProjectName.text()).toBe(stubFakePersonalProjectData[2].name);
      expect(fourthProjectName.text()).toBe(
        stubFakePersonalProjectData[3].name
      );
    });

    it('if there are no projects and user is signed in displays no personal projects message', () => {
      const wrapper = mount(
        <Provider store={getStore()}>
          <PersonalProjectsTable
            personalProjectsList={[]}
            isLoadingPersonalProjectsList={false}
            isUserSignedIn={true}
          />
        </Provider>
      );
      expect(wrapper.contains(i18n.noPersonalProjects())).toBe(true);
    });

    it('if there are no projects and user is signed out displays no saved projects message', () => {
      const wrapper = mount(
        <Provider store={getStore()}>
          <PersonalProjectsTable
            personalProjectsList={[]}
            isLoadingPersonalProjectsList={false}
            isUserSignedIn={false}
          />
        </Provider>
      );
      expect(wrapper.find('SafeMarkdown').props().markdown).toBe(
        i18n.noSavedProjects({
          signInUrl: '/users/sign_in?user_return_to=/projects',
        })
      );
    });
  });

  describe('personal project data has not yet loaded', () => {
    it('does not display personal projects table section', () => {
      const wrapper = mount(
        <Provider store={getStore()}>
          <PersonalProjectsTable
            personalProjectsList={[]}
            isLoadingPersonalProjectsList={true}
            isUserSignedIn={true}
          />
        </Provider>
      );

      expect(wrapper.find('#uitest-personal-projects')).toHaveLength(0);
    });
  });
});
