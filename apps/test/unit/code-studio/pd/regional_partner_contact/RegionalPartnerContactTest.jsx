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
  const FIELD_EXPECTATIONS = {
    firstName: {type: 'FieldGroup', expectRequired: true},
    lastName: {type: 'FieldGroup', expectRequired: true},
    email: {type: 'FieldGroup', expectRequired: true},
    role: {type: 'ButtonList', expectRequired: true},
    jobTitle: {type: 'FieldGroup', expectRequired: false},
    gradeLevels: {type: 'ButtonList', expectRequired: true},
    notes: {type: 'FieldGroup', expectRequired: true},
    optIn: {type: 'ButtonList', expectRequired: true},
  };

  describe('Required fields', () => {
    Object.keys(FIELD_EXPECTATIONS).forEach((fieldName) => {
      const expectRequired = FIELD_EXPECTATIONS[fieldName].expectRequired;

      it(`${fieldName} is ${expectRequired ? 'required' : 'optional'}`, () => {
        const wrapper = mount(
          <RegionalPartnerContact
            apiEndpoint={API_ENDPOINT}
            options={OPTIONS}
          />
        );

        const field = findField(wrapper, fieldName);
        expect(field).to.have.prop('required', expectRequired);
      });
    });
  });

  function findField(wrapper, fieldName) {
    const type = FIELD_EXPECTATIONS[fieldName].type;
    if (type === 'ButtonList') {
      return wrapper.find(type).filterWhere(c => c.prop('groupName') === fieldName);
    }
    return wrapper.find(type).filterWhere(c => c.prop('id') === fieldName);
  }
});
