import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/configuredChai';
import ProjectCardGrid from '@cdo/apps/templates/projects/ProjectCardGrid';
import ProjectAppTypeArea from '@cdo/apps/templates/projects/ProjectAppTypeArea.jsx';
import {projects} from './projectsTestData';
import {combineReducers, createStore} from 'redux';
import reducer from '@cdo/apps/templates/projects/projectsRedux';

describe('ProjectCardGrid', () => {
  const store = createStore(combineReducers({projects: reducer}));

  it('filters by selected app type', () => {
    const wrapper = shallow(
      <ProjectCardGrid
        projectLists={projects}
        galleryType="public"
      />, {context: {store}},
    ).dive();

    const onSelectApp = wrapper.instance().onSelectApp;
    const viewAllProjects = wrapper.instance().viewAllProjects;

    // Should show all project types.
    // EXCEPT gamelab and applab, which have been temporarily hidden due to
    // abusive content.
    // TODO (Erin B) update test when we re-enable showing all project types.
    // There will be 7 descendants including applab and gamelab.
    expect(wrapper).to.have.exactly(5).descendants(ProjectAppTypeArea);
    expect(wrapper.find(ProjectAppTypeArea).first()).to.have.props({
      labKey: "playlab",
      labName: "Stories and Games with Play Lab",
      numProjectsToShow: 4,
    });

    // Filter to only show Play Lab projects.
    onSelectApp('playlab');
    expect(wrapper.find(ProjectAppTypeArea).length).to.equal(1);
    expect(wrapper.find(ProjectAppTypeArea)).to.have.props({
      labKey: "playlab",
      labName: "All Play Lab Projects",
      numProjectsToShow: 12,
    });

    // Show all project types.
    // EXCEPT gamelab and applab, which have been temporarily hidden due to
    // abusive content.
    // TODO (Erin B) update test when we re-enable showing all project types.
    // There will be 7 descendants including applab and gamelab.
    viewAllProjects();
    expect(wrapper).to.have.exactly(5).descendants(ProjectAppTypeArea);

    // Filter to only show Minecraft projects.
    onSelectApp('minecraft');
    expect(wrapper).to.have.exactly(1).descendants(ProjectAppTypeArea);
    expect(wrapper.find(ProjectAppTypeArea)).to.have.props({
      labKey: "minecraft",
      labName: "All Minecraft Projects",
      numProjectsToShow: 12,
    });
  });
});
