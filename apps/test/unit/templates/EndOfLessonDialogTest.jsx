import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import Button from '@cdo/apps/legacySharedComponents/Button';
import {UnconnectedEndOfLessonDialog as EndOfLessonDialog} from '@cdo/apps/templates/EndOfLessonDialog';

const DEFAULT_PROPS = {
  lessonNumber: 2,
  isSummaryView: false,
};

const setUp = (overrideProps = {}) => {
  const props = {...DEFAULT_PROPS, ...overrideProps};
  return shallow(<EndOfLessonDialog {...props} />);
};

describe('EndOfLessonDialog', () => {
  describe('with DEFAULT_PROPS', () => {
    const wrapper = setUp();

    it('displays expected header', () => {
      expect(wrapper.contains('You finished Lesson 2!')).toBe(true);
    });

    it('displays expected message', () => {
      expect(
        wrapper.contains('Check in with your teacher for the next activity.')
      ).toBe(true);
    });
  });

  it('scrolls summary progress row into view when dismissed and isSummaryView = true', () => {
    const scrollIntoViewSpy = jest.fn();

    jest
      .spyOn(document, 'getElementById')
      .mockClear()
      .mockImplementation((...args) => {
        if (args[0] === 'summary-progress-row-2') {
          return {scrollIntoView: scrollIntoViewSpy};
        }
      });

    const wrapper = setUp({isSummaryView: true});
    wrapper.find(Button).simulate('click');
    expect(scrollIntoViewSpy).toHaveBeenCalled();

    document.getElementById.mockRestore();
  });

  it('scrolls progress lesson into view when dismissed and isSummaryView = false', () => {
    const scrollIntoViewSpy = jest.fn();

    jest
      .spyOn(document, 'getElementById')
      .mockClear()
      .mockImplementation((...args) => {
        if (args[0] === 'progress-lesson-2') {
          return {scrollIntoView: scrollIntoViewSpy};
        }
      });

    const wrapper = setUp({isSummaryView: false});
    wrapper.find(Button).simulate('click');
    expect(scrollIntoViewSpy).toHaveBeenCalled();

    document.getElementById.mockRestore();
  });
});
