import React from 'react';
import {shallow} from 'enzyme';
import {Row} from 'react-bootstrap';
import {Summary} from '@cdo/apps/code-studio/pd/application_dashboard/summary';
import {dataByStatus} from '@cdo/apps/code-studio/pd/application_dashboard/applicationDashboardHelper';
import {expect} from 'chai';
import sinon from 'sinon';

describe('Summary', () => {
  const data = {
    csd_teachers: {
      ...dataByStatus
    },
    csp_teachers: {
      ...dataByStatus
    },
    csa_teachers: {
      ...dataByStatus
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
});
