import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import ReadonlyTeacherFeedback from '@cdo/apps/templates/instructions/teacherFeedback/ReadonlyTeacherFeedback';
import Comment from '@cdo/apps/templates/instructions/teacherFeedback/Comment';
import ReadOnlyReviewState from '@cdo/apps/templates/instructions/teacherFeedback/ReadOnlyReviewState';
import Rubric from '@cdo/apps/templates/instructions/teacherFeedback/Rubric';
import {ReviewStates} from '@cdo/apps/templates/feedback/types';

const DEFAULT_PROPS = {
  rubric: null,
  visible: true,
  latestFeedback: null,
};

const RUBRIC = {
  keyConcept: 'This is the Key Concept',
  performanceLevel1: 'exceeded expectations',
  performanceLevel2: 'met expectations',
  performanceLevel3: 'approaches expectations',
  performanceLevel4: 'no evidence of trying',
};

const FEEDBACK = {
  comment: 'Good work!',
  created_at: '2019-03-26T19:56:53.000Z',
  id: 5,
  level_id: 123,
  performance: null,
  student_id: 1,
};

const setUp = (overrideProps = {}) => {
  const props = {...DEFAULT_PROPS, ...overrideProps};
  return shallow(<ReadonlyTeacherFeedback {...props} />);
};

describe('ReadonlyTeacherFeedback', () => {
  it('does not display tab content if it is not currently visible', () => {
    const wrapper = setUp({visible: false});
    expect(wrapper.isEmptyRender()).to.be.true;
  });

  describe('without previous feedback given', () => {
    it('does not display last updated', () => {
      const wrapper = setUp({
        rubric: RUBRIC,
      });
      expect(wrapper.find('#ui-test-feedback-time')).to.have.length(0);
    });

    it('displays rubric with expected props if there is a rubric', () => {
      const wrapper = setUp({
        rubric: RUBRIC,
      });
      const rubric = wrapper.find(Rubric);
      expect(rubric).to.have.length(1);
      expect(rubric.props().rubric).to.equal(RUBRIC);
      expect(rubric.props().isEditable).to.equal(false);
    });

    it('does not display the comment area', () => {
      const wrapper = setUp({
        rubric: RUBRIC,
      });
      expect(wrapper.find(Comment)).to.have.lengthOf(0);
    });

    it('does not display ReadOnlyReviewState', () => {
      const wrapper = setUp({
        rubric: RUBRIC,
      });
      expect(wrapper.find(ReadOnlyReviewState)).to.have.lengthOf(0);
    });
  });

  describe('with previous feedback given', () => {
    it('does not render rubric if there is no rubric for the level', () => {
      const wrapper = setUp({
        latestFeedback: FEEDBACK,
      });
      expect(wrapper.find(Rubric)).to.have.lengthOf(0);
    });

    it('renders rubric with expected props if there is a rubric for the level', () => {
      const latestFeedback = {
        ...FEEDBACK,
        performance: 'performanceLevel2',
      };

      const wrapper = setUp({
        rubric: RUBRIC,
        latestFeedback,
      });

      const rubric = wrapper.find(Rubric);
      expect(rubric).to.have.length(1);
      expect(rubric.props().rubric).to.equal(RUBRIC);
      expect(rubric.props().performance).to.equal('performanceLevel2');
      expect(rubric.props().isEditable).to.equal(false);
    });

    it('renders the comment with expected props if there is a comment', () => {
      const wrapper = setUp({
        latestFeedback: FEEDBACK,
      });
      const confirmCommentArea = wrapper.find(Comment).first();
      expect(confirmCommentArea.props().isEditable).to.equal(false);
      expect(confirmCommentArea.props().comment).to.equal('Good work!');
    });

    it('does not render a comment if no comment was given with feedback', () => {
      const latestFeedback = {
        ...FEEDBACK,
        comment: '',
        performance: 'performanceLevel2',
      };

      const wrapper = setUp({
        rubric: RUBRIC,
        latestFeedback,
      });

      expect(wrapper.find(Comment)).to.have.lengthOf(0);
    });

    it('renders ReadOnlyReviewState with expected props - keepWorking', () => {
      const latestFeedback = {
        ...FEEDBACK,
        review_state: ReviewStates.keepWorking,
      };
      const wrapper = setUp({latestFeedback});
      const reviewState = wrapper.find(ReadOnlyReviewState);
      expect(reviewState).to.have.lengthOf(1);
      expect(reviewState.props().latestReviewState).to.equal(
        ReviewStates.keepWorking
      );
    });

    it('renders ReadOnlyReviewState with expected props - awaiting Review', () => {
      const latestFeedback = {
        ...FEEDBACK,
        is_awaiting_teacher_review: true,
      };
      const wrapper = setUp({latestFeedback});
      const reviewState = wrapper.find(ReadOnlyReviewState);
      expect(reviewState).to.have.lengthOf(1);
      expect(reviewState.props().latestReviewState).to.equal(
        ReviewStates.awaitingReview
      );
    });

    it('displays lastUpdated message', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const latestFeedback = {
        created_at: yesterday,
        comment: 'Great!',
      };

      const wrapper = setUp({latestFeedback});
      expect(wrapper.text().includes('Last updated a day ago')).to.be.true;
    });
  });
});
