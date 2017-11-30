import React from 'react';
import {mount} from 'enzyme';
import {expect} from '../../util/configuredChai';
import StudentsBeyondHoc from '@cdo/apps/templates/StudentsBeyondHoc';
import {default as ResponsiveLegacy} from '@cdo/apps/responsive';
import {Provider} from 'react-redux';
import {combineReducers, createStore} from 'redux';
import responsive from '@cdo/apps/code-studio/responsiveRedux';
import isRtl from '@cdo/apps/code-studio/isRtlRedux';

describe('StudentsBeyondHoc', () => {
  let root;

  beforeEach(() => {
    const store = createStore(combineReducers({responsive, isRtl}));
    const responsiveLegacy = new ResponsiveLegacy();

    root = mount(
      <Provider store={store}>
        <StudentsBeyondHoc
          completedTutorialType="other"
          MCShareLink="code.org/minecraft/sharelink"
          responsive={responsiveLegacy}
          userType="signedOut"
          isEnglish={true}
        />
      </Provider>
    );
  });

  it('renders a VerticalImageResourceCardRow component', () => {
    expect(root.find('VerticalImageResourceCardRow').exists());
  });

  it('renders a CourseBlocksStudentGradeBands component', () => {
    expect(root.find('CourseBlocksStudentGradeBands').exists());
  });

  it('renders a LocalClassActionBlock component', () => {
    expect(root.find('LocalClassActionBlock').exists());
  });
});
