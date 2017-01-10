import React from 'react';
import {expect} from 'chai';
import TeacherApplication from '@cdo/apps/code-studio/pd/teacher_application/teacher_application';
import {shallow} from 'enzyme';

describe("Tests for Teacher Application", () => {
  let form;
  let districtErrorMessage;
  let districtErrorMessageHandler = function (message) { districtErrorMessage = message;};

  //<editor-fold desc="school district data">
  const defaultSchoolDistrictData = {
    ['us-or-international']: 'us',
    ['school-type']: '',
    ['school-state']: '',
    ['school-district']: '',
    ['school-district-other']: false,
    ['school']: '',
    ['school-other']: false,
    ['school-district-name']: '',
    ['school-name']: '',
    ['school-zipcode']: ''
  };

  const privateSchoolData = Object.assign({}, defaultSchoolDistrictData, {
    ['school-type']: 'private',
    ['school-state']: 'California',
    ['school-name']: 'Milford Academy',
    ['school-zipcode']: '10000'
  });

  const publicSchoolData = Object.assign({}, defaultSchoolDistrictData, {
    ['school-type']: 'public',
    ['school-state']: 'New York',
    ['school-district']: '123456',
    ['school']: 'Williamsville High School',
  });

  const customPublicSchoolData = Object.assign({}, defaultSchoolDistrictData, {
    ['school-type']: 'public',
    ['school-state']: 'New York',
    ['school-district-other']: true,
    ['school-district-name']: 'Some undocumented public school',
    ['school-name']: 'Stealthy school',
    ['school-zipcode']: '10000'
  });
  //</editor-fold>

  it("initial state of the page", () => {
    form = shallow(
      <TeacherApplication
        schoolDistrictData={defaultSchoolDistrictData}
        districtErrorMessageHandler={districtErrorMessageHandler}
      />
    );

    expect(form.instance().errorData).to.deep.equal({});
    expect(form.find('SummerProgramContent').isEmpty()).to.be.true;
    expect(form.find('#regionalPartnersOnlyWarning').isEmpty()).to.be.true;
    expect(form.find('#identifyingRegionalPartnerWarning').isEmpty()).to.be.true;
  });

  it("Warning shows up for private / other schools", () => {
    for (var schoolType of ['private', 'other']) {
      privateSchoolData['school-type'] = schoolType;

      form = shallow(
        <TeacherApplication
          schoolDistrictData={privateSchoolData}
          districtErrorMessageHandler={districtErrorMessageHandler}
        />
      );

      expect(form.instance().errorData).to.deep.equal({});
      expect(form.find('SummerProgramContent').isEmpty()).to.be.true;
      expect(form.find('#regionalPartnersOnlyWarning')).to.have.length(1);
      expect(form.find('#identifyingRegionalPartnerWarning').isEmpty()).to.be.true;
    }
  });

  it("IDing regional partner warning shows up if other district is checked", () => {
    form = shallow(
      <TeacherApplication
        schoolDistrictData={customPublicSchoolData}
        districtErrorMessageHandler={districtErrorMessageHandler}
      />
    );
    expect(form.instance().errorData).to.deep.equal({});
    expect(form.find('SummerProgramContent').isEmpty()).to.be.true;
    expect(form.find('#regionalPartnersOnlyWarning').isEmpty()).to.be.true;
    expect(form.find('#identifyingRegionalPartnerWarning')).to.have.length(1);
  });

  it("IDing regional partner warning shows up if we have no regional partner", () => {
    form = shallow(
      <TeacherApplication
        schoolDistrictData={publicSchoolData}
        districtErrorMessageHandler={districtErrorMessageHandler}
      />
    );
    expect(form.instance().errorData).to.deep.equal({});
    expect(form.find('SummerProgramContent').isEmpty()).to.be.true;
    expect(form.find('#regionalPartnersOnlyWarning').isEmpty()).to.be.true;
    expect(form.find('#identifyingRegionalPartnerWarning')).to.have.length(1);
  });

  it("No warning shows up for data where we have a regional partner", () => {
    form = shallow(
      <TeacherApplication
        schoolDistrictData={publicSchoolData}
        districtErrorMessageHandler={districtErrorMessageHandler}
        regionalPartnerGroup={1}
        regionalPartnerName={'A+ College Ready'}
      />
    );
    expect(form.instance().errorData).to.deep.equal({});
    expect(form.find('SummerProgramContent').isEmpty()).to.be.true;
    expect(form.find('#regionalPartnersOnlyWarning').isEmpty()).to.be.true;
    expect(form.find('#identifyingRegionalPartnerWarning').isEmpty()).to.be.true;
  });
});
