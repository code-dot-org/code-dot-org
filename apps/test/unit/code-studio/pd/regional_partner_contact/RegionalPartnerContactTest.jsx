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

  describe('Required fields', () => {
    [
      {fieldName: 'firstName', type: 'FieldGroup', expectedRequired: true},
      {fieldName: 'lastName', type: 'FieldGroup', expectedRequired: true},
      {fieldName: 'email', type: 'FieldGroup', expectedRequired: true},
      {fieldName: 'role', type: 'ButtonList', expectedRequired: true},
      {fieldName: 'jobTitle', type: 'FieldGroup', expectedRequired: false},
      {fieldName: 'gradeLevels', type: 'ButtonList', expectedRequired: true},
      {fieldName: 'notes', type: 'FieldGroup', expectedRequired: true},
      {fieldName: 'optIn', type: 'ButtonList', expectedRequired: true},
    ].forEach(({fieldName, type, expectedRequired}) => {
      it(`${fieldName} is ${expectedRequired ? 'required' : 'optional'}`, () => {
        const wrapper = mount(
          <RegionalPartnerContact
            apiEndpoint={API_ENDPOINT}
            options={OPTIONS}
          />
        );

        let field;
        if (type === 'ButtonList') {
          field = wrapper.find(type).filterWhere(c => c.prop('groupName') === fieldName);
        } else {
          field = wrapper.find(type).filterWhere(c => c.prop('id') === fieldName);
        }
        expect(field).to.have.prop('required', expectedRequired);
      });
    });
  });
});
