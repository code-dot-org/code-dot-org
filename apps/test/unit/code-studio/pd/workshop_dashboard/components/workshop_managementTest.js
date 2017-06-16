import WorkshopManagement from '@cdo/apps/code-studio/pd/workshop_dashboard/components/workshop_management';
import React from 'react';
import {expect} from 'chai';
import {mount, shallow} from 'enzyme';
import {Router} from 'react-router';

describe("WorkshopManagement", () => {
  it("Renders expected buttons for not-started workshop", () => {

    const workshopManagement = shallow(
      <WorkshopManagement
        workshopId = '1'
        viewUrl = 'viewUrl'
        editUrl = 'editUrl'
        deleteUrl = 'deleteUrl'
      />,
      {
        context: {
          router: mockRouter
        }
      }
    );
  });
  it("Renders expected buttons for in-progress workshop", () => {
    const workshopManagement = shallow(
      <WorkshopManagement
        workshopId = '1'
        viewUrl = 'viewUrl'
        deleteUrl = 'deleteUrl'
      />
    );
  });
  it("Renders expected buttons for completed workshop", () => {
    setGlobalPermissionString("[workshop_organizer]");

    let workshopManagment = shallow(
      <WorkshopManagement
        workshop = '1'
        viewUrl = 'viewUrl'
        surveyUrl = 'surveyUrl'
      />
    );

    expect(workshopManagment.state.surveyUrl = '/organizer_survey_results/1');

    workshopManagment = shallow(
      <WorkshopManagement
        workshop = '1'
        viewUrl = 'viewUrl'
        surveyUrl = 'surveyUrl'
      />
    );

    expect(workshopManagment.state.surveyUrl = '/survey_results/1');
  });
})