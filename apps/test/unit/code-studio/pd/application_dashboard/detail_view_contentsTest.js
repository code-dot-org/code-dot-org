import DetailViewContents from '@cdo/apps/code-studio/pd/application_dashboard/detail_view_contents';
import React from 'react';
import {expect} from 'chai';
import {mount} from 'enzyme';

describe("DetailViewContents", () => {
  const mountDetailView = (applicationType) => {
    return mount(
      <DetailViewContents
        applicationId="1"
        applicationData={{
          regionalPartner: 'partner',
          notes: 'notes',
          status: 'accepted',
          school_name: 'School Name',
          district_name: 'District Name',
          email: 'email',
          application_type: applicationType,
          form_data: {
            firstName: 'First Name',
            lastName: 'Last Name',
            title: 'Title',
            phone: 'Phone',
            preferredFirstName: 'Preferred First Name',
            accountEmail: 'accountEmail',
            alternateEmail: 'alternateEmail',
            program: 'program',
            planOnTeachering: ['Yes'],
            abilityToMeetRequirements: '10',
            committed: 'Yes',
            taughtInPast: 'No'
          },
          response_scores: {
            committed: 'Yes'
          }
        }}
        viewType="facilitator"
        reload={() => {}}
      />
    );
  };

  const expectedTestData = [
    {type: 'Teacher', applicationSpecificQuestions: 6, scoredQuestions: 2, sections: 6},
    {type: 'Facilitator', applicationSpecificQuestions: 7, scoredQuestions: 0, sections: 4}
  ];

  for (const applicationData of expectedTestData) {
    it(`Renders full contents for ${applicationData.type} initially`, () => {
      const detailView = mountDetailView(applicationData.type);

      expect(detailView.find('#TopSection DetailViewResponse')).to.have.length(4);
      expect(detailView.find('DetailViewApplicationSpecificQuestions')).to.have.length(1);
      expect(detailView.find('DetailViewApplicationSpecificQuestions h3')).to.have.length(
        applicationData.applicationSpecificQuestions
      );
      expect(detailView.find('DetailViewApplicationSpecificQuestions FormControl')).to.have.length(
        applicationData.scoredQuestions
      );
    });

    describe("Edit controls behavior", () => {
      it(`the dropdown is disabled until the Edit button is clicked in ${applicationData.type}`, () => {
        const detailView = mountDetailView(applicationData.type);

        expect(detailView.find('#DetailViewHeader Button')).to.have.length(1);
        expect(detailView.find('#DetailViewHeader FormControl').prop('disabled')).to.be.true;
        expect(detailView.find('#Notes').prop('disabled')).to.be.true;
        if (applicationData.scoredQuestions) {
          expect(detailView.find('DetailViewApplicationSpecificQuestions FormControl').map((element) => {
            return element.prop('disabled');
          })).to.deep.equal([true, true]);
        }

        detailView.find('#DetailViewHeader Button').simulate('click');
        expect(detailView.find('#DetailViewHeader Button').map((button) => {
          return button.text();
        })).to.deep.equal(['Save', 'Cancel']);
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
    });
  }
});
