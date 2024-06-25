import {shallow, ShallowWrapper} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import sinon, {SinonStub} from 'sinon';

import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import ChildAccountConsent, {
  ChildAccountConsentProps,
} from '@cdo/apps/templates/policy_compliance/ChildAccountConsent';

import {expect} from '../../../util/reconfiguredChai';

const createChildAccountConsent = (props: ChildAccountConsentProps) => {
  return shallow(<ChildAccountConsent {...props} />);
};

describe('ChildAccountConsent', () => {
  let sendEventSpy: SinonStub;
  beforeEach(() => {
    sendEventSpy = sinon.stub(analyticsReporter, 'sendEvent');
  });

  afterEach(() => {
    analyticsReporter.sendEvent.restore();
  });

  context('no parent permission', () => {
    const props: ChildAccountConsentProps = {
      permissionGranted: false,
    };
    let childAccountConsent: ShallowWrapper;

    beforeEach(() => {
      childAccountConsent = createChildAccountConsent(props);
    });

    it('shows the link expired message', () => {
      expect(
        childAccountConsent.find('#expired_token_container')
      ).to.have.lengthOf(1);
    });

    it('reports expired event', () => {
      expect(sendEventSpy).to.be.calledOnce;
      expect(sendEventSpy).calledWith('CAP Parent Consent Expired');
    });
  });

  context('has parent permission', () => {
    const props: ChildAccountConsentProps = {
      permissionGranted: true,
      permissionGrantedDate: new Date(),
      studentId: 12345,
    };
    let childAccountConsent: ShallowWrapper;

    beforeEach(() => {
      childAccountConsent = createChildAccountConsent(props);
    });

    it('shows the thanks message', () => {
      expect(
        childAccountConsent.find('#permission_granted_container')
      ).to.have.lengthOf(1);
    });

    it('reports permission granted event', () => {
      expect(sendEventSpy).to.be.calledOnce;
      expect(sendEventSpy).calledWith('CAP Parent Consent Granted', {
        studentId: props.studentId,
      });
    });
  });
});
