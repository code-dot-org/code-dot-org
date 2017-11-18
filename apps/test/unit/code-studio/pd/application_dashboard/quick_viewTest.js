import React from 'react';
import {shallow} from 'enzyme';
import QuickView from '@cdo/apps/code-studio/pd/application_dashboard/quick_view';
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
    regionalPartnerName: 'A Great Organization',
    viewType: 'facilitator'
  };

  it("Initially renders a spinner", () => {

    let quickView = shallow(
      <QuickView route={routeProps}/>, {context}
    );

    expect(quickView.find('Spinner')).to.have.length(1);
  });

  it("Generates 1 table after hearing from server", () => {
    let server = sinon.fakeServer.create();
    const data = JSON.stringify([{
      "id":8,
      "created_at":"2017-10-25T21:26:06.000Z",
      "applicant_name":"Clare Constantine",
      "district_name":null,
      "school_name":null,
      "status":"unreviewed"
    }]);

    server.respondWith("GET", '/api/v1/pd/applications/quick_view?role=csf_facilitators',
      [
        200,
        {"Content-Type": "application/json"},
        data
      ]
    );

    let quickView = shallow(
      <QuickView route={routeProps}/>, {context}
    );

    server.respond();
    expect(quickView.find('QuickViewTable')).to.have.length(1);
    expect(quickView.find('Spinner')).to.have.length(0);
  });
});
