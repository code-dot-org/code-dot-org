import {DetailViewContents} from '@cdo/apps/code-studio/pd/application_dashboard/detail_view_contents';
import {ApplicationStatuses, ApplicationFinalStatuses} from '@cdo/apps/code-studio/pd/application_dashboard/constants';
import React from 'react';
import _ from 'lodash';
import {expect} from '../../../../util/configuredChai';
import {mount} from 'enzyme';
import sinon from 'sinon';

describe("DetailViewContents", () => {
  // We aren't testing any of the responses of the workshop selector control, so just
  // have a fake server to handle calls and suppress warnings
  sinon.fakeServer.create();

  let context;

  const mountDetailView = (applicationType, overrides = {}) => {
    const defaultApplicationData = {
      regionalPartner: 'partner',
      notes: 'notes',
      status: 'accepted',
      school_name: 'School Name',
      district_name: 'District Name',
      email: 'email',
      application_year: '2019-2020',
      application_type: applicationType,
      course_name: 'CS Discoveries',
      course: 'csd',
      registered_fit_weekend: false,
      registered_teachercon: false,
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
      },
      school_stats: {}
    };

    const defaultProps = {
      canLock: true,
      applicationId: '1',
      applicationData: defaultApplicationData,
      viewType: 'facilitator'
    };

    // No-op router context
    context = {
      router: {
        push() {}
      }
    };

    return mount(
      <DetailViewContents
        {..._.merge(defaultProps, overrides)}
      />,
      {context}
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

  const applicationType = 'Facilitator';

  describe('Edit controls in Facilitator', () => {
    it(`allows for a subset of statuses to be locked`, () => {
      const detailView = mountDetailView(applicationType);

      // click edit
      detailView.find('#DetailViewHeader Button').last().simulate('click');

      // lock button is disabled for all statuses except "finalized"
      // statuses in the constant are an object {value: label}
      Object.keys(ApplicationStatuses[applicationType.toLowerCase()]).forEach((status) => {
        const statusIsFinal = ApplicationFinalStatuses.includes(status);
        detailView
          .find('#DetailViewHeader select')
          .simulate('change', { target: { value: status } });
        expect(detailView.find('#DetailViewHeader Button').first().prop('disabled')).to.equal(!statusIsFinal);
      });
    });

    it(`disables status dropdown when locked`, () => {
      const detailView = mountDetailView(applicationType);

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

  const expectedTestData = ['Teacher', 'Facilitator'];

  for (const applicationType of expectedTestData) {

    describe("Admin edit dropdown", () => {
      it("Is not visible to regional partners", () => {
        const detailView = mountDetailView(applicationType, {isWorkshopAdmin: false});
        expect(detailView.find("#admin-edit")).to.have.length(0);
      });

      it("Is visible to admins", () => {
        const detailView = mountDetailView(applicationType, {isWorkshopAdmin: true});
        expect(detailView.find("#admin-edit")).to.have.length(2);
      });

      it("Edit redirects to edit page", () => {
        const detailView = mountDetailView(applicationType, {isWorkshopAdmin: true});
        const mockRouter = sinon.mock(context.router);

        detailView.find("#admin-edit").first().simulate("click");
        const adminEditMenuitem = detailView.find(".dropdown.open a").findWhere(a => a.text() === "(Admin) Edit Form Data");

        mockRouter.expects("push").withExactArgs("/1/edit");
        adminEditMenuitem.simulate("click");
        mockRouter.verify();
      });

      it("Has Delete Application menu item", () =>{
        const detailView = mountDetailView(applicationType, {isWorkshopAdmin: true});
        detailView.find("#admin-edit").first().simulate("click");
        const deleteApplicationMenuitem = detailView.find(".dropdown.open a").findWhere(a => a.text() === "Delete Application");

        expect(deleteApplicationMenuitem).to.have.length(1);
      });

      it("Has Delete FiT Weekend Registration menu item if there is a FiT weekend registration", () =>{
        const overrides = {isWorkshopAdmin: true, applicationData: {registered_fit_weekend: true}};
        const detailView = mountDetailView(applicationType, overrides);
        detailView.find("#admin-edit").first().simulate("click");
        const deleteFitWeekendRegistrationMenuitem = detailView.find(".dropdown.open a").findWhere(a => a.text() === "Delete FiT Weekend Registration");

        expect(deleteFitWeekendRegistrationMenuitem).to.have.length(1);
      });

      it("Does not have delete registration menu items if there are not registrations", () =>{
        const detailView = mountDetailView(applicationType, {isWorkshopAdmin: true});
        detailView.find("#admin-edit").first().simulate("click");
        const deleteTeacherconRegistrationMenuitem = detailView.find(".dropdown.open a").findWhere(a => a.text() === "Delete Teachercon Registration");
        const deleteFitWeekendRegistrationMenuitem = detailView.find(".dropdown.open a").findWhere(a => a.text() === "Delete FiT Weekend Registration");

        expect(deleteTeacherconRegistrationMenuitem).to.have.length(0);
        expect(deleteFitWeekendRegistrationMenuitem).to.have.length(0);
      });
    });

    describe("Edit controls behavior", () => {
      it(`the dropdown is disabled until the Edit button is clicked in ${applicationType}`, () => {
        const detailView = mountDetailView(applicationType);

        let expectedButtons = applicationType === 'Facilitator' ? ['Lock', 'Edit'] : ['Edit'];
        expect(detailView.find('#DetailViewHeader Button').map((button) => {
          return button.text();
        })).to.deep.equal(expectedButtons);
        expect(detailView.find('#DetailViewHeader FormControl').prop('disabled')).to.be.true;
        expect(detailView.find('#notes').prop('disabled')).to.be.true;
        expect(detailView.find('#notes_2').prop('disabled')).to.be.true;

        expectedButtons = applicationType === 'Facilitator' ? ['Lock', 'Save', 'Cancel'] : ['Save', 'Cancel'];
        detailView.find('#DetailViewHeader Button').last().simulate('click');
        expect(detailView.find('#DetailViewHeader Button').map((button) => {
          return button.text();
        })).to.deep.equal(expectedButtons);
        expect(detailView.find('#DetailViewHeader FormControl').prop('disabled')).to.be.false;
        expect(detailView.find('#notes').prop('disabled')).to.be.false;
        expect(detailView.find('#notes_2').prop('disabled')).to.be.false;

        detailView.find('#DetailViewHeader Button').last().simulate('click');
        expect(detailView.find('#DetailViewHeader FormControl').prop('disabled')).to.be.true;
        expect(detailView.find('#notes').prop('disabled')).to.be.true;
        expect(detailView.find('#notes_2').prop('disabled')).to.be.true;
      });
    });
  }
});
