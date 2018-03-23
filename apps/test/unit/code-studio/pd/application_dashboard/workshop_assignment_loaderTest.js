import WorkshopAssignmentLoader from '@cdo/apps/code-studio/pd/application_dashboard/workshop_assignment_loader';
import React from 'react';
import {expect} from 'chai';
import {mount} from 'enzyme';
import sinon from 'sinon';
import { createWaitForElement } from 'enzyme-wait';

describe("WorkshopAssignmentLoader", () => {
  // We aren't testing any of the responses of the workshop selector control, so just
  // have a fake server to handle calls and suppress warnings
  let sandbox, handleChange;
  beforeEach(() => {
    sandbox = sinon.createSandbox({useFakeServer: true});
    handleChange = sandbox.spy();
  });
  afterEach(() => {
    sandbox.restore();
  });

  let workshopAssignmentLoader;
  const mountWorkshopAssignmentLoader = (subjectType = "summer") => mount(
    <WorkshopAssignmentLoader
      courseName="CS Discoveries"
      subjectType={subjectType}
      onChange={handleChange}
    />
  );

  const respondWith = (url, response) => sandbox.server.respondWith(
    url,
    [
      200,
      {"Content-Type": "application/json"},
      JSON.stringify(response)
    ]
  );

  const respondWithLocal = (response) => respondWith(
    /filter/,
    response
  );
  const respondWithTeachercon = (response) => respondWith(
    /upcoming_teachercons/,
    response
  );

  it("initially displays spinner", () => {
    workshopAssignmentLoader = mountWorkshopAssignmentLoader();
    expect(workshopAssignmentLoader.find("Spinner")).to.have.length(1);
    expect(workshopAssignmentLoader.find("WorkshopAssignmentSelect")).to.have.length(0);
  });

  describe("For summer workshops", () => {
    beforeEach(() => {
      workshopAssignmentLoader = mountWorkshopAssignmentLoader("summer");
    });

    it("Queries local summer and teachercon", () => {
      expect(sandbox.server.requests).to.have.length(2);
      expect(sandbox.server.requests[0].url).to.include(
        "/api/v1/pd/workshops/filter?state=Not+Started&course=CS+Discoveries&subject=5-day+Summer"
      );
      expect(sandbox.server.requests[1].url).to.include(
        "/api/v1/pd/workshops/upcoming_teachercons?course=CS+Discoveries"
      );
    });

    it("Renders WorkshopAssignmentSelect with combined workshop list", () => {
      respondWithLocal({
        workshops: [
          {id: 1, date_and_location_name: 'Dec 10 - 15, 2018, Seattle WA'},
          {id: 2, date_and_location_name: 'Dec 15 - 20, 2018, Buffalo NY'}
        ]
      });
      respondWithTeachercon([
        {id: 11, date_and_location_name: 'July 22 - 27, 2018, Phoenix AZ'}
      ]);
      sandbox.server.respond();

      const waitForSelect = createWaitForElement("WorkshopAssignmentSelect");
      return waitForSelect(workshopAssignmentLoader).then(workshopAssignmentLoader => {
        expect(workshopAssignmentLoader.find("Spinner")).to.have.length(0);
        const select = workshopAssignmentLoader.find("WorkshopAssignmentSelect");
        expect(select).to.have.length(1);
        expect(select.prop("workshops")).to.eql([
          {value: 1, label: 'Dec 10 - 15, 2018, Seattle WA'},
          {value: 2, label: 'Dec 15 - 20, 2018, Buffalo NY'},
          {value: 11, label: 'July 22 - 27, 2018, Phoenix AZ'}
        ]);
      });
    });
  });

  describe("For fit workshops", () => {
    beforeEach(() => {
      workshopAssignmentLoader = mountWorkshopAssignmentLoader("fit");
    });

    it("Queries only fit workshops", () => {
      expect(sandbox.server.requests).to.have.length(1);
      expect(sandbox.server.requests[0].url).to.include(
        "/api/v1/pd/workshops/filter?state=Not+Started&course=CS+Discoveries&subject=Code.org+Facilitator+Weekend"
      );
    });

    it("Renders WorkshopAssignmentSelect with combined workshop list", () => {
      respondWithLocal({
        workshops: [
          {id: 1, date_and_location_name: 'Dec 10 - 15, 2018, Seattle WA'},
          {id: 2, date_and_location_name: 'Dec 15 - 20, 2018, Buffalo NY'}
        ]
      });
      sandbox.server.respond();

      const waitForSelect = createWaitForElement("WorkshopAssignmentSelect");
      return waitForSelect(workshopAssignmentLoader).then(workshopAssignmentLoader => {
        expect(workshopAssignmentLoader.find("Spinner")).to.have.length(0);
        const select = workshopAssignmentLoader.find("WorkshopAssignmentSelect");
        expect(select).to.have.length(1);
        expect(select.prop("workshops")).to.eql([
          {value: 1, label: 'Dec 10 - 15, 2018, Seattle WA'},
          {value: 2, label: 'Dec 15 - 20, 2018, Buffalo NY'}
        ]);
      });
    });
  });

  it("Displays error message when query fails", () => {
    workshopAssignmentLoader = mountWorkshopAssignmentLoader("summer");

    // bad request
    sandbox.server.respondWith([400, {}, ""]);
    sandbox.server.respond();

    const waitForError = createWaitForElement("div.workshop-load-error");
    return waitForError(workshopAssignmentLoader);
  });

  it("Aborts pending ajax requests on unmount", () => {
    workshopAssignmentLoader = mountWorkshopAssignmentLoader("summer");

    const pendingRequests = workshopAssignmentLoader.instance().pendingRequests;
    expect(pendingRequests).to.have.length(2);
    expect(pendingRequests.every(r => r.statusText !== "abort")).to.be.true;

    workshopAssignmentLoader.unmount();
    expect(pendingRequests.every(r => r.statusText === "abort")).to.be.true;
  });
});
