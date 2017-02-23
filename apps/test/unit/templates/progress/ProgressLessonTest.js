import { assert } from '../../../util/configuredChai';
import React from 'react';
import { shallow } from 'enzyme';
import { UnconnectedProgressLesson as ProgressLesson } from '@cdo/apps/templates/progress/ProgressLesson';
import { ViewType } from '@cdo/apps/code-studio/stageLockRedux';
import Immutable from 'immutable';
import { fakeLesson, fakeLevels } from './progressTestUtils';
import color from "@cdo/apps/util/color";

describe('ProgressLesson', () => {
  const defaultProps = {
    lesson: fakeLesson('lesson1', 1),
    levels: fakeLevels(3),
    lessonNumber: 3,
    viewAs: ViewType.Teacher,
    sectionId: '11',
    hiddenStageState: Immutable.fromJS({
      bySection: {
        '11': { }
      }
    })
  };

  it('renders with gray background when not hidden', () => {
    const wrapper = shallow(
      <ProgressLesson
        {...defaultProps}
      />
    );
    assert.equal(wrapper.props().style.background, color.lightest_gray);
  });

  it('does not render when hidden and viewing as student', () => {
    const wrapper = shallow(
      <ProgressLesson
        {...defaultProps}
        viewAs={ViewType.Student}
        hiddenStageState={Immutable.fromJS({
          bySection: {
            '11': { '1': true }
          }
        })}
      />
    );

    assert.equal(wrapper.node, null);
  });

  it('renders with white background when hidden and viewing as teacher', () => {
    const wrapper = shallow(
      <ProgressLesson
        {...defaultProps}
        viewAs={ViewType.Teacher}
        hiddenStageState={Immutable.fromJS({
          bySection: {
            '11': { '1': true }
          }
        })}
      />
    );
    assert.equal(wrapper.props().style.background, color.white);
  });
});
