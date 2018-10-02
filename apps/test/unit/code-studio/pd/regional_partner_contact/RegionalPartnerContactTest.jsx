import React from 'react';
import {mount} from 'enzyme';
import {expect} from '../../../../util/configuredChai';
import RegionalPartnerContact from '@cdo/apps/code-studio/pd/regional_partner_contact/RegionalPartnerContact';

describe('RegionalPartnerContactTest', () => {
  const API_ENDPOINT = "/api/v1/pd/regional_partner_contacts";
  const OPTIONS = {
    role: ['Teacher', 'School Administrator', 'District Administrator'],
    gradeLevels: ['High School (9-12)', 'Middle School (6-8)', 'Elementary School (K-5)'],
    optIn: ['Yes', 'No']
  };

  it('Job Title is optional', () => {
    const wrapper = mount(
      <RegionalPartnerContact
        apiEndpoint={API_ENDPOINT}
        options={OPTIONS}
      />
    );

    const fieldGroup = wrapper.find('FieldGroup').filterWhere(c => c.prop('id') === 'jobTitle');
    expect(fieldGroup).to.have.prop('required', false);
  });

  it('Notes is required', () => {
    const wrapper = mount(
      <RegionalPartnerContact
        apiEndpoint={API_ENDPOINT}
        options={OPTIONS}
      />
    );

    const fieldGroup = wrapper.find('FieldGroup').filterWhere(c => c.prop('id') === 'notes');
    expect(fieldGroup).to.have.prop('required', true);
  });
});
