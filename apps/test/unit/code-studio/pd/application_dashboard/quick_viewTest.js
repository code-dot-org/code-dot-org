import React from 'react';
import {shallow} from 'enzyme';
import {QuickView} from '@cdo/apps/code-studio/pd/application_dashboard/quick_view';
import QuickViewTable from '@cdo/apps/code-studio/pd/application_dashboard/quick_view_table';
import {expect} from 'chai';
import sinon from 'sinon';

describe("Quick View", () => {
  const fakeRouter = {
    createHref() {}
  };

  const context = {
    router: fakeRouter
  };

  const routeProps = {
    path:'csf_facilitators',
    applicationType:'CSF Facilitators',
    viewType: 'facilitator',
    role: 'csf_facilitators'
  };

  const regionalPartnerFilter = {value: "1", label: "A Great Organization"};

  describe("Initially", () => {
    let quickView;
    before(() => {
      quickView = shallow(
        <QuickView
          regionalPartnerFilter={regionalPartnerFilter}
          route={routeProps}
        />,
        { context },
      );
    });

    it("Is loading", () => {
      expect(quickView.state('loading')).to.be.true;
    });
    it("Renders a spinner", () => {
      expect(quickView.find('Spinner')).to.have.length(1);
    });
    it("Does not render a table", () => {
      expect(quickView.find(QuickViewTable)).to.have.length(0);
    });
    it("Renders the CSV Download button", () => {
      expect(quickView.find("Button").findWhere(b => b.text() === 'Download CSV')).to.have.length(1);
    });
  });

  describe("After receiving applications from server", () => {
    const data = [{
      id: 8,
      created_at: "2017-10-25T21:26:06.000Z",
      applicant_name: "Clare Constantine",
      district_name: null,
      school_name: null,
      status: "unreviewed"
    }];
    let server;
    let quickView;
    before(() => {
      server = sinon.fakeServer.create();
      server.respondWith("GET", '/api/v1/pd/applications/quick_view?role=csf_facilitators&regional_partner_value=1',
        [
          200,
          {"Content-Type": "application/json"},
          JSON.stringify(data)
        ]
      );

      quickView = shallow(
        <QuickView
          regionalPartnerFilter={regionalPartnerFilter}
          route={routeProps}
        />,
        { context },
      );

      server.respond();
    });
    after(() => {
      server.restore();
    });

    it("Is no longer loading", () => {
      expect(quickView.state('loading')).to.be.false;
    });
    it("Does not render a spinner", () => {
      expect(quickView.find('Spinner')).to.have.length(0);
    });
    it("Renders 1 table with the returned applications", () => {
      const table = quickView.find(QuickViewTable);
      expect(table).to.have.length(1);
      expect(table.prop('data')).to.eql(data);
    });
    it("Renders the CSV Download button", () => {
      expect(quickView.find("Button").findWhere(b => b.text() === 'Download CSV')).to.have.length(1);
    });
  });
});
