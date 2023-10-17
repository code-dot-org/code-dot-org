import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../util/reconfiguredChai';
import sinon from 'sinon';
import {UnconnectedEndOfLessonDialog as EndOfLessonDialog} from '@cdo/apps/templates/EndOfLessonDialog';
import Button from '@cdo/apps/templates/Button';

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
      expect(wrapper.contains('You finished Lesson 2!')).to.be.true;
    });

    it('displays expected message', () => {
      expect(
        wrapper.contains('Check in with your teacher for the next activity.')
      ).to.be.true;
    });
  });

  it('scrolls summary progress row into view when dismissed and isSummaryView = true', () => {
    const scrollIntoViewSpy = sinon.spy();

    sinon
      .stub(document, 'getElementById')
      .withArgs('summary-progress-row-2')
      .returns({scrollIntoView: scrollIntoViewSpy});

    const wrapper = setUp({isSummaryView: true});
    wrapper.find(Button).simulate('click');
    expect(scrollIntoViewSpy).to.have.been.called;

    document.getElementById.restore();
  });

  it('scrolls progress lesson into view when dismissed and isSummaryView = false', () => {
    const scrollIntoViewSpy = sinon.spy();

    sinon
      .stub(document, 'getElementById')
      .withArgs('progress-lesson-2')
      .returns({scrollIntoView: scrollIntoViewSpy});

    const wrapper = setUp({isSummaryView: false});
    wrapper.find(Button).simulate('click');
    expect(scrollIntoViewSpy).to.have.been.called;

    document.getElementById.restore();
  });
});
