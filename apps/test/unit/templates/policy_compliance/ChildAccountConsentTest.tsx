import {render, screen} from '@testing-library/react';
import React from 'react';
import sinon, {SinonStub} from 'sinon'; // eslint-disable-line no-restricted-imports

import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import ChildAccountConsent, {
  ChildAccountConsentProps,
} from '@cdo/apps/templates/policy_compliance/ChildAccountConsent';
import i18n from '@cdo/locale';

import {expect} from '../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

describe('ChildAccountConsent', () => {
  let sendEventSpy: SinonStub;
  beforeEach(() => {
    sendEventSpy = sinon.stub(analyticsReporter, 'sendEvent');
  });

  afterEach(() => {
    (analyticsReporter.sendEvent as sinon.SinonStub).restore();
  });

  describe('no parent permission', () => {
    const props: ChildAccountConsentProps = {
      permissionGranted: false,
    };

    beforeEach(() => {
      render(<ChildAccountConsent {...props} />);
    });

    it('shows the link expired message', () => {
      screen.getByText(i18n.childAccountConsentExpiredMessage());
    });

    it('reports expired event', () => {
      expect(sendEventSpy).to.be.calledOnce;
      expect(sendEventSpy).calledWith('CAP Parent Consent Expired');
    });
  });

  describe('has parent permission', () => {
    const permissionGrantedDate = new Date();
    const props: ChildAccountConsentProps = {
      permissionGranted: true,
      permissionGrantedDate: permissionGrantedDate,
      studentId: 12345,
    };
    const dateOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    const grantedDateString = i18n.childAccountConsentValidPermissionGranted({
      date: permissionGrantedDate.toLocaleDateString('en-US', dateOptions),
    });

    beforeEach(() => {
      render(<ChildAccountConsent {...props} />);
    });

    it('shows the thanks message', () => {
      screen.getByText(i18n.childAccountConsentValidPermission());
      screen.getByText(grantedDateString);
    });

    it('reports permission granted event', () => {
      expect(sendEventSpy).to.be.calledOnce;
      expect(sendEventSpy).calledWith('CAP Parent Consent Granted', {
        studentId: props.studentId,
      });
    });
  });
});
