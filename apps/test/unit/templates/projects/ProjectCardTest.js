import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/deprecatedChai';
import ProjectCard from '@cdo/apps/templates/projects/ProjectCard';
import msg from '@cdo/locale';

describe('ProjectCard', () => {
  const featuredProjectData = {
    channel: '12345',
    isFeatured: true,
    publishedAt: '2017-12-08T10:00:00.000+00:00'
  };
  const unfeaturedProjectData = {
    channel: '67890',
    isFeatured: false,
    publishedAt: '2017-12-08T10:00:00.000+00:00'
  };
  it('displays featured project label', () => {
    const wrapper = shallow(
      <ProjectCard
        projectData={featuredProjectData}
        currentGallery="public"
        isDetailView={true}
      />
    );
    const featuredLabel = wrapper.find('div').last();
    expect(featuredLabel.text()).to.equal(msg.featuredProject());
  });
  it('displays published label', () => {
    const wrapper = shallow(
      <ProjectCard
        projectData={unfeaturedProjectData}
        currentGallery="public"
        isDetailView={true}
      />
    );
    const publishedLabel = wrapper.find('div').last();
    expect(publishedLabel.text()).to.have.string(msg.published());
  });
});
