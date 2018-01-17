import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../util/configuredChai';
import StudentsBeyondHoc from '@cdo/apps/templates/StudentsBeyondHoc';
import {combineReducers, createStore} from 'redux';
import responsive from '@cdo/apps/code-studio/responsiveRedux';

describe('StudentsBeyondHoc', () => {
  const store = createStore(combineReducers({responsive}));

  it('renders a VerticalImageResourceCardRow component', () => {
    const wrapper = shallow(
      <StudentsBeyondHoc
        completedTutorialType="other"
        MCShareLink=""
        userType="signedOut"
        isEnglish={true}
      />, {context: {store}},
    ).dive();
    expect(wrapper.find('VerticalImageResourceCardRow').exists());
  });

  it('renders a CourseBlocksStudentGradeBands component', () => {
    const wrapper = shallow(
      <StudentsBeyondHoc
        completedTutorialType="other"
        MCShareLink="code.org/minecraft/sharelink"
        userType="signedOut"
        isEnglish={true}
      />, {context: {store}},
    ).dive();
    expect(wrapper.find('CourseBlocksStudentGradeBands').exists());
  });

  it('renders a LocalClassActionBlock component', () => {
    const wrapper = shallow(
      <StudentsBeyondHoc
        completedTutorialType="other"
        MCShareLink="code.org/minecraft/sharelink"
        userType="signedOut"
        isEnglish={true}
      />, {context: {store}},
    ).dive();
    expect(wrapper.find('LocalClassActionBlock').exists());
  });
});
