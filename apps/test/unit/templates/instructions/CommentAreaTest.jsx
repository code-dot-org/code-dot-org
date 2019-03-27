import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/configuredChai';
import {UnconnectedCommentArea as CommentArea} from '@cdo/apps/templates/instructions/CommentArea';

const DEFAULT_PROPS = {
  disabledMode: false,
  onCommentChange: () => {},
  comment: 'Good Work!',
  placeholderText: 'Add your comment here'
};

describe('CommentArea', () => {
  it('If displayed mode, textarea is display only', () => {
    const wrapper = shallow(
      <CommentArea {...DEFAULT_PROPS} disabledMode={true} />
    );

    const confirmTextArea = wrapper.find('textarea').at(0);
    expect(confirmTextArea.props().readOnly).to.equal(true);
  });
  it('No comment given, value of textarea is blank', () => {
    const wrapper = shallow(<CommentArea {...DEFAULT_PROPS} comment={''} />);

    const confirmTextArea = wrapper.find('textarea').at(0);
    expect(confirmTextArea.props().value).to.equal('');
  });
  it('Change text', () => {
    // not sure how to do this
    // const wrapper = shallow(<CommentArea {...DEFAULT_PROPS} comment={''} />);
  });
});
