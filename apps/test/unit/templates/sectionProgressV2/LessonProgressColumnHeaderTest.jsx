import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';
import sinon from 'sinon';

import {
  fakeLessonWithLevels,
  fakeLesson,
} from '@cdo/apps/templates/progress/progressTestHelpers';
import LessonProgressColumnHeader from '@cdo/apps/templates/sectionProgressV2/LessonProgressColumnHeader.jsx';
import i18n from '@cdo/locale';

import {expect} from '../../../util/reconfiguredChai';

const LESSON = fakeLessonWithLevels({numberedLesson: true}, 1);

const DEFAULT_PROPS = {
  lesson: LESSON,
  addExpandedLesson: () => {},
  allLocked: true,
};

const renderDefault = overrideProps => {
  const props = {...DEFAULT_PROPS, ...overrideProps};
  render(<LessonProgressColumnHeader {...props} />);
};

describe('LessonProgressColumnHeader', () => {
  it('Shows skeleton if fake lesson', () => {
    renderDefault({lesson: {id: 1, isFake: true}});

    screen.getByLabelText(i18n.loadingLesson());
  });

  it('Shows uninteractive if no levels in lesson', () => {
    const lesson = fakeLesson();
    lesson.numberedLesson = true;
    renderDefault({lesson});

    expect(screen.queryByTitle(i18n.expand())).to.be.null;
  });

  it('Shows uninteractive if lockable lesson', () => {
    const lesson = fakeLesson();
    lesson.lockable = true;
    renderDefault({lesson});

    expect(screen.queryByTitle(i18n.expand())).to.be.null;
    screen.getByTitle(i18n.locked());
  });

  it('Shows lesson header and expands on click', () => {
    const addExpandedLesson = sinon.spy();
    renderDefault({addExpandedLesson: addExpandedLesson});

    screen.getByText(LESSON.relative_position);

    const caret = screen.getByTitle(i18n.expand());

    fireEvent.click(caret);
    expect(addExpandedLesson).to.have.been.calledOnce;
  });
});
