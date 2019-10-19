import React from 'react';
import {mount} from 'enzyme';
import {expect} from '../../../util/deprecatedChai';
import {Provider} from 'react-redux';
import {getStore} from '@cdo/apps/redux';
import {UnconnectedPersonalProjectsTable as PersonalProjectsTable} from '@cdo/apps/templates/projects/PersonalProjectsTable';
import {stubFakePersonalProjectData} from '@cdo/apps/templates/projects/generateFakeProjects';

describe('PersonalProjectsTable', () => {
  // In the fake data used, the recency of the projects' updatedAt field is consistent with the numbering in the name; for example, the project named "Personal Project 1" has the most recent updatedAt time.
  it('renders project rows in order of recency of updatedAt ', () => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <PersonalProjectsTable
          personalProjectsList={stubFakePersonalProjectData}
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
});
