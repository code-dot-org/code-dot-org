import React from 'react';
import { Provider } from 'react-redux';
import { getStore, registerReducers, stubRedux, restoreRedux } from '@cdo/apps/redux';
import isRtlReducer from '@cdo/apps/code-studio/isRtlRedux';
import {mount} from 'enzyme';
import {assert, expect} from '../../../util/configuredChai';
import SeeMoreCourses from '@cdo/apps/templates/studioHomepages/SeeMoreCourses';
import Button from "@cdo/apps/templates/Button";
import { courses } from './homepagesTestData';

beforeEach(() => {
  stubRedux();
  registerReducers({isRtl: isRtlReducer});
});

afterEach(() => {
  restoreRedux();
});

describe('SeeMoreCourses', () => {
  it ('shows a button when closed', () => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <SeeMoreCourses courses={courses}/>
      </Provider>
    );
    assert(wrapper.containsMatchingElement(
      <Button
        color={Button.ButtonColor.gray}
        icon="caret-down"
        text={'View more'}
      />
    ));
  });

  it ('shows CourseCards when clicked', () => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <SeeMoreCourses courses={courses}/>
      </Provider>
    );
    expect(wrapper.find('Button').exists());
    expect(wrapper.find('ContentContainer').exists()).to.be.false;
    wrapper.find('Button').simulate('click');
    expect(wrapper.find('Button').exists()).to.be.false;
    expect(wrapper.find('ContentContainer').exists());
    expect(wrapper.find('CourseCard')).to.have.length(2);
  });
});
