import Modal from '@code-dot-org/component-library/modal';
import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

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
    const modal = wrapper.find(Modal);

    it('displays expected header', () => {
      expect(modal.prop('title')).toContain('You finished Lesson 2!');
    });

    it('displays expected message', () => {
      expect(modal.prop('description')).toContain(
        'Check in with your teacher for the next activity.'
      );
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
    // Modal renders the OK button itself via `primaryButtonProps`; invoke
    // its onClick directly rather than finding a child Button.
    wrapper.find(Modal).prop('primaryButtonProps').onClick();
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
    wrapper.find(Modal).prop('primaryButtonProps').onClick();
    expect(scrollIntoViewSpy).toHaveBeenCalled();

    document.getElementById.mockRestore();
  });
});
