import React from 'react';
import _ from 'lodash';
import {expect} from 'chai';
import {TeacherApplication, likertAnswers} from '@cdo/apps/code-studio/pd/teacher_application/teacher_application';
import {shallow} from 'enzyme';
import ButtonList from '@cdo/apps/code-studio/pd/form_components/button_list'

describe("Tests for Teacher Application", () => {
  let form;
  let districtErrorMessage;
  let districtErrorMessageHandler = function (message) { districtErrorMessage = message;};
  let regionalPartnerExample = {regionalPartnerGroup: 1, regionalPartnerName: 'A+ College Ready'}
  //<editor-fold desc="sample data">
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

  const defaultUser = {
    textFields: {
      firstName: 'Benjamin',
      preferredFirstName: 'Ben',
      lastName: 'Franklin',
      primaryEmail: 'ben@upenn.edu',
      secondaryEmail: 'ben@gmail.com',
      phoneNumber: '2127365000',
      principalFirstName: 'George',
      principalLastName: 'Washington',
      principalEmail: 'washington@whitehouse.gov',
    },
    selectionFields: {
      gradesAtSchool: ['Kindergarten'].concat(_.map(_.range(1,13), x => x.toString())),
      genderIdentity: 'Male',
      grades2016: ['9', '10', '11', '12'],
      subjects2016: ['Computer Science', 'Math', 'History'],
      grades2017: ['8', '9', '10', '11', '12'],
      subjects2017: ['Computer Science', 'Math', 'History', 'Business']
    }
  };

  function likertValueOf(answer) {
    return likertAnswers.indexOf(answer) + 1;
  }

  const defaultCsdFields = {
    textFields: {
      whyCsIsImportant: 'Because all life is pain, and anyone who says otherwise is selling you something.',
      whatTeachingSteps: 'Sharks with frickin\' laser beams'
    },
    selectionFields: {
      gradesPlanningToTeach: ['6', '7', '8'],
      currentCsOpportunities: ['After school clubs', 'Hour of Code']
    },
    likertList: {
      allStudentsShouldLearn: likertValueOf('Strongly Agree'),
      allStudentsCanLearn: likertValueOf('Strongly Agree'),
      newApproaches: likertValueOf('Strongly Agree'),
      allAboutContent: likertValueOf('Disagree'),
      allAboutProgramming: likertValueOf('Disagree'),
      csCreativity: likertValueOf('Strongly Agree'),
    },
    summerProgramFields: {

    }
  };
  //</editor-fold>

  function write(label, value) {
    const field = form.find(`#${label}`);
    expect(field.is('FieldGroup')).to.be.true;
    if (!field.prop('componentClass') === 'textarea') {
      expect(field.prop('type')).to.be.oneOf(['text', 'email']);
    }
    field.simulate('change', {target: {id: field.prop('id'), value}});
    expect(form.state(label)).to.equal(value);
  }

  function check(groupName, values) {
    const buttonList = form.find(`[groupName="${groupName}"]`);
    expect(buttonList.is('ButtonList')).to.be.true;

    if (Array.isArray(values)) {
      expect(buttonList.prop('type')).to.equal('check');
      values.forEach(value => {
        expect(buttonList.prop('answers')).to.contain(value);
      });
    } else {
      expect(buttonList.prop('type')).to.equal('radio');
      expect(buttonList.prop('answers')).to.contain(values);
    }

    buttonList.simulate('change', {[buttonList.prop('groupName')]: values});
    expect(form.state(groupName)).to.equal(values);
  }

  function pickLikert(name, value) {
    const likertButton = form.find(`[name="${name}"]`).at(value - 1);
    expect(likertButton.prop('value')).to.equal(value);
    likertButton.simulate('change', {[name]: value});
    expect(form.state(name)).to.equal(value);
  }

  function pickCourse(course) {
    const buttonList = form.find(`[value="${course}"]`);
    buttonList.simulate('change', course);
  }

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
        {...regionalPartnerExample}
      />
    );
    expect(form.instance().errorData).to.deep.equal({});
    expect(form.find('SummerProgramContent').isEmpty()).to.be.true;
    expect(form.find('#regionalPartnersOnlyWarning').isEmpty()).to.be.true;
    expect(form.find('#identifyingRegionalPartnerWarning').isEmpty()).to.be.true;
  });

  it("CSD / CSP section renders depending on what course is being taught", () => {
    form = shallow(
      <TeacherApplication
        schoolDistrictData={publicSchoolData}
        districtErrorMessageHandler={districtErrorMessageHandler}
        {...regionalPartnerExample}
      />
    );
  });

  it("Completed CSD applications for public schools get submitted without errors", () => {
    form = shallow(
      <TeacherApplication
        schoolDistrictData={publicSchoolData}
        districtErrorMessageHandler={districtErrorMessageHandler}
        {...regionalPartnerExample}
      />
    );

    pickCourse('csd');
    let application = _.merge({}, defaultUser, defaultCsdFields);
    _.forEach(application['textFields'], (value, label) => {
      write(label, value);
    });
    _.forEach(application['selectionFields'], (values, groupName) => {
      check(groupName, values);
    });
    _.forEach(application['likertList'], (value, name) => {
      pickLikert(name, value);
    })
  });

  it("Completed CSP applications for private schools get submitted without errors");

  it("Applications missing required data are not submitted");

  it("Applications with non emails in email fields are not submitted");

  it("Applications with non phone numbers in phone number fields are not submitted");

  it("Teachers who do not commit to attending are given a warning");

  it("Emoji doesn't ruin everything");
});
