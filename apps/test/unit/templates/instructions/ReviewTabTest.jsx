import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import {Factory} from 'rosie';
import './codeReview/CodeReviewTestHelper';
import ReviewTab from '@cdo/apps/templates/instructions/ReviewTab';

const DEFAULT_COMMENT = Factory.build('CodeReviewComment');

describe('Code Review Tab', () => {
  it('shows new comment after one is created', () => {
    const wrapper = shallow(
      <ReviewTab comments={[DEFAULT_COMMENT]} token="xyz" />
    );

    expect(wrapper.state().comments).to.have.lengthOf(1);
    wrapper.instance().onNewCommentSubmit(DEFAULT_COMMENT);
    expect(wrapper.state().comments).to.have.lengthOf(2);
  });
});
