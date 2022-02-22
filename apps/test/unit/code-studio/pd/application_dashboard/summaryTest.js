import React from 'react';
import {shallow} from 'enzyme';
import {Row} from 'react-bootstrap';
import {
  Summary,
  removeIncompleteApplications
} from '@cdo/apps/code-studio/pd/application_dashboard/summary';
import {expect} from 'chai';
import sinon from 'sinon';

describe('Summary', () => {
  const data = {
    csd_teachers: {
      unreviewed: {locked: 0, total: 2},
      incomplete: {locked: 0, total: 0},
      reopened: {locked: 0, total: 0},
      pending: {locked: 0, total: 0},
      waitlisted: {locked: 0, total: 0},
      declined: {locked: 0, total: 0},
      accepted_not_notified: {locked: 0, total: 0},
      accepted_notified_by_partner: {locked: 0, total: 0},
      accepted_no_cost_registration: {locked: 0, total: 0},
      registration_sent: {locked: 0, total: 0},
      paid: {locked: 0, total: 0}
    },
    csp_teachers: {
      unreviewed: {locked: 0, total: 2},
      incomplete: {locked: 0, total: 0},
      reopened: {locked: 0, total: 0},
      pending: {locked: 0, total: 0},
      waitlisted: {locked: 0, total: 0},
      declined: {locked: 0, total: 0},
      accepted_not_notified: {locked: 0, total: 0},
      accepted_notified_by_partner: {locked: 0, total: 0},
      accepted_no_cost_registration: {locked: 0, total: 0},
      registration_sent: {locked: 0, total: 0},
      paid: {locked: 0, total: 0}
    },
    csa_teachers: {
      unreviewed: {locked: 0, total: 2},
      incomplete: {locked: 0, total: 0},
      reopened: {locked: 0, total: 0},
      pending: {locked: 0, total: 0},
      waitlisted: {locked: 0, total: 0},
      declined: {locked: 0, total: 0},
      accepted_not_notified: {locked: 0, total: 0},
      accepted_notified_by_partner: {locked: 0, total: 0},
      accepted_no_cost_registration: {locked: 0, total: 0},
      registration_sent: {locked: 0, total: 0},
      paid: {locked: 0, total: 0}
    }
  };

  const fakeRouter = {
    createHref() {}
  };

  const context = {
    router: fakeRouter
  };

  const regionalPartnerFilter = {value: 1, label: 'A Great Organization'};

  const createSummary = () =>
    shallow(<Summary regionalPartnerFilter={regionalPartnerFilter} />, {
      context
    });

  it('Initially renders a spinner', () => {
    let summary = createSummary();
    expect(summary.find('Spinner')).to.have.length(1);
  });

  it('Generates 3 tables in 1 rows after hearing from server', () => {
    let server = sinon.fakeServer.create();

    server.respondWith('GET', '/api/v1/pd/applications', [
      200,
      {'Content-Type': 'application/json'},
      JSON.stringify(data)
    ]);

    let summary = createSummary();

    server.respond();
    summary.update();
    const rows = summary.find(Row);
    expect(rows).to.have.length(1);
    expect(rows.at(0).children()).to.have.length(3);

    expect(summary.find('Spinner')).to.have.length(0);

    server.restore();
  });

  it('removeIncompleteApplications strips incomplete applications from data', () => {
    expect(removeIncompleteApplications(data)).to.deep.equal({
      csd_teachers: {
        unreviewed: {locked: 0, total: 2},
        reopened: {locked: 0, total: 0},
        pending: {locked: 0, total: 0},
        waitlisted: {locked: 0, total: 0},
        declined: {locked: 0, total: 0},
        accepted_not_notified: {locked: 0, total: 0},
        accepted_notified_by_partner: {locked: 0, total: 0},
        accepted_no_cost_registration: {locked: 0, total: 0},
        registration_sent: {locked: 0, total: 0},
        paid: {locked: 0, total: 0}
      },
      csp_teachers: {
        unreviewed: {locked: 0, total: 2},
        reopened: {locked: 0, total: 0},
        pending: {locked: 0, total: 0},
        waitlisted: {locked: 0, total: 0},
        declined: {locked: 0, total: 0},
        accepted_not_notified: {locked: 0, total: 0},
        accepted_notified_by_partner: {locked: 0, total: 0},
        accepted_no_cost_registration: {locked: 0, total: 0},
        registration_sent: {locked: 0, total: 0},
        paid: {locked: 0, total: 0}
      },
      csa_teachers: {
        unreviewed: {locked: 0, total: 2},
        reopened: {locked: 0, total: 0},
        pending: {locked: 0, total: 0},
        waitlisted: {locked: 0, total: 0},
        declined: {locked: 0, total: 0},
        accepted_not_notified: {locked: 0, total: 0},
        accepted_notified_by_partner: {locked: 0, total: 0},
        accepted_no_cost_registration: {locked: 0, total: 0},
        registration_sent: {locked: 0, total: 0},
        paid: {locked: 0, total: 0}
      }
    });
  });
});
