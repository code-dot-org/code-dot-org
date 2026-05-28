import {createUuid} from '@cdo/apps/utils';

import {ExistingLessonData, SlideSpec} from '../types';

export function buildInitialState(lesson: ExistingLessonData): SlideSpec[] {
  const fromFile: SlideSpec[] = lesson.slides.map(s => ({
    key: s.key,
    description: s.description,
    panel: s.panel ?? null,
    // Default a saved slide to NOT regenerate on next save. The user can
    // re-tick the box manually, and editing the description flips it
    // back on automatically (see updateSpec in the parent component).
    generate: false,
    lastGeneratedDescription: s.panel ? s.description : undefined,
  }));
  // For a brand-new lesson with no slides yet, seed an empty card so
  // the user has somewhere to type without first hunting for "+ Add slide".
  return fromFile.length > 0 ? fromFile : [newSlideSpec()];
}

export function newSlideSpec(): SlideSpec {
  return {
    key: createUuid(),
    description: '',
    panel: null,
    generate: true,
  };
}
