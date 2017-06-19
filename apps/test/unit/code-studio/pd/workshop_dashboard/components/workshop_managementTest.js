import WorkshopManagement from '@cdo/apps/code-studio/pd/workshop_dashboard/components/workshop_management';
import React from 'react';
import {expect} from 'chai';
import {shallow} from 'enzyme';
import sinon from 'sinon';
// import {Router} from 'react-router';

describe("WorkshopManagement", () => {

  const fakeRouter = {
    createHref() {}
  };
  const context = {
    router: fakeRouter
  };

  it("Renders expected buttons for not-started workshop", () => {
    const mock = sinon.mock(fakeRouter);

    mock.expects("createHref").withExactArgs("viewUrl").returns("viewHref");
    mock.expects("createHref").withExactArgs("editUrl").returns("editHref");

    const workshopManagement = shallow(
      <WorkshopManagement
        workshopId = {1}
        viewUrl = "viewUrl"
        editUrl = "editUrl"
        onDelete={() => {}}
      />, {context}
    );

    const renderedButtons = workshopManagement.find("Button");
    expect(renderedButtons).to.have.length(3);
    expect(renderedButtons.get(0).props.href).to.eql("viewHref");
    expect(renderedButtons.get(1).props.href).to.eql("editHref");
    expect(renderedButtons.get(2).props.children).to.eql("Delete");

    mock.verify();
  });

  it("Renders expected buttons for started workshop", () => {
    const mock = sinon.mock(fakeRouter);

    mock.expects("createHref").withExactArgs("viewUrl").returns("viewHref");

    const workshopManagement = shallow(
      <WorkshopManagement
        workshopId = {1}
        viewUrl = "viewUrl"
      />, {context}
    );

    const renderedButtons = workshopManagement.find("Button");
    expect(renderedButtons).to.have.length(1);
    expect(renderedButtons.get(0).props.href).to.eql("viewHref");

    mock.verify();
  });

  it("Renders expected buttons for completed workshop for workshop organizer", () => {
    const mock = sinon.mock(fakeRouter);

    window.dashboard = {
      workshop: {
        permission: 'workshop_organizer'
      }
    };

    mock.expects("createHref").withExactArgs("viewUrl").returns("viewHref");
    mock.expects("createHref").withExactArgs("/organizer_survey_results/1").returns("organizerResultsHref");

    const workshopManagement = shallow(
      <WorkshopManagement
        workshopId = {1}
        viewUrl = "viewUrl"
        showSurveyUrl={true}
      />,
      {
        context: {
          router: fakeRouter
        }
      }
    );

    const renderedButtons = workshopManagement.find("Button");
    expect(renderedButtons).to.have.length(2);
    expect(renderedButtons.get(0).props.href).to.eql("viewHref");
    expect(renderedButtons.get(1).props.href).to.eql("organizerResultsHref");

    mock.verify();
  });

  it("Renders expected buttons for completed workshop for facilitator", () => {
    const mock = sinon.mock(fakeRouter);

    window.dashboard = {
      workshop: {
        permission: 'facilitator'
      }
    };

    mock.expects("createHref").withExactArgs("viewUrl").returns("viewHref");
    mock.expects("createHref").withExactArgs("/survey_results/1").returns("facilitatorResultsHref");

    const workshopManagement = shallow(
      <WorkshopManagement
        workshopId = {1}
        viewUrl = "viewUrl"
        showSurveyUrl={true}
      />,
      {
        context: {
          router: fakeRouter
        }
      }
    );

    const renderedButtons = workshopManagement.find("Button");
    expect(renderedButtons).to.have.length(2);
    expect(renderedButtons.get(0).props.href).to.eql("viewHref");
    expect(renderedButtons.get(1).props.href).to.eql("facilitatorResultsHref");
  });
});
