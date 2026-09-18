import {assert} from 'chai'; // eslint-disable-line no-restricted-imports
import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {UnconnectedAgeDialog as AgeDialog} from '@cdo/apps/templates/AgeDialog';
import i18n from '@cdo/locale';

import FakeStorage from '../../util/FakeStorage';

// MutationObserver callbacks land on a microtask.
const tick = () => new Promise(resolve => setTimeout(resolve, 0));

describe('AgeDialog', () => {
  const defaultProps = {
    signedIn: false,
    turnOffFilter: () => {},
    setOver21: () => {},
    storage: new FakeStorage(),
    unitName: 'csd-2023',
  };

  it('renders null if user is signed in', () => {
    const wrapper = shallow(<AgeDialog {...defaultProps} signedIn={true} />);
    assert.equal(wrapper.children().length, 0);
  });

  it('renders null if dialog was seen before', () => {
    let getItem = jest
      .spyOn(defaultProps.storage, 'getItem')
      .mockClear()
      .mockImplementation();
    getItem.mockImplementation((...args) => {
      if (args[0] === 'ad_anon_over13') {
        return 'true';
      }
    });
    const wrapper = shallow(<AgeDialog {...defaultProps} />);
    assert.equal(wrapper.children().length, 0);
    getItem.mockRestore();
  });

  it('renders a dialog if neither signed in nor seen before', () => {
    const wrapper = shallow(<AgeDialog {...defaultProps} />);
    // The design system Modal is minified in the built component library, so
    // assert on the props we pass it rather than on its component name.
    assert.equal(wrapper.prop('className'), 'age-dialog');
    assert.equal(wrapper.prop('title'), i18n.welcomeToDanceParty());
  });

  it('leaves OK disabled until an age is picked', () => {
    const wrapper = shallow(<AgeDialog {...defaultProps} />);
    assert.isTrue(wrapper.prop('primaryButtonProps').disabled);

    wrapper.prop('customContent').props.onChange({target: {value: '13'}});
    wrapper.update();

    assert.isFalse(wrapper.prop('primaryButtonProps').disabled);
  });

  describe('with a video dialog open', () => {
    afterEach(() => {
      document.body.innerHTML = '';
    });

    it('waits for the video rather than trapping focus behind it', () => {
      document.body.innerHTML = '<div class="video-modal"></div>';
      const wrapper = shallow(<AgeDialog {...defaultProps} />);
      assert.equal(wrapper.children().length, 0);
    });

    it('renders once the video closes', async () => {
      document.body.innerHTML = '<div class="video-modal"></div>';
      const wrapper = shallow(<AgeDialog {...defaultProps} />);
      assert.equal(wrapper.children().length, 0);

      document.body.innerHTML = '';
      await tick();
      wrapper.update();

      assert.equal(wrapper.prop('className'), 'age-dialog');
    });

    it('hides again if a video opens after it mounted', async () => {
      const wrapper = shallow(<AgeDialog {...defaultProps} />);
      assert.equal(wrapper.prop('className'), 'age-dialog');

      document.body.innerHTML = '<div class="video-modal"></div>';
      await tick();
      wrapper.update();

      assert.equal(wrapper.children().length, 0);
    });
  });
});
