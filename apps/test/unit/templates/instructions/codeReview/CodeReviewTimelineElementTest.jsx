import React from 'react';
import {shallow} from 'enzyme';
import CodeReviewTimelineElement, {
  codeReviewTimelineElementType
} from '@cdo/apps/templates/instructions/codeReview/CodeReviewTimelineElement';

const DEFAULT_PROPS = {
  type: codeReviewTimelineElementType.CREATED,
  isLast: false
};

const setUp = () => {
  return shallow(<CodeReviewTimelineElement {...DEFAULT_PROPS} />);
};

describe('CodeReviewTimelineElement', () => {
  describe('Created', () => {
    setUp();
  });

  describe('Commit', () => {});

  describe('Code review', () => {});
});
