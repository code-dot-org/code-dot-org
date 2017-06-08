import $ from 'jquery';
import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/configuredChai';
import {ProjectAppTypeArea} from '@cdo/apps/templates/projects/ProjectAppTypeArea';
import sinon from 'sinon';

function generateFakeProjects(numProjects, projectType) {
  const startTime = Date.parse('2017-01-01T11:00:00.000-00:00');
  return [...Array(numProjects).keys()].map(projectNum => ({
    projectData: {
      channel: `STUB_CHANNEL_ID_${projectNum}_`,
      name: `Published Project ${projectNum}.`,
      type: projectType,
      publishedAt: new Date(startTime + projectNum).toISOString(),
      publishedToPublic: true,
      publishedToClass: true,
    },
    currentGallery: "public"
  }));
}

describe('ProjectAppTypeArea', () => {
  let stubAjax, stubSetHasOlderProjects, stubAddOlderProjects, stubNavigate;

  beforeEach(() => {
    stubAjax = sinon.stub($, 'ajax');
    stubSetHasOlderProjects = sinon.spy();
    stubAddOlderProjects = sinon.spy();
    stubNavigate = sinon.spy();
  });

  afterEach(() => {
    stubAjax.restore();
  });

  describe('detail view', () => {
    it('shows the right number of projects initially', () => {
      // We go out of our way to use shallow(), because the selectors we need
      // don't work with mount(). see: https://github.com/airbnb/enzyme/issues/534
      // This means we can't connect this to the redux store.
      const wrapper = shallow(
        <ProjectAppTypeArea
          labKey="applab"
          labName="App Lab"
          labViewMoreString="more App Lab projects"
          projectList={generateFakeProjects(30, 'applab')}
          numProjectsToShow={12}
          galleryType="public"
          navigateFunction={stubNavigate}
          isDetailView={true}
          hasOlderProjects={true}
          addOlderProjects={stubAddOlderProjects}
          setHasOlderProjects={stubSetHasOlderProjects}
        />
      );
      expect(wrapper.find('ProjectCard')).to.have.length(12);
      expect(wrapper.find('ProgressButton').filter('[text="View more"]')).to.have.length(1);
      expect(stubAjax).not.to.have.been.called;
    });

    it('displays more projects when View More is pressed', () => {
      const d = new $.Deferred();
      stubAjax.returns(d.resolve({applab: generateFakeProjects(40, 'applab')}));
      const wrapper = shallow(
        <ProjectAppTypeArea
          labKey="applab"
          labName="App Lab"
          labViewMoreString="more App Lab projects"
          projectList={generateFakeProjects(30, 'applab')}
          numProjectsToShow={12}
          galleryType="public"
          navigateFunction={stubNavigate}
          isDetailView={true}
          hasOlderProjects={true}
          addOlderProjects={stubAddOlderProjects}
          setHasOlderProjects={stubSetHasOlderProjects}
        />
      );
      expect(wrapper.find('ProjectCard')).to.have.length(12);
      let viewMoreWrapper = wrapper.find('ProgressButton').filter('[text="View more"]');
      expect(viewMoreWrapper).to.have.length(1);

      // Each click shows 12 more projects.
      viewMoreWrapper.simulate('click');
      expect(wrapper.find('ProjectCard')).to.have.length(24);
      viewMoreWrapper = wrapper.find('ProgressButton').filter('[text="View more"]');
      expect(viewMoreWrapper).to.have.length(1);
      expect(stubAjax).not.to.have.been.called;

      // Requests more from the server once all projects are displayed.
      viewMoreWrapper.simulate('click');
      expect(wrapper.find('ProjectCard')).to.have.length(30);
      viewMoreWrapper = wrapper.find('ProgressButton').filter('[text="View more"]');
      expect(stubAjax).to.have.been.calledOnce;
      // The call to setHasOlderProjects is expected because we received fewer
      // projects from the server than we asked for.
      expect(stubSetHasOlderProjects).to.have.been.calledWith(false, 'applab');
      expect(stubAddOlderProjects).to.have.been.calledOnce;
      expect(viewMoreWrapper).to.have.length(1);

      // Update props to simulate the effects of the redux actions
      wrapper.setProps({
        projectList: generateFakeProjects(40, 'applab'),
        hasOlderProjects: false,
      });

      // Displays additional projects returned from the server.
      expect(wrapper.find('ProjectCard')).to.have.length(36);
      viewMoreWrapper = wrapper.find('ProgressButton').filter('[text="View more"]');
      expect(viewMoreWrapper).to.have.length(1);

      // Skips fetching projects from the server and hides the View More button
      // once all projects on the server and client are shown.
      viewMoreWrapper.simulate('click');
      expect(wrapper.find('ProjectCard')).to.have.length(40);
      viewMoreWrapper = wrapper.find('ProgressButton').filter('[text="View more"]');
      expect(viewMoreWrapper).to.have.length(0);
      expect(stubAjax).to.have.been.calledOnce;
    });
  });
});
