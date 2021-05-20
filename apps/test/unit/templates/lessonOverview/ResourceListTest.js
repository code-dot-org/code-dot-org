import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import ResourceList from '@cdo/apps/templates/lessonOverview/ResourceList';

describe('ResourceList', () => {
  it('displays resources in bulleted list', () => {
    const wrapper = shallow(
      <ResourceList
        resources={[
          {
            key: 'student-resource',
            name: 'Student Resource',
            url: 'fake.url',
            download_url: 'download.fake.url',
            type: 'Activity Guide'
          },
          {
            key: 'all-resource',
            name: 'All Resource',
            url: 'fake.url',
            download_url: 'download.fake.url',
            type: 'Activity Guide'
          }
        ]}
        pageType="teacher-lesson-plan"
      />
    );
    expect(wrapper.find('li').length).to.equal(2);
  });

  it('displays resource with download link', () => {
    const wrapper = shallow(
      <ResourceList
        resources={[
          {
            key: 'student-resource',
            name: 'Student Resource',
            url: 'fake.url',
            download_url: 'download.fake.url',
            type: 'Activity Guide'
          }
        ]}
        pageType="teacher-lesson-plan"
      />
    );
    expect(
      wrapper
        .find('li')
        .at(0)
        .contains('Download')
    ).to.true;
  });

  it('displays resource without download link', () => {
    const wrapper = shallow(
      <ResourceList
        resources={[
          {
            key: 'student-resource',
            name: 'Student Resource',
            url: 'fake.url',
            type: 'Activity Guide'
          }
        ]}
        pageType="teacher-lesson-plan"
      />
    );
    expect(
      wrapper
        .find('li')
        .at(0)
        .contains('Download')
    ).to.false;
  });
});
