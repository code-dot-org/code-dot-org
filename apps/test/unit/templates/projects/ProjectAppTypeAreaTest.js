import $ from 'jquery';
import React from 'react';
import {mount} from 'enzyme';
import {expect} from '../../../util/deprecatedChai';
import ProjectAppTypeArea from '@cdo/apps/templates/projects/ProjectAppTypeArea';
import sinon from 'sinon';
import {
  getStore,
  registerReducers,
  stubRedux,
  restoreRedux
} from '@cdo/apps/redux';
import projectsReducer from '@cdo/apps/templates/projects/projectsRedux';

function generateFakeProjects(numProjects, projectType) {
  const startTime = Date.parse('2017-01-01T11:00:00.000-00:00');
  return [...Array(numProjects).keys()].map(projectNum => ({
    projectData: {
      channel: `STUB_CHANNEL_ID_${projectNum}_`,
      name: `Published Project ${projectNum}.`,
      type: projectType,
      publishedAt: new Date(startTime + projectNum).toISOString(),
      publishedToPublic: true,
      publishedToClass: true
    },
    currentGallery: 'public'
  }));
}

describe('ProjectAppTypeArea', () => {
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
      const wrapper = mount(
        <ProjectAppTypeArea
          labKey="applab"
          labName="App Lab"
          labViewMoreString="more App Lab projects"
          projectList={generateFakeProjects(30, 'applab')}
          numProjectsToShow={12}
          galleryType="public"
          navigateFunction={stubNavigate}
          isDetailView={true}
          store={getStore()}
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
      const wrapper = mount(
        <ProjectAppTypeArea
          labKey="applab"
          labName="App Lab"
          labViewMoreString={viewMoreLink}
          projectList={generateFakeProjects(30, 'applab')}
          numProjectsToShow={12}
          galleryType="public"
          navigateFunction={stubNavigate}
          isDetailView={true}
          store={getStore()}
        />
      );
      expect(wrapper.find('.viewMoreLink')).to.have.length(1);
      expect(wrapper.find('.viewMoreLink').text()).to.equal(viewMoreLink);
      wrapper.find('.viewMoreLink').simulate('click');
      expect(stubNavigate).to.have.been.called;
    });

    it('displays more projects when View More is pressed', () => {
      // some of the most useful selectors like [text="View more"] don't work
      // with mount(). see: https://github.com/airbnb/enzyme/issues/534
      const wrapper = mount(
        <ProjectAppTypeArea
          labKey="applab"
          labName="App Lab"
          labViewMoreString="more App Lab projects"
          projectList={generateFakeProjects(30, 'applab')}
          numProjectsToShow={12}
          galleryType="public"
          navigateFunction={stubNavigate}
          isDetailView={true}
          store={getStore()}
        />
      );
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
      ajaxDeferred.resolve({applab: generateFakeProjects(40, 'applab')});
      wrapper.setProps({
        projectList: generateFakeProjects(40, 'applab')
      });

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
