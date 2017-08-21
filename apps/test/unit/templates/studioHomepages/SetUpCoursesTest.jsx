import React from 'react';
import { Provider } from 'react-redux';
import {mount} from 'enzyme';
import {assert} from '../../../util/configuredChai';
import { getStore, registerReducers, stubRedux, restoreRedux } from '@cdo/apps/redux';
import isRtlReducer from '@cdo/apps/code-studio/isRtlRedux';
import Button from "@cdo/apps/templates/Button";
import SetUpCourses from '@cdo/apps/templates/studioHomepages/SetUpCourses';

beforeEach(() => {
  stubRedux();
  registerReducers({isRtl: isRtlReducer});
});

afterEach(() => {
  restoreRedux();
});

describe('SetUpCourses', () => {
  it('renders as expected for a teacher', () => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <SetUpCourses isTeacher={true}/>
      </Provider>
    );
    assert(wrapper.containsMatchingElement(
      <div>
        <div>
          <div>
            Start learning
          </div>
          <div>
            Assign a course to your classroom or start your own course.
          </div>
        </div>
        <Button
          href={'/courses'}
          color={Button.ButtonColor.gray}
          text={'Find a course'}
        />
        <div/>
      </div>
    ));
  });

  it('renders as expected for a student', () => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <SetUpCourses isTeacher={false}/>
      </Provider>
    );
    assert(wrapper.containsMatchingElement(
      <div>
        <div>
          <div>
            Start learning
          </div>
          <div>
            Browse Code.org's courses to find your next challenge.
          </div>
          </div>
          <Button
            href={'/courses'}
            color={Button.ButtonColor.gray}
            text={'Find a course'}
          />
        <div/>
      </div>
    ));
  });
});
