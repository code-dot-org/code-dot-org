import React from 'react';
import {mount} from 'enzyme';
import {expect} from '../../util/configuredChai';
import StudentsBeyondHoc from '@cdo/apps/templates/StudentsBeyondHoc';
import {Provider} from 'react-redux';
import {getStore} from '@cdo/apps/redux';

describe('StudentsBeyondHoc', () => {
  let root;

  beforeEach(() => {
    const store = getStore();

    root = mount(
      <Provider store={store}>
        <StudentsBeyondHoc
          completedTutorialType="other"
          MCShareLink="code.org/minecraft/sharelink"
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
