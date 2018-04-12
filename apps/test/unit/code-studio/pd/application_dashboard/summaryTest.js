import React from 'react';
import {shallow} from 'enzyme';
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

  const regionalPartnerFilter = {value: "1", label: "A Great Organization"};

  const createSummary = () => (shallow(
    <Summary regionalPartnerFilter={regionalPartnerFilter} />,
    { context },
  ));

  it("Initially renders a spinner", () => {
    let summary = createSummary();
    expect(summary.find('Spinner')).to.have.length(1);
  });

  it("Generates 5 tables after hearing from server", () => {
    let server = sinon.fakeServer.create();

    server.respondWith("GET", '/api/v1/pd/applications',
      [
        200,
        {"Content-Type": "application/json"},
        JSON.stringify({
          csf_facilitators: {
            unreviewed: { locked: 0, unlocked: 1 },
            pending: { locked: 0, unlocked: 0 },
            accepted: { locked: 0, unlocked: 0 },
            declined: { locked: 0, unlocked: 0 },
            waitlisted: { locked: 0, unlocked: 0 },
          },
          csd_facilitators: {
            unreviewed: { locked: 0, unlocked: 0 },
            pending: { locked: 0, unlocked: 0 },
            accepted: { locked: 0, unlocked: 0 },
            declined: { locked: 0, unlocked: 0 },
            waitlisted: { locked: 0, unlocked: 0 },
          },
          csp_facilitators: {
            unreviewed: { locked: 0, unlocked: 0 },
            pending: { locked: 0, unlocked: 0 },
            accepted: { locked: 0, unlocked: 0 },
            declined: { locked: 0, unlocked: 0 },
            waitlisted: { locked: 0, unlocked: 0 },
          },
          csd_teachers: {
            unreviewed: { locked: 0, unlocked: 1 },
            pending: { locked: 0, unlocked: 0 },
            accepted: { locked: 0, unlocked: 0 },
            declined: { locked: 0, unlocked: 0 },
            waitlisted: { locked: 0, unlocked: 0 },
          },
          csp_teachers: {
            unreviewed: { locked: 1, unlocked: 1 },
            pending: { locked: 0, unlocked: 0 },
            accepted: { locked: 0, unlocked: 0 },
            declined: { locked: 0, unlocked: 0 },
            waitlisted: { locked: 0, unlocked: 0 },
          },
        })
      ]
    );

    let summary = createSummary();

    server.respond();
    expect(summary.find('.row').children()).to.have.length(5);
    expect(summary.find('Spinner')).to.have.length(0);
  });
});
