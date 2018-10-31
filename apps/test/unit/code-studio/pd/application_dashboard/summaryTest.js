import React from 'react';
import {shallow} from 'enzyme';
import {Row} from 'react-bootstrap';
import {Summary} from '@cdo/apps/code-studio/pd/application_dashboard/summary';
import {expect} from 'chai';
import sinon from 'sinon';

describe("Summary", () => {
  const fakeRouter = {
    createHref() {}
  };

  const context = {
    router: fakeRouter
  };

  const regionalPartnerFilter = {value: 1, label: "A Great Organization"};

  const createSummary = () => (shallow(
    <Summary regionalPartnerFilter={regionalPartnerFilter} />,
    { context },
  ));

  it("Initially renders a spinner", () => {
    let summary = createSummary();
    expect(summary.find('Spinner')).to.have.length(1);
  });

  it("Generates 5 tables in 2 rows after hearing from server", () => {
    let server = sinon.fakeServer.create();

    server.respondWith("GET", '/api/v1/pd/applications',
      [
        200,
        {"Content-Type": "application/json"},
        JSON.stringify({
          csf_facilitators: {
            unreviewed: { locked: 0, total: 1 },
            pending: { locked: 0, total: 0 },
            accepted: { locked: 0, total: 0 },
            declined: { locked: 0, total: 0 },
            waitlisted: { locked: 0, total: 0 },
          },
          csd_facilitators: {
            unreviewed: { locked: 0, total: 0 },
            pending: { locked: 0, total: 0 },
            accepted: { locked: 0, total: 0 },
            declined: { locked: 0, total: 0 },
            waitlisted: { locked: 0, total: 0 },
          },
          csp_facilitators: {
            unreviewed: { locked: 0, total: 0 },
            pending: { locked: 0, total: 0 },
            accepted: { locked: 0, total: 0 },
            declined: { locked: 0, total: 0 },
            waitlisted: { locked: 0, total: 0 },
          },
          csd_teachers: {
            unreviewed: { locked: 0, total: 1 },
            pending: { locked: 0, total: 0 },
            waitlisted: { locked: 0, total: 0 },
            declined: { locked: 0, total: 0 },
            accepted_not_notified: { locked: 0, total: 0 },
            accepted_notified_by_partner: { locked: 0, total: 0 },
            accepted_no_cost_registration: { locked: 0, total: 0 },
            registration_sent: { locked: 0, total: 0 },
            paid: { locked: 0, total: 0 },
          },
          csp_teachers: {
            unreviewed: { locked: 0, total: 1 },
            pending: { locked: 0, total: 0 },
            waitlisted: { locked: 0, total: 0 },
            declined: { locked: 0, total: 0 },
            accepted_not_notified: { locked: 0, total: 0 },
            accepted_notified_by_partner: { locked: 0, total: 0 },
            accepted_no_cost_registration: { locked: 0, total: 0 },
            registration_sent: { locked: 0, total: 0 },
            paid: { locked: 0, total: 0 },
          },
        })
      ]
    );

    let summary = createSummary();

    server.respond();
    const rows = summary.find(Row);
    expect(rows).to.have.length(2);
    expect(rows.at(0).children()).to.have.length(3);
    expect(rows.at(1).children()).to.have.length(2);

    expect(summary.find('Spinner')).to.have.length(0);
  });
});
