import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import * as utils from '@cdo/apps/code-studio/utils';
import {
  UnconnectedCodeReviewTimelineElement as CodeReviewTimelineElement,
  codeReviewTimelineElementType,
} from '@cdo/apps/templates/instructions/codeReviewV2/CodeReviewTimelineElement';
import color from '@cdo/apps/util/color';
import javalabMsg from '@cdo/javalab/locale';

const DEFAULT_PROPS = {
  type: codeReviewTimelineElementType.CREATED,
  isLast: false,
  projectVersionId: 'asdfjkl',
  viewAsCodeReviewer: false,
};

const setUp = (overrideProps = {}, child) => {
  const children = child || <div />;
  const props = {...DEFAULT_PROPS, ...overrideProps};
  return shallow(
    <CodeReviewTimelineElement {...props}>{children}</CodeReviewTimelineElement>
  );
};

describe('CodeReviewTimelineElement', () => {
  describe('Created', () => {
    it('displays a purple timeline dot', () => {
      const wrapper = setUp({
        type: codeReviewTimelineElementType.CREATED,
      });
      const timelineDot = wrapper.find('TimelineDot');
      expect(timelineDot).toHaveLength(1);
      expect(timelineDot.props().color).toBe(color.purple);
    });

    it('displays a bottom line if it is not the last element', () => {
      const wrapper = setUp({
        type: codeReviewTimelineElementType.CREATED,
        isLast: false,
      });
      const timelineLine = wrapper.find('TimelineLine');
      expect(timelineLine).toHaveLength(1);
    });

    it('hides bottom line if it is the last element', () => {
      const wrapper = setUp({
        type: codeReviewTimelineElementType.CREATED,
        isLast: true,
      });
      const timelineLine = wrapper.find('TimelineLine');
      expect(timelineLine).toHaveLength(0);
    });

    it('has created text', () => {
      const wrapper = setUp({
        type: codeReviewTimelineElementType.CREATED,
      });
      expect(wrapper.contains(javalabMsg.created())).toBe(true);
    });
  });

  describe('Commit', () => {
    it('displays an eyeball link if there is a version and viewAsCodeReviewer is false', () => {
      const wrapper = setUp({
        type: codeReviewTimelineElementType.COMMIT,
        projectVersionId: 'asdfjkl',
        viewAsCodeReviewer: false,
      });
      const eyeballLink = wrapper.find('EyeballLink');
      expect(eyeballLink).toHaveLength(1);
      expect(eyeballLink.props().versionHref.includes('version=asdfjkl')).toBe(
        true
      );
    });

    it('has expected params in eyeball link', () => {
      // Params existing in the url should be included and version param is overridden if one already exists in the url
      jest.spyOn(utils, 'queryParams').mockClear().mockReturnValue({
        user_id: 123,
        section_id: 456,
        version: 'viewingOldVersion',
      });
      const wrapper = setUp({
        type: codeReviewTimelineElementType.COMMIT,
        projectVersionId: 'asdfjkl',
        viewAsCodeReviewer: false,
      });
      const eyeballLink = wrapper.find('EyeballLink');
      expect(eyeballLink.props().versionHref.includes('version=asdfjkl')).toBe(
        true
      );
      expect(eyeballLink.props().versionHref.includes('user_id=123')).toBe(
        true
      );
      expect(eyeballLink.props().versionHref.includes('section_id=456')).toBe(
        true
      );
      utils.queryParams.mockRestore();
    });

    it('hides eyeball link if there is not a version', () => {
      const wrapper = setUp({
        type: codeReviewTimelineElementType.COMMIT,
        projectVersionId: null,
        viewAsCodeReviewer: false,
      });
      expect(wrapper.find('EyeballLink')).toHaveLength(0);
    });

    it('hides eyeball link if viewAsCodeReviewer is true', () => {
      const wrapper = setUp({
        type: codeReviewTimelineElementType.COMMIT,
        projectVersionId: 'asdfjkl',
        viewAsCodeReviewer: true,
      });
      expect(wrapper.find('EyeballLink')).toHaveLength(0);
    });

    it('displays a bottom line if it is not the last element', () => {
      const wrapper = setUp({
        type: codeReviewTimelineElementType.COMMIT,
        isLast: false,
      });
      const timelineLine = wrapper.find('TimelineLine');
      expect(timelineLine).toHaveLength(1);
    });

    it('does not display a bottom line if it is the last element', () => {
      const wrapper = setUp({
        type: codeReviewTimelineElementType.COMMIT,
        isLast: true,
      });
      const timelineLine = wrapper.find('TimelineLine');
      expect(timelineLine).toHaveLength(0);
    });

    it('displays gray timeline dot with a check', () => {
      const wrapper = setUp({
        type: codeReviewTimelineElementType.COMMIT,
      });
      const timelineDot = wrapper.find('TimelineDot');
      expect(timelineDot).toHaveLength(1);
      expect(timelineDot.props().color).toBe(color.dark_charcoal);
      expect(timelineDot.props().hasCheck).toBe(true);
    });
  });

  describe('Code review', () => {
    it('displays an eyeball link if there is a version', () => {
      const wrapper = setUp({
        type: codeReviewTimelineElementType.CODE_REVIEW,
        projectVersionId: 'asdfjkl',
      });
      expect(wrapper.find('EyeballLink')).toHaveLength(1);
    });

    it('hides eyeball link if there is not a version', () => {
      const wrapper = setUp({
        type: codeReviewTimelineElementType.CODE_REVIEW,
        projectVersionId: null,
      });
      expect(wrapper.find('EyeballLink')).toHaveLength(0);
    });

    it('displays children', () => {
      const child = <div className="the-child" />;
      const wrapper = setUp(
        {
          type: codeReviewTimelineElementType.COMMIT,
        },
        child
      );
      expect(wrapper.find('.the-child')).toHaveLength(1);
    });

    it('displays a bottom line if it is not the last', () => {
      const wrapper = setUp({
        type: codeReviewTimelineElementType.CODE_REVIEW,
        isLast: false,
      });
      expect(wrapper.find('TimelineLine')).toHaveLength(1);
    });

    it('displays no line if it is last', () => {
      const wrapper = setUp({
        type: codeReviewTimelineElementType.CODE_REVIEW,
        isLast: true,
      });
      expect(wrapper.find('TimelineLine')).toHaveLength(0);
    });
  });
});
