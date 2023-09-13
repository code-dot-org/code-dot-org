import {assert} from 'chai';
import React from 'react';
import {
  UnconnectedAgeDialog as AgeDialog,
  AGE_DIALOG_SESSION_KEY,
  SONG_FILTER_SESSION_KEY,
  getFilterStatus,
} from '@cdo/apps/templates/AgeDialog';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import FakeStorage from '../../util/FakeStorage';

describe('AgeDialog', () => {
  const defaultProps = {
    signedIn: false,
    turnOffFilter: () => {},
    storage: new FakeStorage(),
  };

  it('renders null if user is signed in', () => {
    const wrapper = shallow(<AgeDialog {...defaultProps} signedIn={true} />);
    assert.equal(wrapper.children().length, 0);
  });

  it('renders null if dialog was seen before', () => {
    let getItem = sinon.stub(defaultProps.storage, 'getItem');
    getItem.withArgs(AGE_DIALOG_SESSION_KEY).returns('true');
    const wrapper = shallow(<AgeDialog {...defaultProps} />);
    assert.equal(wrapper.children().length, 0);
    getItem.restore();
  });

  it('renders a dialog if neither signed in nor seen before', () => {
    const wrapper = shallow(<AgeDialog {...defaultProps} />);
    assert.equal(wrapper.name(), 'BaseDialog');
  });

  describe('getFilterStatus', () => {
    let getItem;

    beforeEach(() => {
      getItem = sinon.stub(sessionStorage, 'getItem');
    });

    afterEach(() => {
      getItem.restore();
    });

    it('returns true if the song filter is on', () => {
      getItem.withArgs(SONG_FILTER_SESSION_KEY).returns('true');
      assert.isTrue(getFilterStatus('student', true));
    });

    it('checks age dialog session key if user type is unknown', () => {
      getItem.withArgs(SONG_FILTER_SESSION_KEY).returns('false');

      getItem.withArgs(AGE_DIALOG_SESSION_KEY).returns('true');
      assert.isFalse(getFilterStatus('unknown', false));

      getItem.withArgs(AGE_DIALOG_SESSION_KEY).returns('false');
      assert.isTrue(getFilterStatus('unknown', false));
    });

    it('defaults to under13 value if user is signed in', () => {
      getItem.withArgs(SONG_FILTER_SESSION_KEY).returns('false');

      assert.isTrue(getFilterStatus('teacher', true));
      assert.isFalse(getFilterStatus('student', false));
    });
  });
});
