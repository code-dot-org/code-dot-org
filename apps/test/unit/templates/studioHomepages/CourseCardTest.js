import React from 'react';
import {Provider} from 'react-redux';
import {mount} from 'enzyme';
import {expect, assert} from '../../../util/reconfiguredChai';
import CourseCard from '@cdo/apps/templates/studioHomepages/CourseCard';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import {courses} from './homepagesTestData';
import {combineReducers, createStore} from 'redux';
import isRtl, {setRtl} from '@cdo/apps/code-studio/isRtlRedux';

const store = createStore(combineReducers({isRtl}));

function wrapped(element) {
  return mount(<Provider store={store}>{element}</Provider>);
}

describe('CourseCard', () => {
  it('renders a card-shaped link', () => {
    const wrapper = wrapped(
      <CourseCard
        title={courses[0].title}
        description={courses[0].description}
        link={courses[0].link}
      />
    );
    expect(
      wrapper.containsMatchingElement(
        <a href={courses[0].link}>
          <img />
          <div>{courses[0].title}</div>
          <div>
            {courses[0].description}
            <div>
              <h3>View course</h3>
              <FontAwesome icon="chevron-right" />
            </div>
          </div>
        </a>
      )
    );
  });

  it('can render in RTL mode', () => {
    store.dispatch(setRtl(true));
    const wrapper = wrapped(
      <CourseCard
        title={courses[0].title}
        description={courses[0].description}
        link={courses[0].link}
      />
    );
    expect(
      wrapper.containsMatchingElement(
        <a href={courses[0].link}>
          <img />
          <div>{courses[0].title}</div>
          <div>
            {courses[0].description}
            <div>
              <h3>View course</h3>
              <FontAwesome icon="chevron-left" />
            </div>
          </div>
        </a>
      )
    );
  });

  it('shows blue image when it is a professional learning course', () => {
    const wrapper = wrapped(
      <CourseCard
        title={courses[0].title}
        description={courses[0].description}
        link={courses[0].link}
        isProfessionalLearningCourse={true}
      />
    );

    assert.include(
      wrapper.find('img').props().src,
      'small_blue_icons_fullwidth'
    );
  });

  it('shows purple image when it is a student facing course', () => {
    const wrapper = wrapped(
      <CourseCard
        title={courses[0].title}
        description={courses[0].description}
        link={courses[0].link}
        isProfessionalLearningCourse={false}
      />
    );

    assert.include(wrapper.find('img').props().src, 'small_purple_icons');
  });
});
