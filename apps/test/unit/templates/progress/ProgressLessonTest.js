import { assert } from '../../../util/configuredChai';
import React from 'react';
import { shallow } from 'enzyme';
import { UnconnectedProgressLesson as ProgressLesson } from '@cdo/apps/templates/progress/ProgressLesson';
import { ViewType } from '@cdo/apps/code-studio/stageLockRedux';
import Immutable from 'immutable';
import { fakeLesson, fakeLevels } from '@cdo/apps/templates/progress/progressTestHelpers';
import color from "@cdo/apps/util/color";

describe('ProgressLesson', () => {
  const defaultProps = {
    lesson: fakeLesson('lesson1', 1),
    levels: fakeLevels(3),
    lessonNumber: 3,
    lessonIsVisible: () => true,
    lessonLockedForSection: () => false
  };

  it('renders with gray background when not hidden', () => {
    const wrapper = shallow(
      <ProgressLesson
        {...defaultProps}
      />
    );
    assert.equal(wrapper.props().style.background, color.lightest_gray);
  });

  it('does not render when lessonIsVisible is false', () => {
    const wrapper = shallow(
      <ProgressLesson
        {...defaultProps}
        lessonIsVisible={() => false}
        viewAs={ViewType.Student}
      />
    );

    assert.equal(wrapper.node, null);
  });

  it('renders with white background when only visible for teachers', () => {
    const wrapper = shallow(
      <ProgressLesson
        {...defaultProps}
        lessonIsVisible={(lesson, viewAs) => viewAs !== ViewType.Student}
      />
    );
    assert.equal(wrapper.props().style.background, color.white);
  });

  // TODO - tests for lockable stages
});
