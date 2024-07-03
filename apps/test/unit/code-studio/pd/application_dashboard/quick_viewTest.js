import { shallow } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import {QuickView} from '@cdo/apps/code-studio/pd/application_dashboard/quick_view';
import QuickViewTable from '@cdo/apps/code-studio/pd/application_dashboard/quick_view_table';

describe('Quick View', () => {
  const fakeRouter = {
    createHref() {},
  };

  const context = {
    router: fakeRouter,
  };

  const routeProps = {
    path: 'csf_facilitators',
    applicationType: 'CSF Facilitators',
    role: 'csf_facilitators',
  };

  const regionalPartnerFilter = {value: 1, label: 'A Great Organization'};

  describe('Initially', () => {
    let quickView;
    beforeAll(() => {
      quickView = shallow(
        <QuickView
          regionalPartnerFilter={regionalPartnerFilter}
          route={routeProps}
        />,
        {context}
      );
    });

    it('Is loading', () => {
      expect(quickView.state('loading')).toBe(true);
    });
    it('Renders a spinner', () => {
      expect(quickView.find('Spinner')).toHaveLength(1);
    });
    it('Does not render a table', () => {
      expect(quickView.find(QuickViewTable)).toHaveLength(0);
    });
    it('Renders the CSV Download button', () => {
      expect(
        quickView.find('Button').findWhere(b => b.text() === 'Download CSV')
      ).toHaveLength(1);
    });
  });

  describe('After receiving applications from server', () => {
    const applicationsData = [
      {
        id: 8,
        date_applied: '2022-02-23',
        applicant_name: 'Clare Constantine',
        district_name: null,
        school_name: null,
        status: 'unreviewed',
      },
    ];
    let server;
    let quickView;
    beforeAll(() => {
      server = sinon.fakeServer.create();
      server.respondWith(
        'GET',
        '/api/v1/pd/applications/quick_view?role=csf_facilitators&regional_partner_value=1',
        [
          200,
          {'Content-Type': 'application/json'},
          JSON.stringify(applicationsData),
        ]
      );

      quickView = shallow(
        <QuickView
          regionalPartnerFilter={regionalPartnerFilter}
          route={routeProps}
        />,
        {context}
      );

      server.respond();
      quickView.update();
    });
    afterAll(() => {
      server.restore();
    });

    it('Is no longer loading', () => {
      expect(quickView.state('loading')).toBe(false);
    });
    it('Does not render a spinner', () => {
      expect(quickView.find('Spinner')).toHaveLength(0);
    });
    it('Renders 1 table with the returned applications', () => {
      const table = quickView.find(QuickViewTable);
      expect(table).toHaveLength(1);
      expect(table.prop('applications')).toEqual(applicationsData);
    });
    it('Renders the CSV Download button', () => {
      expect(
        quickView.find('Button').findWhere(b => b.text() === 'Download CSV')
      ).toHaveLength(1);
    });
  });
});
