import React from 'react';
import {Provider} from 'react-redux';
import {mount} from 'enzyme';
import {expect} from '../../util/reconfiguredChai';
import StudentsBeyondHoc from '@cdo/apps/templates/StudentsBeyondHoc';
import {combineReducers, createStore} from 'redux';
import responsive from '@cdo/apps/code-studio/responsiveRedux';
import isRtl from '@cdo/apps/code-studio/isRtlRedux';

const store = createStore(combineReducers({responsive, isRtl}));

function wrapped(element) {
  return mount(<Provider store={store}>{element}</Provider>);
}

describe('StudentsBeyondHoc', () => {
  it('renders a VerticalImageResourceCardRow component', () => {
    const wrapper = wrapped(
      <StudentsBeyondHoc
        completedTutorialType="other"
        MCShareLink=""
        userType="signedOut"
        isEnglish={true}
      />
    );
    expect(wrapper.find('VerticalImageResourceCardRow').exists());
  });

  it('renders a CourseBlocksStudentGradeBands component', () => {
    const wrapper = wrapped(
      <StudentsBeyondHoc
        completedTutorialType="other"
        MCShareLink="code.org/minecraft/sharelink"
        userType="signedOut"
        isEnglish={true}
      />
    );
    expect(wrapper.find('CourseBlocksStudentGradeBands').exists());
  });

  it('renders a LocalClassActionBlock component', () => {
    const wrapper = wrapped(
      <StudentsBeyondHoc
        completedTutorialType="other"
        MCShareLink="code.org/minecraft/sharelink"
        userType="signedOut"
        isEnglish={true}
      />
    );
    expect(wrapper.find('LocalClassActionBlock').exists());
  });
});
