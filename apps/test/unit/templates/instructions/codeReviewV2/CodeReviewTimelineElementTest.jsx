import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import CodeReviewTimelineElement, {
  codeReviewTimelineElementType
} from '@cdo/apps/templates/instructions/codeReviewV2/CodeReviewTimelineElement';
import color from '@cdo/apps/util/color';
import javalabMsg from '@cdo/javalab/locale';

const DEFAULT_PROPS = {
  type: codeReviewTimelineElementType.CREATED,
  isLast: false,
  projectVersionId: 'asdfjkl',
  isProjectVersionExpired: false
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
        type: codeReviewTimelineElementType.CREATED
      });
      const timelineDot = wrapper.find('TimelineDot');
      expect(timelineDot).to.have.length(1);
      expect(timelineDot.props().color).to.equal(color.purple);
    });

    it('displays a bottom line if it is not the last element', () => {
      const wrapper = setUp({
        type: codeReviewTimelineElementType.CREATED,
        isLast: false
      });
      const timelineLine = wrapper.find('TimelineLine');
      expect(timelineLine).to.have.length(1);
    });

    it('hides bottom line if it is the last element', () => {
      const wrapper = setUp({
        type: codeReviewTimelineElementType.CREATED,
        isLast: true
      });
      const timelineLine = wrapper.find('TimelineLine');
      expect(timelineLine).to.have.length(0);
    });

    it('has created text', () => {
      const wrapper = setUp({
        type: codeReviewTimelineElementType.CREATED
      });
      expect(wrapper.contains(javalabMsg.created())).to.be.true;
    });
  });

  describe('Commit', () => {
    it('displays an eyeball link if there is a version and it is not expired', () => {
      const wrapper = setUp({
        type: codeReviewTimelineElementType.COMMIT,
        projectVersionId: 'asdfjkl',
        isProjectVersionExpired: false
      });
      expect(wrapper.find('EyeballLink')).to.have.length(1);
    });

    it('hides eyeball link if there is not a version', () => {
      const wrapper = setUp({
        type: codeReviewTimelineElementType.COMMIT,
        projectVersionId: null
      });
      expect(wrapper.find('EyeballLink')).to.have.length(0);
    });

    it('hides eyeball link if the version is expired', () => {
      const wrapper = setUp({
        type: codeReviewTimelineElementType.COMMIT,
        projectVersionId: 'asdfjkl',
        isProjectVersionExpired: true
      });
      expect(wrapper.find('EyeballLink')).to.have.length(0);
    });

    it('displays a border left on children if it is not the last element', () => {
      const child = <div className="the-child" />;
      const wrapper = setUp(
        {
          type: codeReviewTimelineElementType.COMMIT
        },
        child
      );
      const borderLeft = wrapper
        .find('.the-child')
        .parent()
        .props().style.borderLeft;
      expect(borderLeft).to.equal('3px solid #5b6770');
    });

    it('does not have a border left on children if it is the last element', () => {
      const child = <div className="the-child" />;
      const wrapper = setUp(
        {
          type: codeReviewTimelineElementType.COMMIT,
          isLast: true
        },
        child
      );
      const borderLeft = wrapper
        .find('.the-child')
        .parent()
        .props().style.borderLeft;
      expect(borderLeft).to.equal('none');
    });

    it('displays gray timeline dot with a check', () => {
      const wrapper = setUp({
        type: codeReviewTimelineElementType.COMMIT
      });
      const timelineDot = wrapper.find('TimelineDot');
      expect(timelineDot).to.have.length(1);
      expect(timelineDot.props().color).to.equal(color.dark_charcoal);
      expect(timelineDot.props().hasCheck).to.be.true;
    });
  });

  describe('Code review', () => {
    it('displays an eyeball link if there is a version and it is not expired', () => {
      const wrapper = setUp({
        type: codeReviewTimelineElementType.CODE_REVIEW,
        projectVersionId: 'asdfjkl',
        isProjectVersionExpired: false
      });
      expect(wrapper.find('EyeballLink')).to.have.length(1);
    });

    it('hides eyeball link if there is not a version', () => {
      const wrapper = setUp({
        type: codeReviewTimelineElementType.CODE_REVIEW,
        projectVersionId: null
      });
      expect(wrapper.find('EyeballLink')).to.have.length(0);
    });

    it('hides eyeball link if the version is expired', () => {
      const wrapper = setUp({
        type: codeReviewTimelineElementType.CODE_REVIEW,
        projectVersionId: 'asdfjkl',
        isProjectVersionExpired: true
      });
      expect(wrapper.find('EyeballLink')).to.have.length(0);
    });

    it('displays children', () => {
      const child = <div className="the-child" />;
      const wrapper = setUp(
        {
          type: codeReviewTimelineElementType.COMMIT
        },
        child
      );
      expect(wrapper.find('.the-child')).to.have.length(1);
    });

    it('displays a bottom line if it is not the last', () => {
      const wrapper = setUp({
        type: codeReviewTimelineElementType.CODE_REVIEW,
        isLast: false
      });
      expect(wrapper.find('TimelineLine')).to.have.length(1);
    });

    it('displays no line if it is last', () => {
      const wrapper = setUp({
        type: codeReviewTimelineElementType.CODE_REVIEW,
        isLast: true
      });
      expect(wrapper.find('TimelineLine')).to.have.length(0);
    });
  });
});
