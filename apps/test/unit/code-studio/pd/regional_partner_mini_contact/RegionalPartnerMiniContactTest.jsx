import React from 'react';
import {mount} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import {RegionalPartnerMiniContact} from '@cdo/apps/code-studio/pd/regional_partner_mini_contact/RegionalPartnerMiniContact';

describe('RegionalPartnerMiniContactTest', () => {
  const API_ENDPOINT = '/api/v1/pd/regional_partner_mini_contacts';
  const OPTIONS = {};
  const FIELD_EXPECTATIONS = {
    name: {type: 'FieldGroup', expectRequired: false},
    email: {type: 'FieldGroup', expectRequired: true},
    zip: {type: 'FieldGroup', expectRequired: true},
    notes: {type: 'FieldGroup', expectRequired: false},
    role: {type: 'Select', expectRequired: false},
    grade_levels: {type: 'ButtonList', expectRequired: false}
  };

  describe('Required fields', () => {
    Object.keys(FIELD_EXPECTATIONS).forEach(fieldName => {
      const expectRequired = FIELD_EXPECTATIONS[fieldName].expectRequired;

      it(`${fieldName} is ${expectRequired ? 'required' : 'optional'}`, () => {
        const wrapper = mount(
          <RegionalPartnerMiniContact
            apiEndpoint={API_ENDPOINT}
            options={OPTIONS}
            sourcePageId="pageId"
          />
        );

        const field = findField(wrapper, fieldName);
        expect(field.prop('required')).to.equal(expectRequired);
      });
    });
  });

  function findField(wrapper, fieldName) {
    const type = FIELD_EXPECTATIONS[fieldName].type;
    if (type === 'ButtonList') {
      return wrapper
        .find(type)
        .filterWhere(c => c.prop('groupName') === fieldName);
    }
    return wrapper.find(type).filterWhere(c => c.prop('id') === fieldName);
  }
});
