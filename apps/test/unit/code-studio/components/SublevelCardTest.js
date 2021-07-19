import React from 'react';
import {mount} from 'enzyme';
import {assert, expect} from '../../../util/reconfiguredChai';
import SublevelCard from '@cdo/apps/code-studio/components/SublevelCard';
import {ReviewStates} from '@cdo/apps/templates/feedback/types';
import ProgressBubble from '@cdo/apps/templates/progress/ProgressBubble';

const DEFAULT_SUBLEVEL = {
  id: '1',
  display_name: 'Choice 1',
  description: 'Sublevel 1 is lots of fun',
  thumbnail_url: 'some-fake.url/kittens.png',
  url: '/s/script/lessons/1/levels/2/sublevel/1',
  position: 1,
  letter: 'a',
  perfect: true,
  status: 'perfect',
  teacher_feedback_review_state: ReviewStates.keepWorking
};

const setUp = (isLessonExtra = false, overrideSublevel = {}) => {
  const props = {
    isLessonExtra: isLessonExtra,
    sublevel: {...DEFAULT_SUBLEVEL, ...overrideSublevel}
  };
  return mount(<SublevelCard {...props} />);
};

describe('SublevelCard', () => {
  it('renders level information', () => {
    const wrapper = setUp();
    assert.equal(
      DEFAULT_SUBLEVEL.display_name,
      wrapper.find('.sublevel-card-title-uitest').text()
    );
    assert.equal(
      DEFAULT_SUBLEVEL.description,
      wrapper.find('.sublevel-card-description-uitest').text()
    );
  });

  it('renders sublevel thumbnail if present', () => {
    const wrapper = setUp();
    const thumbnails = wrapper.find('img');
    assert.equal(1, thumbnails.length);
    assert(
      thumbnails
        .at(0)
        .getDOMNode()
        .src.includes(DEFAULT_SUBLEVEL.thumbnail_url)
    );
  });

  it('renders progress bubbles for sublevels', () => {
    const wrapper = setUp();
    const bubbles = wrapper.find('ProgressBubble');
    assert.equal(1, bubbles.length);
    assert.equal('perfect', bubbles.at(0).props().level.status);
  });

  it('renders a placeholder div if sublevel thumbnail is not present', () => {
    const wrapper = setUp(false, {thumbnail_url: null});
    const placeholderThumbnails = wrapper.find('.placeholder');
    assert.equal(1, placeholderThumbnails.length);
  });

  it('renders flag bubble for lesson extras level', () => {
    const wrapper = setUp(true);
    assert.equal(1, wrapper.find('LessonExtrasFlagIcon').length);
    assert.equal(
      DEFAULT_SUBLEVEL.display_name,
      wrapper.find('.sublevel-card-title-uitest').text()
    );
    assert.equal(
      DEFAULT_SUBLEVEL.description,
      wrapper.find('.sublevel-card-description-uitest').text()
    );
  });

  it('maps sublevel keys to camelcase before passing to ProgressBubble', () => {
    const wrapper = setUp();
    const progressBubbleLevel = wrapper.find(ProgressBubble).props().level;
    expect(progressBubbleLevel.teacherFeedbackReviewState).to.equal(
      ReviewStates.keepWorking
    );
  });
});
