import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import {Provider} from 'react-redux';
import {combineReducers, createStore} from 'redux';

import isRtl from '@cdo/apps/code-studio/isRtlRedux';
import responsive from '@cdo/apps/code-studio/responsiveRedux';
import StudentsBeyondHoc from '@cdo/apps/templates/certificates/StudentsBeyondHoc';

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
});
