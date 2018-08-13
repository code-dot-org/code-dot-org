import React from 'react';
import {mount} from 'enzyme';
import {expect} from '../../../util/configuredChai';
import {Provider} from 'react-redux';
import {getStore} from '@cdo/apps/redux';
import {UnconnectedPersonalProjectsTable as PersonalProjectsTable} from '@cdo/apps/templates/projects/PersonalProjectsTable';
import {stubFakePersonalProjectData} from '@cdo/apps/templates/projects/generateFakeProjects';

describe('PersonalProjectsTable', () => {
  it('renders a table', () => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <PersonalProjectsTable
          personalProjectsList={stubFakePersonalProjectData}
          canShare={true}
        />
      </Provider>
    );
    expect(wrapper.find('table').exists()).to.be.true;
  });

  it('renders projects as table rows', () => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <PersonalProjectsTable
          personalProjectsList={stubFakePersonalProjectData}
          canShare={true}
        />
      </Provider>
    );
    const projectRows = wrapper.find('tbody').find('tr');
    expect(projectRows).to.have.length(stubFakePersonalProjectData.length);
  });
});
