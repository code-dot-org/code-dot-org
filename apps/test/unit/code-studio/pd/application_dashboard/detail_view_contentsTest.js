import {DetailViewContents} from '@cdo/apps/code-studio/pd/application_dashboard/detail_view_contents';
import DetailViewResponse from '@cdo/apps/code-studio/pd/application_dashboard/detail_view_response';
import {ApplicationStatuses, ApplicationFinalStatuses} from '@cdo/apps/code-studio/pd/application_dashboard/constants';
import React from 'react';
import _ from 'lodash';
import {expect} from 'chai';
import {mount} from 'enzyme';
import sinon from 'sinon';

describe("DetailViewContents", () => {
  // We aren't testing any of the responses of the workshop selector control, so just
  // have a fake server to handle calls and suppress warnings
  sinon.fakeServer.create();

  const mountDetailView = (applicationType, overrides = {}) => {
    const defaultApplicationData = {
      regionalPartner: 'partner',
      notes: 'notes',
      status: 'accepted',
      school_name: 'School Name',
      district_name: 'District Name',
      email: 'email',
      application_type: applicationType,
      course_name: 'CS Fundamentals',
      form_data: {
        firstName: 'First Name',
        lastName: 'Last Name',
        title: 'Title',
        phone: 'Phone',
        preferredFirstName: 'Preferred First Name',
        accountEmail: 'accountEmail',
        alternateEmail: 'alternateEmail',
        program: 'program',
        abilityToMeetRequirements: '10',
        committed: 'Yes',
        taughtInPast: 'No',
      },
      response_scores: {
        committed: 'Yes'
      }
    };

    const defaultProps = {
      canLock: true,
      applicationId: '1',
      applicationData: defaultApplicationData,
      viewType: 'facilitator',
      reload: () => {}
    };

    return mount(
      <DetailViewContents
        {..._.merge(defaultProps, overrides)}
      />
    );
  };

  describe("Notes", () => {
    it("Uses default value for facilitator applications with no notes", () => {
      const facilitatorDetailView = mountDetailView('Facilitator', {applicationData: {notes: ''}});
      expect(facilitatorDetailView.state().notes).to.eql(
        "Google doc rubric completed: Y/N\nTotal points:\n(If interviewing) Interview notes completed: Y/N\nAdditional notes:"
      );
    });

    it("Uses entered value for facilitator applications with notes", () => {
      const facilitatorDetailView = mountDetailView('Facilitator', {applicationData: {notes: "actual notes"}});
      expect(facilitatorDetailView.state().notes).to.eql("actual notes");
    });

    it("Does not supply value for teacher applications with no notes", () => {
      const teacherDetailView = mountDetailView('Teacher', {applicationData: {notes: ''}});
      expect(teacherDetailView.state().notes).to.eql('');
    });
  });

  const expectedTestData = [
    {type: 'Teacher', applicationSpecificQuestions: 5, scoredQuestions: 2},
    {type: 'Facilitator', applicationSpecificQuestions: 7, scoredQuestions: 0}
  ];

  for (const applicationData of expectedTestData) {
    it(`Renders full contents for ${applicationData.type} initially`, () => {
      const detailView = mountDetailView(applicationData.type);

      expect(detailView.find('#TopSection DetailViewResponse')).to.have.length(3);
      expect(detailView.find('DetailViewApplicationSpecificQuestions')).to.have.length(1);
      expect(detailView.find('DetailViewApplicationSpecificQuestions h3')).to.have.length(
        applicationData.applicationSpecificQuestions
      );
      expect(detailView.find('DetailViewApplicationSpecificQuestions FormControl')).to.have.length(
        applicationData.scoredQuestions
      );
    });

    describe("Regional Partner Panel", () => {
      const regionalPartnerPanel = <DetailViewResponse question="Regional Partner" />;

      it("Does not render for regional partners", () => {
        const regionalPartnerDetailView = mountDetailView(applicationData.type, {isWorkshopAdmin: false});
        expect(regionalPartnerDetailView.find('#TopSection DetailViewResponse')).to.have.length(3);
        expect(regionalPartnerDetailView).to.not.containMatchingElement(regionalPartnerPanel);
      });

      it("Does render for admins", () => {
        const workshopAdminDetailView = mountDetailView(applicationData.type, {isWorkshopAdmin: true});
        expect(workshopAdminDetailView.find('#TopSection DetailViewResponse')).to.have.length(4);
        expect(workshopAdminDetailView).to.containMatchingElement(regionalPartnerPanel);
      });
    });

    describe("Edit controls behavior", () => {
      it(`the dropdown is disabled until the Edit button is clicked in ${applicationData.type}`, () => {
        const detailView = mountDetailView(applicationData.type);

        expect(detailView.find('#DetailViewHeader Button').map((button) => {
          return button.text();
        })).to.deep.equal(['Lock', 'Edit']);
        expect(detailView.find('#DetailViewHeader FormControl').prop('disabled')).to.be.true;
        expect(detailView.find('#Notes').prop('disabled')).to.be.true;
        if (applicationData.scoredQuestions) {
          expect(detailView.find('DetailViewApplicationSpecificQuestions FormControl').map((element) => {
            return element.prop('disabled');
          })).to.deep.equal([true, true]);
        }

        detailView.find('#DetailViewHeader Button').last().simulate('click');
        expect(detailView.find('#DetailViewHeader Button').map((button) => {
          return button.text();
        })).to.deep.equal(['Lock', 'Save', 'Cancel']);
        expect(detailView.find('#DetailViewHeader FormControl').prop('disabled')).to.be.false;
        expect(detailView.find('#Notes').prop('disabled')).to.be.false;
        if (applicationData.scoredQuestions) {
          expect(detailView.find('DetailViewApplicationSpecificQuestions FormControl').map((element) => {
            return element.prop('disabled');
          })).to.deep.equal([false, false]);

          detailView.find('#committed-score').simulate('change', {target: {value: 'Yes', id: 'committed-score'}});
          expect(detailView.state('response_scores')).to.deep.equal({committed: 'Yes'});
        }

        detailView.find('#DetailViewHeader Button').last().simulate('click');
        expect(detailView.find('#DetailViewHeader FormControl').prop('disabled')).to.be.true;
        expect(detailView.find('#Notes').prop('disabled')).to.be.true;
        if (applicationData.scoredQuestions) {
          expect(detailView.find('DetailViewApplicationSpecificQuestions FormControl').map((element) => {
            return element.prop('disabled');
          })).to.deep.equal([true, true]);
        }
      });

      it(`allows for a subset of statuses to be locked in ${applicationData.type}`, () => {
        const detailView = mountDetailView(applicationData.type);

        // click edit
        detailView.find('#DetailViewHeader Button').last().simulate('click');

        // lock button is disabled for all statuses except "finalized"
        ApplicationStatuses[applicationData.type.toLowerCase()].forEach((status) => {
          // statuses in the constant are Capitalized, values in the form itself
          // are lowercase
          status = status.toLowerCase();
          const statusIsFinal = ApplicationFinalStatuses.includes(status);
          detailView
            .find('#DetailViewHeader select')
            .simulate('change', { target: { value: status } });
          expect(detailView.find('#DetailViewHeader Button').first().prop('disabled')).to.equal(!statusIsFinal);
        });
      });

      it(`disables status dropdown when locked in ${applicationData.type}`, () => {
        const detailView = mountDetailView(applicationData.type);

        // click edit
        detailView.find('#DetailViewHeader Button').last().simulate('click');

        // change status to approved
        detailView
          .find('#DetailViewHeader select')
          .simulate('change', { target: { value: 'accepted' } });

        // lock status
        expect(detailView.find('#DetailViewHeader Button').first()).text().to.equal('Lock');
        detailView.find('#DetailViewHeader Button').first().simulate('click');
        expect(detailView.find('#DetailViewHeader select')).prop('disabled').to.be.true;
        expect(detailView.find('#DetailViewHeader Button').first()).text().to.equal('Unlock');

        // unlock status
        detailView.find('#DetailViewHeader Button').first().simulate('click');
        expect(detailView.find('#DetailViewHeader select')).prop('disabled').to.be.false;
        expect(detailView.find('#DetailViewHeader Button').first()).text().to.equal('Lock');
      });
    });
  }
});
