import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import Comment from '@cdo/apps/templates/instructions/teacherFeedback/Comment';

const DEFAULT_PROPS = {
  isEditable: true,
  onCommentChange: () => {},
  comment: 'Good Work!',
  placeholderText: 'Add your comment here',
};

describe('Comment', () => {
  it('has a display only textarea isEditable is false', () => {
    const wrapper = shallow(<Comment {...DEFAULT_PROPS} isEditable={false} />);

    const confirmTextArea = wrapper.find('textarea').first();
    expect(confirmTextArea.props().readOnly).toBe(true);
  });

  it('has a textarea with value of empty string if no comment is given', () => {
    const wrapper = shallow(<Comment {...DEFAULT_PROPS} comment={''} />);

    const confirmTextArea = wrapper.find('textarea').first();
    expect(confirmTextArea.props().value).toBe('');
  });

  it('updates the text in the comment area', () => {
    const spy = jest.fn();
    const wrapper = shallow(
      <Comment {...DEFAULT_PROPS} comment={''} onCommentChange={spy} />
    );
    expect(spy).not.toHaveBeenCalled();

    wrapper
      .find('textarea')
      .first()
      .simulate('change', {target: {value: 'You did great work'}});
    expect(spy).toHaveBeenCalledWith('You did great work');
  });
});
