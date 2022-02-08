import $ from 'jquery';
import {Provider, connect} from 'react-redux';
import React from 'react';
import {mount} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import ProjectAppTypeArea from '@cdo/apps/templates/projects/ProjectAppTypeArea';
import sinon from 'sinon';
import {
  getStore,
  registerReducers,
  stubRedux,
  restoreRedux
} from '@cdo/apps/redux';
import projectsReducer, {
  appendProjects
} from '@cdo/apps/templates/projects/projectsRedux';
import {
  allowConsoleErrors,
  allowConsoleWarnings
} from '../../../util/throwOnConsole';

function wrapped(element) {
  return mount(<Provider store={getStore()}>{element}</Provider>);
}

const ProjectProvider = connect((state, ownProps) => ({
  projectList: state.projects.projectLists[ownProps.labKey].map(project => {
    return {
      projectData: project,
      currentGallery: 'public'
    };
  })
}))(ProjectAppTypeArea);

function generateFakeProjects(numProjects, projectType) {
  return generateFakeProjectData(numProjects, projectType).map(data => ({
    projectData: data,
    currentGallery: 'public'
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
    publishedToClass: true
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
    stubAjax = sinon.stub($, 'ajax');
    stubAjax.returns(ajaxDeferred);
    stubNavigate = sinon.spy();
  });

  afterEach(() => {
    stubAjax.restore();
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
      expect(wrapper.find('ProjectCard')).to.have.length(12);
      expect(
        wrapper
          .find('Button')
          .first()
          .text()
      ).to.equal('View more');
      expect(stubAjax).not.to.have.been.called;
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
      expect(wrapper.find('.viewMoreLink')).to.have.length(1);
      expect(wrapper.find('.viewMoreLink').text()).to.equal(viewMoreLink);
      wrapper.find('.viewMoreLink').simulate('click');
      expect(stubNavigate).to.have.been.called;
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
      expect(wrapper.find('ProjectCard')).to.have.length(12);
      let viewMoreWrapper = wrapper.find('Button').first();
      expect(viewMoreWrapper.text()).to.equal('View more');

      // Each click shows 12 more projects.
      viewMoreWrapper.simulate('click');
      expect(wrapper.find('ProjectCard')).to.have.length(24);
      viewMoreWrapper = wrapper.find('Button').first();
      expect(viewMoreWrapper.text()).to.equal('View more');
      expect(viewMoreWrapper).to.have.length(1);
      expect(stubAjax).not.to.have.been.called;

      // Requests more from the server once all projects are displayed.
      viewMoreWrapper.simulate('click');
      expect(wrapper.find('ProjectCard')).to.have.length(30);
      viewMoreWrapper = wrapper.find('Button').first();
      expect(viewMoreWrapper.text()).to.equal('View more');
      expect(stubAjax).to.have.been.calledOnce;

      // Simulate the network request completing.
      ajaxDeferred.resolve({
        applab: generateFakeProjectData(40, 'applab')
      });
      wrapper.setProps({}); // Force refresh

      // Displays additional projects returned from the server.
      expect(wrapper.find('ProjectCard')).to.have.length(36);
      viewMoreWrapper = wrapper.find('Button').first();
      expect(viewMoreWrapper.text()).to.equal('View more');

      // Skips fetching projects from the server and hides the View More button
      // once all projects on the server and client are shown.
      viewMoreWrapper.simulate('click');
      expect(wrapper.find('ProjectCard')).to.have.length(40);
      const otherButtonWrapper = wrapper.find('Button').first();
      expect(otherButtonWrapper.text()).not.to.equal('View more');
      expect(stubAjax).to.have.been.calledOnce;
    });
  });
});
