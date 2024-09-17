import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import {Provider} from 'react-redux';
import {combineReducers, createStore} from 'redux';

import ProjectAppTypeArea from '@cdo/apps/templates/projects/ProjectAppTypeArea.jsx';
import ProjectCardGrid from '@cdo/apps/templates/projects/ProjectCardGrid';
import reducer from '@cdo/apps/templates/projects/projectsRedux';

import {projects} from './projectsTestData';

describe('ProjectCardGrid', () => {
  const store = createStore(combineReducers({projects: reducer}));

  it('filters by selected app type', () => {
    const wrapper = mount(
      <Provider store={store}>
        <ProjectCardGrid projectLists={projects} galleryType="public" />
      </Provider>
    );

    const component = wrapper.find(ProjectCardGrid).childAt(0).instance();

    // Should show all project types.
    expect(wrapper.find(ProjectAppTypeArea)).toHaveLength(1);
    const props1 = wrapper.find(ProjectAppTypeArea).first().props();
    expect(props1.labKey).toBe('featured');
    expect(props1.labName).toBe('Featured Projects');
    expect(props1.numProjectsToShow).toBe(16);

    // Show all project types.
    component.viewAllProjects();
    wrapper.setProps({}); // Force a re-render
    expect(wrapper.find(ProjectAppTypeArea)).toHaveLength(1);
  });
});
