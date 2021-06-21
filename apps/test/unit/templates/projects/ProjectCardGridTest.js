import React from 'react';
import {Provider} from 'react-redux';
import {mount} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import ProjectCardGrid from '@cdo/apps/templates/projects/ProjectCardGrid';
import ProjectAppTypeArea from '@cdo/apps/templates/projects/ProjectAppTypeArea.jsx';
import {projects} from './projectsTestData';
import {combineReducers, createStore} from 'redux';
import reducer from '@cdo/apps/templates/projects/projectsRedux';
import {
  allowConsoleErrors,
  allowConsoleWarnings
} from '../../../util/throwOnConsole';

describe('ProjectCardGrid', () => {
  allowConsoleErrors();
  allowConsoleWarnings();
  const store = createStore(combineReducers({projects: reducer}));

  it('filters by selected app type', () => {
    const wrapper = mount(
      <Provider store={store}>
        <ProjectCardGrid projectLists={projects} galleryType="public" />
      </Provider>
    );

    const component = wrapper
      .find(ProjectCardGrid)
      .childAt(0)
      .instance();

    // Should show all project types.
    expect(wrapper.find(ProjectAppTypeArea)).to.have.lengthOf(9);
    const props1 = wrapper
      .find(ProjectAppTypeArea)
      .first()
      .props();
    expect(props1.labKey).to.equal('dance');
    expect(props1.labName).to.equal('Dance Party');
    expect(props1.numProjectsToShow).to.equal(4);

    // Filter to only show Play Lab projects.
    component.onSelectApp('playlab');
    wrapper.setProps({}); // Force a re-render
    expect(wrapper.find(ProjectAppTypeArea)).to.have.lengthOf(1);
    const props2 = wrapper
      .find(ProjectAppTypeArea)
      .first()
      .props();
    expect(props2.labKey).to.equal('playlab');
    expect(props2.labName).to.equal('All Play Lab Projects');
    expect(props2.numProjectsToShow).to.equal(12);

    // Show all project types.
    component.viewAllProjects();
    wrapper.setProps({}); // Force a re-render
    expect(wrapper.find(ProjectAppTypeArea)).to.have.lengthOf(9);

    // Filter to only show Minecraft projects.
    component.onSelectApp('minecraft');
    wrapper.setProps({}); // Force a re-render
    expect(wrapper.find(ProjectAppTypeArea)).to.have.lengthOf(1);
    const props3 = wrapper
      .find(ProjectAppTypeArea)
      .first()
      .props();
    expect(props3.labKey).to.equal('minecraft');
    expect(props3.labName).to.equal('All Minecraft Projects');
    expect(props3.numProjectsToShow).to.equal(12);
  });
});
