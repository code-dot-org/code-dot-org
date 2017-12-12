import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/configuredChai';
import CourseCard from '@cdo/apps/templates/studioHomepages/CourseCard';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import { courses } from './homepagesTestData';
import {combineReducers, createStore} from 'redux';
import isRtl, {setRtl} from '@cdo/apps/code-studio/isRtlRedux';

describe('CourseCard', () => {
  const store = createStore(combineReducers({isRtl}));

  it('renders a card-shaped link', () => {
    const wrapper = shallow(
      <CourseCard
        title={courses[0].title}
        description={courses[0].description}
        link={courses[0].link}
      />, {context: {store}},
    ).dive();
    expect(wrapper).to.containMatchingElement(
      <a href={courses[0].link}>
        <img/>
        <div>
          {courses[0].title}
        </div>
        <div>
          {courses[0].description}
          <div>
            <h3>
              View course
            </h3>
            <FontAwesome icon="chevron-right"/>
          </div>
        </div>
      </a>
    );
  });

  it('can render in RTL mode', () => {
    store.dispatch(setRtl(true));
    const wrapper = shallow(
      <CourseCard
        title={courses[0].title}
        description={courses[0].description}
        link={courses[0].link}
      />, {context: {store}},
    ).dive();
    expect(wrapper).to.containMatchingElement(
      <a href={courses[0].link}>
        <img/>
        <div>
          {courses[0].title}
        </div>
        <div>
          {courses[0].description}
          <div>
            <h3>
              View course
            </h3>
            <FontAwesome icon="chevron-left"/>
          </div>
        </div>
      </a>
    );
  });
});
