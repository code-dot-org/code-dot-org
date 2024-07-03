import { shallow } from 'enzyme';
import React from 'react';
import {Row} from 'react-bootstrap'; // eslint-disable-line no-restricted-imports

import {
  Summary,
  removeIncompleteApplications,
} from '@cdo/apps/code-studio/pd/application_dashboard/summary';

describe('Summary', () => {
  const dataWithoutIncompleteApps = {
    reopened: {locked: 0, total: 0},
    awaiting_admin_approval: {locked: 0, total: 0},
    unreviewed: {locked: 0, total: 0},
    pending: {locked: 0, total: 0},
    pending_space_availability: {locked: 0, total: 0},
    accepted: {locked: 0, total: 0},
    declined: {locked: 0, total: 0},
    withdrawn: {locked: 0, total: 0},
  };

  const data = {
    csd_teachers: {
      ...dataWithoutIncompleteApps,
      incomplete: {locked: 0, total: 0},
    },
    csp_teachers: {
      ...dataWithoutIncompleteApps,
      incomplete: {locked: 0, total: 0},
    },
    csa_teachers: {
      ...dataWithoutIncompleteApps,
      incomplete: {locked: 0, total: 0},
    },
  };

  const fakeRouter = {
    createHref() {},
  };

  const context = {
    router: fakeRouter,
  };

  const regionalPartnerFilter = {value: 1, label: 'A Great Organization'};

  const createSummary = () =>
    shallow(<Summary regionalPartnerFilter={regionalPartnerFilter} />, {
      context,
    });

  it('Initially renders a spinner', () => {
    let summary = createSummary();
    expect(summary.find('Spinner')).toHaveLength(1);
  });

  it('Generates 3 tables in 1 rows after hearing from server', () => {
    let server = sinon.fakeServer.create();

    server.respondWith(
      'GET',
      '/api/v1/pd/applications?regional_partner_value=1',
      [200, {'Content-Type': 'application/json'}, JSON.stringify(data)]
    );

    let summary = createSummary();

    server.respond();
    summary.update();

    const rows = summary.find(Row);
    expect(rows).toHaveLength(1);
    expect(rows.at(0).children()).toHaveLength(3);

    expect(summary.find('Spinner')).toHaveLength(0);

    server.mockRestore();
  });

  it('removeIncompleteApplications strips incomplete applications from data', () => {
    expect(removeIncompleteApplications(data)).toEqual({
      csd_teachers: {
        ...dataWithoutIncompleteApps,
      },
      csp_teachers: {
        ...dataWithoutIncompleteApps,
      },
      csa_teachers: {
        ...dataWithoutIncompleteApps,
      },
    });
  });
});
