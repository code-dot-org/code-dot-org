import {expect} from 'chai';
import React from 'react';
import {shallow} from 'enzyme';
import TeacherApplication from '@cdo/apps/code-studio/pd/teacher_application/teacher_application';
import {ButtonList} from '@cdo/apps/code-studio/pd/form_components/button_list';

describe("the TeacherApplication component", () => {
  let form;

  function check(label, values) {
    const buttonList = form.find({label});
    expect(buttonList.is(ButtonList)).to.be.true;

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
  }

  function write(label, value) {
    const field = form.find({label});
    expect(field.is('FieldGroup')).to.be.true;
    expect(field.prop('type')).to.be.oneOf(['text', 'email']);
    field.simulate('change', {target: {id: field.prop('id'), value}});
  }

  function selectCourse(course) {
    form.find({name: 'courseSelection', value: course})
        .simulate('change', {target: {value: course}});
  }

  function completeAndSend() {
    const button = form.find('Button')
                       .filter({children: 'Complete and Send'});
    button.simulate('click');
  }

  beforeEach(() => {
    form = shallow(<TeacherApplication/>);
  });

  it("initially has no errors", () => {
    expect(form.instance().errorData).to.deep.equal({});
  });

  it("initially says nothing about summer program content", () => {
    expect(form.find('SummerProgramContent').isEmpty()).to.be.true;
  });

  describe("when you try to complete the form without filling anything out, the component", () => {
    beforeEach(() => {
      completeAndSend();
    });

    it("should have some errors", () => {
      expect(form.instance().errorData).to.deep.equal({});
    });
  });

  describe("when you fill out the selected course, the component", () => {
    beforeEach(() => {
      selectCourse('csd');
    });

    it("will show the summer program content", () => {
      expect(form.find('SummerProgramContent').isEmpty()).to.be.false;
    });
  });

  describe("after the teacher information and course selection sections are filled out, the component", () => {
    beforeEach(() => {
      check('Grades served at your school', ['Kindergarten', '1', '2', '3']);
      write('First name', 'Valerie');
      write('Last name', 'Frizzle');
      write('Primary email address', 'thefrizz@magicschoolbus.edu');
      write('Preferred phone number', '1-800-843-3499');
      check('Gender identity', 'Female');
      check('What grades are you teaching in the current 2016-17 school year? (select all that apply)',
            ['Kindergarten', '3']);
      check('What subjects are you teaching in the current 2016-17 school year? (select all that apply)',
            ['Computer Science', 'Math']);
      check('What grades will you be teaching in the 2017-18 school year? (select all that apply)',
            ['Kindergarten', '1', '3']);
      check('What subjects will you be teaching in the 2017-18 school year? (select all that apply)',
            ['Computer Science']);
      write("Principal's first name", "Darth");
      write("Principal's last name", "Vader");
      write("Principal's email address", 'sir.lord.darth.vader@deathstar.edu');
      selectCourse('csd');
    });

    it("should have the proper state", () => {
      expect(form.state('gradesAtSchool')).to.deep.equal(['Kindergarten', '1', '2', '3']);
      expect(form.state('firstName')).to.equal('Valerie');
      expect(form.state('lastName')).to.equal('Frizzle');
      expect(form.state('primaryEmail')).to.equal('thefrizz@magicschoolbus.edu');
      expect(form.state('phoneNumber')).to.equal('1-800-843-3499');
      expect(form.state('genderIdentity')).to.equal('Female');
      expect(form.state('grades2016')).to.deep.equal(['Kindergarten', '3']);
      expect(form.state('subjects2016')).to.deep.equal(['Computer Science', 'Math']);
      expect(form.state('grades2017')).to.deep.equal(['Kindergarten', '1', '3']);
      expect(form.state('subjects2017')).to.deep.equal(['Computer Science']);
      expect(form.state('principalFirstName')).to.equal('Darth');
      expect(form.state('principalLastName')).to.equal('Vader');
      expect(form.state('principalEmail')).to.equal('sir.lord.darth.vader@deathstar.edu');
      expect(form.state('selectedCourse')).to.equal('csd');
    });
  });

});
