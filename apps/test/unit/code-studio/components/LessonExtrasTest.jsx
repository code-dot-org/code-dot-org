import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import LessonExtras from '@cdo/apps/code-studio/components/lessonExtras/LessonExtras';

import {bonusLevels} from './lessonExtrasTestHelpers';

const DEFAULT_PROPS = {
  lessonNumber: 1,
  nextLessonNumber: 2,
  nextLevelPath: '',
  showProjectWidget: true,
  projectTypes: [],
  bonusLevels: bonusLevels,
  sectionId: 3,
  userId: 5,
  showLessonExtrasWarning: true,
};

describe('LessonExtras', () => {
  it('does not show lesson extras warning if showLessonExtrasWarning is false', () => {
    const wrapper = shallow(
      <LessonExtras {...DEFAULT_PROPS} showLessonExtrasWarning={false} />
    );
    expect(wrapper.find('LessonExtrasNotification')).toHaveLength(0);
  });

  it('does not show lesson extras warning if sectionId is not provided', () => {
    const wrapper = shallow(
      <LessonExtras {...DEFAULT_PROPS} sectionId={null} />
    );
    expect(wrapper.find('LessonExtrasNotification')).toHaveLength(0);
  });

  it('show lesson extra warning if showLessonExtrasWarning and have sectionId', () => {
    const wrapper = shallow(<LessonExtras {...DEFAULT_PROPS} />);
    expect(wrapper.find('LessonExtrasNotification')).toHaveLength(1);
  });

  it('renders BonusLevels area', () => {
    const wrapper = shallow(<LessonExtras {...DEFAULT_PROPS} />);
    expect(1).toEqual(wrapper.find('BonusLevels').length);
  });
});
