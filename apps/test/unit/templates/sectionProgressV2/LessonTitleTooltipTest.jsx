
import {fireEvent, render, screen} from '@testing-library/react';
import LessonTitleTooltip, {getTooltipId} from '@cdo/apps/templates/sectionProgressV2/LessonTitleTooltip';

import {
  fakeLessonWithLevels,
} from '@cdo/apps/templates/progress/progressTestHelpers';
import { expect } from 'chai';

describe('LessonTitleTooltip', () => {

  it('Lesson text is parsed correctly', () => {
    const lesson = fakeLessonWithLevels({id: 6789, relative_position: 9999, name: 'this is a test lesson'});
    console.log(lesson);
    render(<LessonTitleTooltip lesson={lesson}/>);

    expect(screen.getByText('Lesson 9999: this is a test lesson')).to.exist;
  })

  it('id is parsed correctly', () => {
    const lesson = fakeLessonWithLevels({id: 6789, name: 'this is a test lesson'});

    expect(getTooltipId(lesson)).to.equal('tooltip-6789');
  });
});