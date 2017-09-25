import LocalSummerWorkshopSurveyResults from '@cdo/apps/code-studio/pd/workshop_dashboard/local_summer_workshop_survey_results';
import {shallow, mount} from 'enzyme';
import {expect} from 'chai';
import sinon from 'sinon';
import React from 'react';

describe("Local Summer Workshop Management", () => {
  const getFakeSurveyDataForFacilitator = () => {
    return {
      facilitator_breakdown: false,
      this_workshop: {
        'venue_feedback': ['Feedback 1', 'Feedback 2'],
        'num_enrollments': '10',
        'num_surveys': '8',
        'received_clear_communication': '5.5',
        'how_much_learned': '4.5'
      },
      all_my_local_workshops: {
        'venue_feedback': ['Feedback 1', 'Feedback 2', 'Feedback 3', 'Feedback 4'],
        'num_enrollments': '200',
        'num_surveys': '180',
        'received_clear_communication': '5.5',
        'how_much_learned': '4.5'
      },
      all_workshops_for_course: {
        'num_enrollments': '20000',
        'num_surveys': '18000',
        'received_clear_communication': '5',
        'how_much_learned': '3'
      }
    };
  };

  const getFakeSurveyDataForWorkshopOrganizer = () => {
    return {
      facilitator_breakdown: true,
      facilitator_names: ['Han', 'Chewbacca'],
      this_workshop: {
        'venue_feedback': ['Feedback 1', 'Feedback 2'],
        'num_enrollments': '10',
        'num_surveys': '8',
        'received_clear_communication': '5.5',
        'how_much_learned': '4.5',
        'how_clearly_presented': {'Han': 5, 'Chewbacca': 1},
        'things_facilitator_did_well': {'Han': ['Shot first'], 'Chewbacca': ['Roared a lot']},
        'facilitator_names': ['Han', 'Chewbacca']
      },
      all_my_local_workshops: {
        'venue_feedback': ['Feedback 1', 'Feedback 2', 'Feedback 3', 'Feedback 4'],
        'num_enrollments': '10',
        'num_surveys': '8',
        'received_clear_communication': '5.5',
        'how_much_learned': '4.5',
        'how_clearly_presented': 5
      },
      all_workshops_for_course: {
        'num_enrollments': '20000',
        'num_surveys': '18000',
        'received_clear_communication': '5',
        'how_much_learned': '3'
      }
    };
  };

  describe("View summarization", () => {
    it("Initially displays spinner", () => {
      let localSummerWorkshopSurveyResults = shallow(
        <LocalSummerWorkshopSurveyResults
          params={{workshopId: '1', facilitators: []}}
        />
      );

      expect(localSummerWorkshopSurveyResults.state('loading')).to.be.true;
      expect(localSummerWorkshopSurveyResults.find('Spinner')).to.have.length(1);
    });

    it("Displays table after loading is completed for facilitator", () => {
      let server = sinon.fakeServer.create();
      server.respondWith(
        'GET',
        '/api/v1/pd/workshops/1/local_workshop_survey_report',
        [200, {"Content-Type": "application/json"}, JSON.stringify(getFakeSurveyDataForFacilitator())]
      );

      let localSummerWorkshopSurveyResults = mount(
        <LocalSummerWorkshopSurveyResults
          params={{workshopId: '1'}}
        />
      );

      server.respond();

      expect(server.requests.length).to.equal(1);
      expect(localSummerWorkshopSurveyResults.state('loading')).to.be.false;
      expect(localSummerWorkshopSurveyResults.find('table')).to.have.length(1);
      expect(localSummerWorkshopSurveyResults.find('table th')).to.have.length(4);

      expect(localSummerWorkshopSurveyResults.find('.well')).to.have.length(1);
      expect(localSummerWorkshopSurveyResults.find('.well li')).to.have.length(2);
    });

    it("Displays table after loading is completed for workshop organizer", () => {
      let server = sinon.fakeServer.create();
      server.respondWith(
        'GET',
        '/api/v1/pd/workshops/1/local_workshop_survey_report',
        [200, {"Content-Type": "application/json"}, JSON.stringify(getFakeSurveyDataForWorkshopOrganizer())]
      );

      let localSummerWorkshopSurveyResults = mount(
        <LocalSummerWorkshopSurveyResults
          params={{workshopId: '1'}}
        />
      );

      server.respond();

      expect(server.requests.length).to.equal(1);
      expect(localSummerWorkshopSurveyResults.state('loading')).to.be.false;
      expect(localSummerWorkshopSurveyResults.find('table')).to.have.length(1);
      expect(localSummerWorkshopSurveyResults.find('table th')).to.have.length(6);

      expect(localSummerWorkshopSurveyResults.find('.well')).to.have.length(2);
      expect(localSummerWorkshopSurveyResults.find('.well li')).to.have.length(6);
      expect(localSummerWorkshopSurveyResults.find('.well li ul')).to.have.length(2);
      expect(localSummerWorkshopSurveyResults.find('.well li ul li')).to.have.length(2);
    });
  });
});
