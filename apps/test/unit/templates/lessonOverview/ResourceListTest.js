import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
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
            type: 'Activity Guide',
          },
          {
            key: 'all-resource',
            name: 'All Resource',
            url: 'fake.url',
            download_url: 'download.fake.url',
            type: 'Activity Guide',
          },
        ]}
        pageType="teacher-lesson-plan"
      />
    );
    expect(wrapper.find('li').length).toBe(2);
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
            type: 'Activity Guide',
          },
        ]}
        pageType="teacher-lesson-plan"
      />
    );
    expect(wrapper.find('li').at(0).contains('Download')).toBe(true);
  });

  it('displays resource without download link', () => {
    const wrapper = shallow(
      <ResourceList
        resources={[
          {
            key: 'student-resource',
            name: 'Student Resource',
            url: 'fake.url',
            type: 'Activity Guide',
          },
        ]}
        pageType="teacher-lesson-plan"
      />
    );
    expect(wrapper.find('li').at(0).contains('Download')).toBe(false);
  });

  it('sends amplitude event when resource is clicked', () => {
    const analyticsSpy = jest.spyOn(analyticsReporter, 'sendEvent').mockClear();
    const wrapper = shallow(
      <ResourceList
        resources={[
          {
            key: 'student-resource',
            name: 'Student Resource',
            url: 'https://docs.google.com/document/d/fake/url',
            download_url: 'download.fake.url',
            type: 'Activity Guide',
          },
        ]}
        pageType="teacher-lesson-plan"
      />
    );

    const num_links = 5;
    expect(wrapper.find('a').length).toBe(num_links);
    wrapper.find('a').forEach(link => {
      link.simulate('click', {preventDefault() {}});
    });
    expect(analyticsSpy).toHaveBeenCalledTimes(num_links);
    expect(analyticsSpy.mock.calls[0].firstArg).toBe(EVENTS.LESSON_RESOURCE_LINK_VISITED_EVENT);
    analyticsSpy.mockRestore();
  });
});
