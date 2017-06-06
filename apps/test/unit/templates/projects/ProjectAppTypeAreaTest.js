import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/configuredChai';
import ProjectAppTypeArea from '@cdo/apps/templates/projects/ProjectAppTypeArea';
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

function stubNavigate() {}

describe('ProjectAppTypeArea', () => {
  describe('detail view', () => {
    it('shows the right number of projects initially', () => {
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
        />
      );
      expect(wrapper.find('ProjectCard')).to.have.length(12);
      expect(wrapper.find('ProgressButton').filter('[text="View more"]')).to.have.length(1);
    });

    it('displays more projects when View More is pressed', () => {
      const onFetch = sinon.stub().callsFake((type, callback) => callback());
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
          fetchOlderProjects={onFetch}
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
      expect(onFetch).not.to.have.been.called;

      // Requests more from the server once all projects are displayed.
      viewMoreWrapper.simulate('click');
      expect(wrapper.find('ProjectCard')).to.have.length(30);
      viewMoreWrapper = wrapper.find('ProgressButton').filter('[text="View more"]');
      expect(onFetch).to.have.been.calledWith('applab');
      expect(viewMoreWrapper).to.have.length(1);

      // Displays additional projects returned from the server.
      wrapper.setProps({projectList: generateFakeProjects(40, 'applab')});
      expect(wrapper.find('ProjectCard')).to.have.length(36);
      viewMoreWrapper = wrapper.find('ProgressButton').filter('[text="View more"]');
      expect(viewMoreWrapper).to.have.length(1);

      // Tries to fetch more projects from the server again.
      viewMoreWrapper.simulate('click');
      expect(wrapper.find('ProjectCard')).to.have.length(40);
      viewMoreWrapper = wrapper.find('ProgressButton').filter('[text="View more"]');
      expect(viewMoreWrapper).to.have.length(1);
      expect(onFetch).to.have.been.calledTwice;

      // Hides the View More button when no additional projects are found.
      wrapper.setProps({hasOlderProjects: false});
      viewMoreWrapper = wrapper.find('ProgressButton').filter('[text="View more"]');
      expect(viewMoreWrapper).to.have.length(0);
    });
  });
});
