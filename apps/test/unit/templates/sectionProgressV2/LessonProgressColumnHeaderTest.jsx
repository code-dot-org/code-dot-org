import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';

import FontAwesome from '@cdo/apps/templates//FontAwesome';
import LessonProgressColumnHeader from '@cdo/apps/templates/sectionProgressV2/LessonProgressColumnHeader.jsx';
import skeletonizeContent from '@cdo/apps/componentLibrary/skeletonize-content.module.scss';
import styles from '@cdo/apps/templates/sectionProgressV2/progress-table-v2.module.scss';
import sinon from 'sinon';

import {
  fakeLessonWithLevels,
  fakeLesson,
} from '@cdo/apps/templates/progress/progressTestHelpers';

const LESSON = fakeLessonWithLevels({}, 1);

const DEFAULT_PROPS = {
  lesson: LESSON,
  addExpandedLesson: () => {},
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
    const wrapper = setUp({lesson: fakeLesson()});

    expect(wrapper.find(FontAwesome)).to.have.length(0);
  });

  it('Shows lesson header and expands on click', () => {
    const addExpandedLesson = sinon.spy();
    const wrapper = setUp({addExpandedLesson: addExpandedLesson});

    expect(wrapper.find(FontAwesome)).to.have.length(1);
    expect(wrapper.find(`.${styles.lessonHeaderCell}`)).to.have.length(1);

    wrapper.find(`.${styles.lessonHeaderCell}`).simulate('click');
    expect(addExpandedLesson).to.have.been.calledOnce;
  });
});
