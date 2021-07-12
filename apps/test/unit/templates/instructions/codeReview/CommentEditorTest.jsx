import React from 'react';
import {shallow} from 'enzyme';
import {
  stubRedux,
  restoreRedux,
  getStore,
  registerReducers
} from '@cdo/apps/redux';
import {setPageConstants} from '@cdo/apps/redux/pageConstants';
import commonReducers from '@cdo/apps/redux/commonReducers';
import {expect} from '../../../../util/reconfiguredChai';
import sinon from 'sinon';
import {Factory} from 'rosie';
import './CodeReviewTestHelper';
import CommentEditor from '@cdo/apps/templates/instructions/codeReview/CommentEditor';
import Button from '@cdo/apps/templates/Button';

const DEFAULT_PROPS = {
  onNewCommentSubmit: () => {},
  token: 'abcxyz'
};

describe('Code Review Comment Editor', () => {
  let wrapper;

  beforeEach(() => {
    stubRedux();
    wrapper = shallow(<CommentEditor {...DEFAULT_PROPS} />);
  });

  afterEach(() => {
    restoreRedux();
  });

  it('does not show submit and cancel buttons initially', () => {
    expect(wrapper.find(Button)).to.have.lengthOf(0);
  });

  it('shows submit and cancel buttons once user starts typing', () => {
    expect(wrapper.find(Button)).to.have.lengthOf(0);
    wrapper
      .find('textarea')
      .first()
      .simulate('change', {target: {value: 'a comment'}});
    expect(wrapper.find(Button)).to.have.lengthOf(2);
  });

  it('hides submit and cancel buttons and clears textbox if user hits cancel button', () => {
    const commentTextarea = wrapper.find('textarea').first();
    commentTextarea.simulate('change', {target: {value: 'a comment'}});

    expect(wrapper.find(Button)).to.have.lengthOf(2);
    expect(wrapper.state().comment).to.equal('a comment');

    wrapper
      .find(Button)
      .first()
      .simulate('click');

    expect(wrapper.find(Button)).to.have.lengthOf(0);
    expect(wrapper.state().comment).to.equal('');
  });

  it('submits request and calls appropriate event handler on submit', () => {
    registerReducers(commonReducers);
    getStore().dispatch(
      setPageConstants({
        channelId: 'test123'
      })
    );

    const server = sinon.fakeServer.create();
    server.respondWith('POST', '/code_review_comments', [
      200,
      {'Content-Type': 'application/json'},
      JSON.stringify(Factory.build('CodeReviewComment'))
    ]);

    const spyOnSubmit = sinon.spy();
    const overrideProps = {onNewCommentSubmit: spyOnSubmit};
    const combinedProps = {...DEFAULT_PROPS, ...overrideProps};
    wrapper = shallow(<CommentEditor {...combinedProps} />);

    wrapper
      .find('textarea')
      .first()
      .simulate('change', {target: {value: 'a comment'}});

    wrapper
      .find(Button)
      .at(1)
      .simulate('click');

    server.respond();
    expect(spyOnSubmit.called).to.equal(true);
  });
});
