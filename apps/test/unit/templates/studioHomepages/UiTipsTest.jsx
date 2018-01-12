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
  title: 'Test After Dialog Title',
  onConfirm: {}
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

    // Happy to ignore API calls in this test
    sinon.stub($, 'post');
  });

  afterEach(() => {
    $.post.restore();
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

  describe('triggered tips', () => {
    let targetElement;

    beforeEach(() => {
      targetElement = document.createElement('div');
      targetElement.id = TRIGGERED_TIP.triggerId;
      document.body.appendChild(targetElement);
    });

    afterEach(() => {
      document.body.removeChild(targetElement);
      targetElement = null;
    });

    it('show when the target element is clicked', () => {
      const wrapper = mount(
        <UiTips
          {...DEFAULT_PROPS}
          tips={[TRIGGERED_TIP]}
        />
      );
      expect(wrapper.find(UiTip)).not.to.exist;

      // Click the target element
      $(targetElement).click();
      expect(wrapper.find(UiTip)).to.exist;
      expect(wrapper.find(UiTip)).to.have.prop('text', TRIGGERED_TIP.text);
    });

    it('unless showInitialTips is true', () => {
      const wrapper = mount(
        <UiTips
          {...DEFAULT_PROPS}
          tips={[TRIGGERED_TIP]}
          showInitialTips={true}
        />
      );
      expect(wrapper.find(UiTip)).not.to.exist;

      // Click the target element
      $(targetElement).click();
      expect(wrapper.find(UiTip)).not.to.exist;
    });

    it('in which case it can be triggered after all initial tips are closed', () => {
      const wrapper = mount(
        <UiTips
          {...DEFAULT_PROPS}
          tips={[INITIAL_TIP, INITIAL_TIP, TRIGGERED_TIP]}
          showInitialTips={true}
        />
      );
      expect(wrapper.find(UiTip)).to.have.length(2);
      wrapper.find(UiTip).forEach(tip => expect(tip).to.have.prop('text', INITIAL_TIP.text));

      // Click the target element
      // Expect nothing to happen, initial tips are still open
      $(targetElement).click();
      expect(wrapper.find(UiTip)).to.have.length(2);
      wrapper.find(UiTip).forEach(tip => expect(tip).to.have.prop('text', INITIAL_TIP.text));

      // Close one of the initial tips
      const firstTip = wrapper.find(UiTip).first();
      firstTip.prop('closeClicked')(firstTip.prop('index'));
      expect(wrapper.find(UiTip)).to.have.length(1);
      expect(wrapper.find(UiTip)).to.have.prop('text', INITIAL_TIP.text);

      // Click the target element
      // Still nothing happens, one initial tip is still open
      $(targetElement).click();
      expect(wrapper.find(UiTip)).to.have.length(1);
      expect(wrapper.find(UiTip)).to.have.prop('text', INITIAL_TIP.text);

      // Close the other initial tip
      const secondTip = wrapper.find(UiTip).first();
      secondTip.prop('closeClicked')(secondTip.prop('index'));
      expect(wrapper.find(UiTip)).not.to.exist;

      // This time when we click the target element, the triggered tip opens
      $(targetElement).click();
      expect(wrapper.find(UiTip)).to.have.length(1);
      expect(wrapper.find(UiTip)).to.have.prop('text', TRIGGERED_TIP.text);

      // Close the triggered tip
      const triggeredTip = wrapper.find(UiTip).first();
      triggeredTip.prop('closeClicked')(triggeredTip.prop('index'));
      expect(wrapper.find(UiTip)).not.to.exist;
    });

    it('can be shown again after closing', () => {
      const wrapper = mount(
        <UiTips
          {...DEFAULT_PROPS}
          tips={[TRIGGERED_TIP]}
        />
      );
      expect(wrapper.find(UiTip)).not.to.exist;

      // Click the target element
      $(targetElement).click();
      expect(wrapper.find(UiTip)).to.exist;
      expect(wrapper.find(UiTip)).to.have.prop('text', TRIGGERED_TIP.text);

      // Close the triggered tip
      const triggeredTip = wrapper.find(UiTip).first();
      triggeredTip.prop('closeClicked')(triggeredTip.prop('index'));
      expect(wrapper.find(UiTip)).not.to.exist;

      // Click the target element again
      $(targetElement).click();
      expect(wrapper.find(UiTip)).to.exist;
      expect(wrapper.find(UiTip)).to.have.prop('text', TRIGGERED_TIP.text);
    });
  });

  describe('beforeDialog', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = mount(
        <UiTips
          {...DEFAULT_PROPS}
          tips={[INITIAL_TIP, TRIGGERED_TIP]}
          showInitialTips
          beforeDialog={TEST_BEFORE_DIALOG}
        />
      );
    });

    it('delays appearance of initial tips', () => {
      expect(wrapper.find(Dialog)).to.exist.and.to.have.prop('isOpen', true);
      expect(wrapper.find(UiTip)).not.to.exist;
    });

    it('only initial tips appear when beforeDialog is confirmed', () => {
      wrapper.instance().beforeDialogConfirm();
      expect(wrapper.find(Dialog)).to.have.prop('isOpen', false);
      expect(wrapper.find(UiTip)).to.exist
        .and.to.have.length(1)
        .and.to.have.prop('text', INITIAL_TIP.text);
    });

    it('initial tips are skipped when beforeDialog is canceled', () => {
      wrapper.instance().beforeDialogCancel();
      expect(wrapper.find(Dialog)).to.have.prop('isOpen', false);
      expect(wrapper.find(UiTip)).not.to.exist;
    });
  });

  describe('afterDialog', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = mount(
        <UiTips
          {...DEFAULT_PROPS}
          tips={[INITIAL_TIP, TRIGGERED_TIP]}
          showInitialTips
          afterDialog={TEST_AFTER_DIALOG}
        />
      );
    });

    it('appears after initial tips are closed', () => {
      expect(wrapper.find(Dialog)).to.exist.and.to.have.prop('isOpen', false);
      expect(wrapper.find(UiTip)).to.exist
        .and.to.have.length(1)
        .and.to.have.prop('text', INITIAL_TIP.text);

      // Close one of the initial tips
      const firstTip = wrapper.find(UiTip).first();
      firstTip.prop('closeClicked')(firstTip.prop('index'));

      expect(wrapper.find(Dialog)).to.have.prop('isOpen', true);
      expect(wrapper.find(UiTip)).not.to.exist;
    });

    it('closes on confirm', () => {
      // Close the tooltip to show the dialog
      const firstTip = wrapper.find(UiTip).first();
      firstTip.prop('closeClicked')(firstTip.prop('index'));

      wrapper.instance().afterDialogConfirm();
      expect(wrapper.find(Dialog)).to.have.prop('isOpen', false);
    });

    it('closes on cancel', () => {
      // Close the tooltip to show the dialog
      const firstTip = wrapper.find(UiTip).first();
      firstTip.prop('closeClicked')(firstTip.prop('index'));

      wrapper.instance().afterDialogCancel();
      expect(wrapper.find(Dialog)).to.have.prop('isOpen', false);
    });
  });
});
