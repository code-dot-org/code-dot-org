import {DetailViewContents} from '@cdo/apps/code-studio/pd/application_dashboard/detail_view';
import React from 'react';
import {expect} from 'chai';
import {mount} from 'enzyme';

describe("DetailView", () => {
  describe("Edit controls behavior", () => {
    it("is disabled until the Edit button is clicked", () => {
      let detailView = mount(
        <DetailViewContents
          applicationData={{
            regionalPartner: 'partner',
            notes: 'notes',
            status: 'accepted',
            school_name: 'School Name',
            district_name: 'District Name',
            email: 'email',
            formData: {
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
        />
      );

      expect(detailView.find('#DetailViewHeader Button')).to.have.length(1);
      expect(detailView.find('#DetailViewHeader FormControl').prop('disabled')).to.be.true;

      detailView.find('#DetailViewHeader Button').simulate('click');
      expect(detailView.find('#DetailViewHeader Button').map((button) => {
        return button.text();
      })).to.deep.equal(['Save', 'Cancel']);
      expect(detailView.find('#DetailViewHeader FormControl').prop('disabled')).to.be.false;

      detailView.find('#DetailViewHeader Button').last().simulate('click');
      expect(detailView.find('#DetailViewHeader FormControl').prop('disabled')).to.be.true;
    });
  });
});
