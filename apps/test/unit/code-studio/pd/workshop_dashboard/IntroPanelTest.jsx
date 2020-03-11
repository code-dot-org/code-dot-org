import React from 'react';
import {shallow} from 'enzyme';
import {assert} from 'chai';
import sinon from 'sinon';
import {Factory} from 'rosie';
import './workshopFactory';
import IntroPanel from '@cdo/apps/code-studio/pd/workshop_dashboard/IntroPanel';

describe('IntroPanel', () => {
  let server, loadWorkshop;

  beforeEach(() => {
    server = sinon.createFakeServer();
    loadWorkshop = sinon.spy();
  });

  afterEach(() => {
    server.restore();
    server = null;
  });

  describe('when workshop is not started', () => {
    const workshopState = 'Not Started';

    it('start the workshop', () => {
      const wrapper = shallowIntroPanel({workshopState, workshopId: 1});

      // Click the start workshop button to show the confirmation dialog
      wrapper.instance().handleStartWorkshopClick();
      wrapper.update();
      assert.isTrue(wrapper.state('showStartWorkshopConfirmation'));

      // Confirm starting the workshop
      wrapper.instance().handleStartWorkshopConfirmed();

      // Handle the AJAX request
      server.respondWith('POST', `/api/v1/pd/workshops/1/start`, [204, {}, '']);
      server.respond();
      wrapper.update();

      // The dialog should be closed and we should have called for a workshop refresh
      assert.isFalse(wrapper.state('showStartWorkshopConfirmation'));
      assert(loadWorkshop.calledOnce);
    });

    it('begin to start the workshop, then change your mind', () => {
      const wrapper = shallowIntroPanel({workshopState});

      // Click the start workshop button to show the confirmation dialog
      wrapper.instance().handleStartWorkshopClick();
      wrapper.update();
      assert.isTrue(wrapper.state('showStartWorkshopConfirmation'));

      // Click the cancel button to close the dialog
      wrapper.instance().handleStartWorkshopCancel();
      wrapper.update();
      assert.isFalse(wrapper.state('showStartWorkshopConfirmation'));
    });

    it('for admin', () => {
      shallowIntroPanel({
        workshopState,
        isWorkshopAdmin: true
      });
    });
  });

  describe('when workshop is in progress', () => {
    const workshopState = 'In Progress';

    it('and account is not required for attendance', () => {
      shallowIntroPanel({
        workshopState,
        isAccountRequiredForAttendance: true
      });
    });

    it('and account is required for attendance', () => {
      shallowIntroPanel({
        workshopState,
        isAccountRequiredForAttendance: false
      });
    });

    it('unstart the workshop', () => {
      const wrapper = shallowIntroPanel({
        workshopState,
        workshopId: 1,
        isWorkshopAdmin: true
      });

      // Click the Unstart button to show the confirmation dialog
      wrapper.instance().handleAdminActionClick('unstart');
      wrapper.update();
      assert.equal('unstart', wrapper.state('pendingAdminAction'));

      // Confirm unstarting the workshop
      wrapper.instance().handleAdminActionConfirmed();
      wrapper.update();
      assert.isNull(wrapper.state('pendingAdminAction'));

      // Handle the AJAX request
      server.respondWith('POST', `/api/v1/pd/workshops/1/Unstart`, [
        204,
        {},
        ''
      ]);
      server.respond();
      wrapper.update();

      // The dialog should be closed and we should have called for a workshop refresh
      assert(loadWorkshop.calledOnce);
    });

    it('begin to unstart the workshop, then change your mind', () => {
      const wrapper = shallowIntroPanel({workshopState, isWorkshopAdmin: true});

      // Click the Unstart button to show the confirmation dialog
      wrapper.instance().handleAdminActionClick('unstart');
      wrapper.update();
      assert.equal('unstart', wrapper.state('pendingAdminAction'));

      // Click the cancel button to close the dialog
      wrapper.instance().handleAdminActionCancel();
      wrapper.update();
      assert.isNull(wrapper.state('pendingAdminAction'));
    });
  });

  describe('when workshop is ended', () => {
    const workshopState = 'Ended';
    it('for non-admin', () => {
      shallowIntroPanel({
        workshopState
      });
    });

    it('for admin', () => {
      shallowIntroPanel({
        workshopState,
        isWorkshopAdmin: true
      });
    });
  });

  function shallowIntroPanel(props = {}) {
    return shallow(
      <IntroPanel
        workshopState="Not Started"
        sessions={Factory.buildList('session', 1)}
        loadWorkshop={loadWorkshop}
        {...props}
      />
    );
  }
});
