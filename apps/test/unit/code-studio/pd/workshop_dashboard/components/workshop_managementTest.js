import WorkshopManagement from '@cdo/apps/code-studio/pd/workshop_dashboard/components/workshop_management';
import React from 'react';
import {expect} from 'chai';
import {shallow} from 'enzyme';
import sinon from 'sinon';
// import {Router} from 'react-router';

describe("WorkshopManagement", () => {
  it("Renders expected buttons for not-started workshop", () => {
    const fakeRouter = {
      createHref() {}
    };

    const mock = sinon.mock(fakeRouter);
    mock.expects("createHref").withExactArgs("viewUrl").returns("viewHref");
    mock.expects("createHref").withExactArgs("editUrl").returns("editHref");

    const workshopManagement = shallow(
      <WorkshopManagement
        workshopId = {1}
        viewUrl = "viewUrl"
        editUrl = "editUrl"
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
    expect(renderedButtons.get(1).props.href).to.eql("editHref");

    mock.verify();
  });
  // it("Renders expected buttons for in-progress workshop", () => {
  //   const workshopManagement = shallow(
  //     <WorkshopManagement
  //       workshopId = '1'
  //       viewUrl = 'viewUrl'
  //       deleteUrl = 'deleteUrl'
  //     />
  //   );
  // });
  // it("Renders expected buttons for completed workshop", () => {
  //   setGlobalPermissionString("[workshop_organizer]");
  //
  //   let workshopManagment = shallow(
  //     <WorkshopManagement
  //       workshop = '1'
  //       viewUrl = 'viewUrl'
  //       surveyUrl = 'surveyUrl'
  //     />
  //   );
  //
  //   expect(workshopManagment.state.surveyUrl = '/organizer_survey_results/1');
  //
  //   workshopManagment = shallow(
  //     <WorkshopManagement
  //       workshop = '1'
  //       viewUrl = 'viewUrl'
  //       surveyUrl = 'surveyUrl'
  //     />
  //   );
  //
  //   expect(workshopManagment.state.surveyUrl = '/survey_results/1');
  // });
});
