import {shallow} from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import FontAwesome from '@cdo/apps/templates//FontAwesome';
import {
  fakeLessonWithLevels,
  fakeLesson,
} from '@cdo/apps/templates/progress/progressTestHelpers';
import LessonProgressColumnHeader from '@cdo/apps/templates/sectionProgressV2/LessonProgressColumnHeader.jsx';

import {expect} from '../../../util/reconfiguredChai';

import skeletonizeContent from '@cdo/apps/componentLibrary/skeletonize-content.module.scss';
import styles from '@cdo/apps/templates/sectionProgressV2/progress-table-v2.module.scss';

const LESSON = fakeLessonWithLevels({numberedLesson: true}, 1);

const DEFAULT_PROPS = {
  lesson: LESSON,
  addExpandedLesson: () => {},
  allLocked: true,
};

const setUp = overrideProps => {
  const props = {...DEFAULT_PROPS, ...overrideProps};
  return shallow(<LessonProgressColumnHeader {...props} />);
};

describe('LessonProgressColumnHeader', () => {
  it('Shows skeleton if fake lesson', () => {
    const wrapper = setUp({lesson: {id: 1, isFake: true}});

    expect(
      wrapper.find(`.${skeletonizeContent.skeletonizeContent}`)
    ).to.have.length(1);
  });

  it('Shows uninteractive if no levels in lesson', () => {
    const lesson = fakeLesson();
    lesson.numberedLesson = true;
    const wrapper = setUp({lesson});

    expect(wrapper.find(FontAwesome)).to.have.length(0);
  });

  it('Shows uninteractive if lockable lesson', () => {
    const lesson = fakeLesson();
    lesson.lockable = true;
    const wrapper = setUp({lesson});

    expect(wrapper.find(FontAwesome)).to.have.length(1);
    expect(wrapper.findWhere(n => n.prop('icon') === 'lock')).to.have.length(1);
  });

  it('Shows lesson header and expands on click', () => {
    const addExpandedLesson = sinon.spy();
    const wrapper = setUp({addExpandedLesson: addExpandedLesson});

    expect(wrapper.find(FontAwesome)).to.have.length(1);
    expect(
      wrapper.findWhere(n => n.prop('icon') === 'caret-right')
    ).to.have.length(1);
    expect(wrapper.find(`.${styles.lessonHeaderCell}`)).to.have.length(1);

    wrapper.find(`.${styles.lessonHeaderCell}`).simulate('click');
    expect(addExpandedLesson).to.have.been.calledOnce;
  });
});
