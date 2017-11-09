import DetailViewContents from '@cdo/apps/code-studio/pd/application_dashboard/detail_view_contents';
import React from 'react';
import {expect} from 'chai';
import {mount} from 'enzyme';

describe("DetailViewContents", () => {
  const mountDetailView = () => {
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
            abilityToMeetRequirements: '10'
          }
        }}
        viewType="facilitator"
        updateProps={() => {}}
      />
    );
  };

  it("Renders full contents initially", () => {
    const detailView = mountDetailView();

    expect(detailView.find('#TopSection DetailViewResponse')).to.have.length(4);
    expect(detailView.find('Facilitator1819Questions')).to.have.length(1);
    expect(detailView.find('Facilitator1819Questions h3')).to.have.length(7);
  });

  describe("Edit controls behavior", () => {
    it("the dropdown is disabled until the Edit button is clicked", () => {
      const detailView = mountDetailView();

      expect(detailView.find('#DetailViewHeader Button')).to.have.length(1);
      expect(detailView.find('#DetailViewHeader FormControl').prop('disabled')).to.be.true;
      expect(detailView.find('#Notes').prop('disabled')).to.be.true;

      detailView.find('#DetailViewHeader Button').simulate('click');
      expect(detailView.find('#DetailViewHeader Button').map((button) => {
        return button.text();
      })).to.deep.equal(['Save', 'Cancel']);
      expect(detailView.find('#DetailViewHeader FormControl').prop('disabled')).to.be.false;
      expect(detailView.find('#Notes').prop('disabled')).to.be.false;

      detailView.find('#DetailViewHeader Button').last().simulate('click');
      expect(detailView.find('#DetailViewHeader FormControl').prop('disabled')).to.be.true;
      expect(detailView.find('#Notes').prop('disabled')).to.be.true;
    });
  });
});
