import {render, screen, fireEvent} from '@testing-library/react';
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
import i18n from '@cdo/locale';

import {
  allowConsoleErrors,
  allowConsoleWarnings,
} from '../../../util/throwOnConsole';

function renderWithRedux(element, {initialState, store = getStore()} = {}) {
  return {...render(<Provider store={store}>{element}</Provider>), store};
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
    jest.clearAllMocks();
    jest.resetModules();
  });

  describe('detail view', () => {
    it('shows the right number of projects initially', () => {
      renderWithRedux(
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
      const projectCards = screen.getAllByRole('listitem');
      expect(projectCards).toHaveLength(12);

      const viewMoreButton = screen.getByText(i18n.viewMore());
      expect(viewMoreButton).toBeInTheDocument();
      expect(stubNavigate).not.toHaveBeenCalled();
    });

    it('renders a working link to view more projects of a specific type', () => {
      var viewMoreLink = 'more App Lab projects';
      renderWithRedux(
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
      const viewMoreLinkElement = screen.getByText(viewMoreLink);
      fireEvent.click(viewMoreLinkElement);
      expect(stubNavigate).toHaveBeenCalled();
    });

    it('displays more projects when View More is pressed', () => {
      const store = getStore();
      store.dispatch(
        appendProjects(generateFakeProjectData(30, 'applab'), 'applab')
      );
      render(
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
      const getAllCards = () => screen.getAllByRole('listitem');
      const viewMoreButton = screen.getByText(i18n.viewMore());

      // 12 projects are displayed initially.
      expect(getAllCards()).toHaveLength(12);
      expect(viewMoreButton).toBeInTheDocument();

      // Each click shows 12 more projects.
      fireEvent.click(viewMoreButton);
      expect(getAllCards()).toHaveLength(24);
      expect(viewMoreButton).toBeInTheDocument();

      // No more projects are displayed once max is reached.
      fireEvent.click(viewMoreButton);
      expect(getAllCards()).toHaveLength(30);
    });

    it('requests more from the server once all projects are displayed', () => {
      const store = getStore();
      store.dispatch(
        appendProjects(generateFakeProjectData(15, 'applab'), 'applab')
      );
      render(
        <Provider store={store}>
          <ProjectProvider
            labKey="applab"
            labName="App Lab"
            labViewMoreString="more App Lab projects"
            numProjectsToShow={10}
            galleryType="public"
            navigateFunction={stubNavigate}
            isDetailView={true}
          />
        </Provider>
      );
      const getAllCards = () => screen.getAllByRole('listitem');
      const viewMoreButton = screen.getByText(i18n.viewMore());

      expect(getAllCards()).toHaveLength(10);
      expect(viewMoreButton).toBeInTheDocument();

      fireEvent.click(viewMoreButton);

      // No more projects are displayed once max is reached.
      fireEvent.click(viewMoreButton);
      expect(getAllCards()).toHaveLength(15);
      expect(viewMoreButton).toBeInTheDocument();
      expect(stubAjax).toHaveBeenCalledTimes(1);

      // Simulate the network request completing.
      ajaxDeferred.resolve({
        applab: generateFakeProjectData(20, 'applab'),
      });

      // Skips fetching projects from the server and hides the View More button
      // once all projects on the server and client are shown.
      expect(getAllCards()).toHaveLength(20);
      expect(viewMoreButton).not.toBeInTheDocument();
    });
  });
});
