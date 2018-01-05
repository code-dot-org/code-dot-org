import {expect} from '../../../util/configuredChai';
import sinon from 'sinon';
import $ from 'jquery';
import React from 'react';
import {mount} from 'enzyme';
import styleConstants from '@cdo/apps/styleConstants';
import Dialog from '@cdo/apps/templates/Dialog';
import UiTips from '@cdo/apps/templates/studioHomepages/UiTips';
import UiTip from '@cdo/apps/templates/studioHomepages/UiTip';

const INITIAL_TIP = {
  type: "initial",
  position: {top: 80, right: 15},
  text: 'Test Initial Tip',
  arrowDirection: "up_corner"
};

const TRIGGERED_TIP = {
  ...INITIAL_TIP,
  type: "triggered",
  triggerId: "logo_home_link",
  text: 'Test Triggered Tip',
};

const TEST_BEFORE_DIALOG = {
  title: 'Test Before Dialog Title'
};

const TEST_AFTER_DIALOG = {
  title: 'Test After Dialog Title'
};

const DEFAULT_PROPS = {
  tips: []
};

// This is the content used to determine mobile vs desktop width in this component.
const MAX_MOBILE_WIDTH = styleConstants['content-width'];

describe('UiTips', () => {
  beforeEach(() => {
    // $(window).width() is used to determine viewport width in this component
    sinon.stub($.fn, 'width')
      // Default to a desktop width for these tests
      .returns(MAX_MOBILE_WIDTH + 1);
  });

  afterEach(() => {
    $.fn.width.restore();
  });

  it('renders empty at mobile width', () => {
    $.fn.width.returns(MAX_MOBILE_WIDTH);
    const wrapper = mount(
      <UiTips
        {...DEFAULT_PROPS}
        tips={[INITIAL_TIP]}
        showInitialTips
      />
    );
    expect(wrapper.find(UiTip)).not.to.exist;
    expect(wrapper).to.containMatchingElement(
      <div/>
    );
  });

  describe('initial state', () => {
    it('renders initial tips if showInitialTips is true', () => {
      const wrapper = mount(
        <UiTips
          {...DEFAULT_PROPS}
          tips={[INITIAL_TIP]}
          showInitialTips
        />
      );
      expect(wrapper.find(UiTip)).to.exist;
      expect(wrapper.find(UiTip)).to.have.prop('text', INITIAL_TIP.text);
    });

    it('does not render initial tips if showInitialTips is false', () => {
      const wrapper = mount(
        <UiTips
          {...DEFAULT_PROPS}
          tips={[INITIAL_TIP]}
          showInitialTips={false}
        />
      );
      expect(wrapper.find(UiTip)).not.to.exist;
    });

    it('does not render triggered tips even if showInitialTips is true', () => {
      const wrapper = mount(
        <UiTips
          {...DEFAULT_PROPS}
          tips={[TRIGGERED_TIP]}
          showInitialTips
        />
      );
      expect(wrapper.find(UiTip)).not.to.exist;
    });

    it('beforeDialog is showing if showInitialTips is true', () => {
      const wrapper = mount(
        <UiTips
          {...DEFAULT_PROPS}
          showInitialTips
          beforeDialog={TEST_BEFORE_DIALOG}
        />
      );
      expect(wrapper.find(Dialog)).to.exist;
      expect(wrapper.find(Dialog)).to.have.prop('title', TEST_BEFORE_DIALOG.title);
      expect(wrapper.find(Dialog)).to.have.prop('isOpen', true);
    });

    it('beforeDialog is not showing if showInitialTips is false', () => {
      const wrapper = mount(
        <UiTips
          {...DEFAULT_PROPS}
          showInitialTips={false}
          beforeDialog={TEST_BEFORE_DIALOG}
        />
      );
      expect(wrapper.find(Dialog)).to.exist;
      expect(wrapper.find(Dialog)).to.have.prop('title', TEST_BEFORE_DIALOG.title);
      expect(wrapper.find(Dialog)).to.have.prop('isOpen', false);
    });

    it('afterDialog is hidden', () => {
      const wrapper = mount(
        <UiTips
          {...DEFAULT_PROPS}
          showInitialTips={false}
          afterDialog={TEST_AFTER_DIALOG}
        />
      );
      expect(wrapper.find(Dialog)).to.exist;
      expect(wrapper.find(Dialog)).to.have.prop('title', TEST_AFTER_DIALOG.title);
      expect(wrapper.find(Dialog)).to.have.prop('isOpen', false);
    });
  });
});
