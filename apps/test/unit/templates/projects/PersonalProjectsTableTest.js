import React from 'react';
import {mount} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import {Provider} from 'react-redux';
import {
  __testing_stubRedux,
  __testing_restoreRedux,
  registerReducers,
  getStore,
} from '@cdo/apps/redux';
import publishDialog from '@cdo/apps/templates/projects/publishDialog/publishDialogRedux';
import deleteDialog from '@cdo/apps/templates/projects/deleteDialog/deleteProjectDialogRedux';
import {UnconnectedPersonalProjectsTable as PersonalProjectsTable} from '@cdo/apps/templates/projects/PersonalProjectsTable';
import {stubFakePersonalProjectData} from '@cdo/apps/templates/projects/generateFakeProjects';
import {allowConsoleWarnings} from '../../../util/throwOnConsole';
import i18n from '@cdo/locale';

describe('PersonalProjectsTable', () => {
  allowConsoleWarnings();

  beforeEach(() => {
    __testing_stubRedux();
    registerReducers({publishDialog, deleteDialog});
  });

  afterEach(() => {
    __testing_restoreRedux();
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
            canShare={true}
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
      expect(firstProjectName.text()).to.equal(
        stubFakePersonalProjectData[0].name
      );
      expect(secondProjectName.text()).to.equal(
        stubFakePersonalProjectData[1].name
      );
      expect(thirdProjectName.text()).to.equal(
        stubFakePersonalProjectData[2].name
      );
      expect(fourthProjectName.text()).to.equal(
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
            canShare={true}
          />
        </Provider>
      );
      expect(wrapper.contains(i18n.noPersonalProjects())).to.be.true;
    });

    it('if there are no projects and user is signed out displays no saved projects message', () => {
      const wrapper = mount(
        <Provider store={getStore()}>
          <PersonalProjectsTable
            personalProjectsList={[]}
            isLoadingPersonalProjectsList={false}
            isUserSignedIn={false}
            canShare={true}
          />
        </Provider>
      );
      expect(wrapper.find('SafeMarkdown').props().markdown).to.equal(
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
            canShare={true}
          />
        </Provider>
      );

      expect(wrapper.find('#uitest-personal-projects')).to.have.length(0);
    });
  });
});
