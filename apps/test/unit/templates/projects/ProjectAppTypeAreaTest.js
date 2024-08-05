import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import $ from 'jquery';
import React from 'react';
import {Provider, connect} from 'react-redux';

import {
  getStore,
  registerReducers,
  stubRedux,
  restoreRedux,
} from '@cdo/apps/redux';
import ProjectAppTypeArea from '@cdo/apps/templates/projects/ProjectAppTypeArea';
import projectsReducer, {
  appendProjects,
} from '@cdo/apps/templates/projects/projectsRedux';

import {
  allowConsoleErrors,
  allowConsoleWarnings,
} from '../../../util/throwOnConsole';

function wrapped(element) {
  return mount(<Provider store={getStore()}>{element}</Provider>);
}

const ProjectProvider = connect((state, ownProps) => ({
  projectList: state.projects.projectLists[ownProps.labKey].map(project => {
    return {
      projectData: project,
      currentGallery: 'public',
    };
  }),
}))(ProjectAppTypeArea);

function generateFakeProjects(numProjects, projectType) {
  return generateFakeProjectData(numProjects, projectType).map(data => ({
    projectData: data,
    currentGallery: 'public',
  }));
}

function generateFakeProjectData(numProjects, projectType) {
  const startTime = Date.parse('2017-01-01T11:00:00.000-00:00');
  return [...Array(numProjects).keys()].map(projectNum => ({
    channel: `STUB_CHANNEL_ID_${projectNum}_`,
    name: `Published Project ${projectNum}.`,
    type: projectType,
    publishedAt: new Date(startTime + projectNum).toISOString(),
    publishedToPublic: true,
    publishedToClass: true,
    featuredAt: new Date(startTime + projectNum).toISOString(),
  }));
}

describe('ProjectAppTypeArea', () => {
  allowConsoleErrors();
  allowConsoleWarnings();

  let stubAjax, ajaxDeferred, stubNavigate;

  beforeEach(() => {
    stubRedux();
    registerReducers({projects: projectsReducer});
    ajaxDeferred = new $.Deferred();
    stubAjax = jest.spyOn($, 'ajax').mockClear().mockImplementation();
    stubAjax.mockReturnValue(ajaxDeferred);
    stubNavigate = jest.fn();
  });

  afterEach(() => {
    stubAjax.mockRestore();
    restoreRedux();
  });

  describe('detail view', () => {
    it('shows the right number of projects initially', () => {
      const wrapper = wrapped(
        <ProjectAppTypeArea
          labKey="applab"
          labName="App Lab"
          labViewMoreString="more App Lab projects"
          projectList={generateFakeProjects(30, 'applab')}
          numProjectsToShow={12}
          galleryType="public"
          navigateFunction={stubNavigate}
          isDetailView={true}
        />
      );
      expect(wrapper.find('ProjectCard')).toHaveLength(12);
      expect(wrapper.find('Button').first().text()).toBe('View more');
      expect(stubAjax).not.toHaveBeenCalled();
    });

    it('renders a working link to view more projects of a specific type', () => {
      var viewMoreLink = 'more App Lab projects';
      const wrapper = wrapped(
        <ProjectAppTypeArea
          labKey="applab"
          labName="App Lab"
          labViewMoreString={viewMoreLink}
          projectList={generateFakeProjects(30, 'applab')}
          numProjectsToShow={12}
          galleryType="public"
          navigateFunction={stubNavigate}
          isDetailView={true}
        />
      );
      expect(wrapper.find('.viewMoreLink')).toHaveLength(1);
      expect(wrapper.find('.viewMoreLink').text()).toBe(viewMoreLink);
      wrapper.find('.viewMoreLink').simulate('click');
      expect(stubNavigate).toHaveBeenCalled();
    });

    it('displays more projects when View More is pressed', () => {
      const store = getStore();
      store.dispatch(
        appendProjects(generateFakeProjectData(30, 'applab'), 'applab')
      );
      const wrapper = mount(
        <Provider store={store}>
          <ProjectProvider
            labKey="applab"
            labName="App Lab"
            labViewMoreString="more App Lab projects"
            numProjectsToShow={12}
            galleryType="public"
            navigateFunction={stubNavigate}
            isDetailView={true}
          />
        </Provider>
      );
      // some of the most useful selectors like [text="View more"] don't work
      // with mount(). see: https://github.com/airbnb/enzyme/issues/534
      expect(wrapper.find('ProjectCard')).toHaveLength(12);
      let viewMoreWrapper = wrapper.find('Button').first();
      expect(viewMoreWrapper.text()).toBe('View more');

      // Each click shows 12 more projects.
      viewMoreWrapper.simulate('click');
      expect(wrapper.find('ProjectCard')).toHaveLength(24);
      viewMoreWrapper = wrapper.find('Button').first();
      expect(viewMoreWrapper.text()).toBe('View more');
      expect(viewMoreWrapper).toHaveLength(1);
      expect(stubAjax).not.toHaveBeenCalled();

      // Requests more from the server once all projects are displayed.
      viewMoreWrapper.simulate('click');
      expect(wrapper.find('ProjectCard')).toHaveLength(30);
      viewMoreWrapper = wrapper.find('Button').first();
      expect(viewMoreWrapper.text()).toBe('View more');
      expect(stubAjax).toHaveBeenCalledTimes(1);

      // Simulate the network request completing.
      ajaxDeferred.resolve({
        applab: generateFakeProjectData(40, 'applab'),
      });
      wrapper.setProps({}); // Force refresh

      // Displays additional projects returned from the server.
      expect(wrapper.find('ProjectCard')).toHaveLength(36);
      viewMoreWrapper = wrapper.find('Button').first();
      expect(viewMoreWrapper.text()).toBe('View more');

      // Skips fetching projects from the server and hides the View More button
      // once all projects on the server and client are shown.
      viewMoreWrapper.simulate('click');
      expect(wrapper.find('ProjectCard')).toHaveLength(40);
      const otherButtonWrapper = wrapper.find('Button').first();
      expect(otherButtonWrapper.text()).not.toBe('View more');
      expect(stubAjax).toHaveBeenCalledTimes(1);
    });
  });
});
