import {expect} from '../../../../util/configuredChai';
import {setSchoolInfoFormData} from '@cdo/apps/sites/studio/pages/signup';

describe('registration', () => {
  describe('setSchoolInfoFormData', () => {
    it('school id of -1 does not get pushed', () => {
      const signupForm = [
        {name: "country_s", value: "United States"},
        {name: "user[school_info_attributes][school_type]", value: "public"},
        {name: "nces_school_s", value: "-1"},
        {name: "school_name_s", value: "School Name"},
        {name: "school_state_s", value: "Confusion"},
        {name: "school_zip_s", value: "90210"},
        {name: "registration_location", value: "Someplace Located"},
      ];
      const formData = [];
      setSchoolInfoFormData(signupForm, formData);
      expect(formData.length).to.equal(5);
      expect(formData.find(x => x.name === "user[school_info_attributes][school_name]").value).to.equal('School Name');
      expect(formData.find(x => x.name === "user[school_info_attributes][school_state]").value).to.equal('Confusion');
      expect(formData.find(x => x.name === "user[school_info_attributes][school_zip]").value).to.equal('90210');
      expect(formData.find(x => x.name === "user[school_info_attributes][full_address]").value).to.equal('Someplace Located');
      expect(formData.find(x => x.name === "user[school_info_attributes][country]").value).to.equal('US');
    });

    it('with school id other attibutes do not get pushed', () => {
      const signupForm = [
        {name: "country_s", value: "United States"},
        {name: "user[school_info_attributes][school_type]", value: "public"},
        {name: "nces_school_s", value: "123456"},
        {name: "school_name_s", value: "School Name"},
        {name: "school_state_s", value: "Confusion"},
        {name: "school_zip_s", value: "90210"},
        {name: "registration_location", value: "Someplace Located"},
      ];
      const formData = [];
      setSchoolInfoFormData(signupForm, formData);
      expect(formData.length).to.equal(2);
      expect(formData.find(x => x.name === "user[school_info_attributes][school_id]").value).to.equal('123456');
      expect(formData.find(x => x.name === "user[school_info_attributes][country]").value).to.equal('US');
    });
  });
});


