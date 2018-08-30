import React from 'react';
import EnrollForm from '@cdo/apps/code-studio/pd/workshop_enrollment/enroll_form';
import {expect} from 'chai';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import jQuery from 'jquery';

describe("Enroll Form", () => {
  // We aren't testing server responses, but have a fake server to handle calls and suppress warnings
  sinon.fakeServer.create();

  const props = {
    workshop_id: 1,
    first_name: "Rubeus",
    email: "rhagrid@hogwarts.edu",
    onSubmissionComplete: () => {}
  };

  describe("CSF Enroll Form", () => {
    let enrollForm;
    before(() => {
      enrollForm = shallow(
        <EnrollForm
          workshop_id={props.workshop_id}
          workshop_course="CS Fundamentals"
          first_name={props.first_name}
          email={props.email}
          onSubmissionComplete={props.onSubmissionComplete}
        />
      );
    });

    it("displays role question and not grade question", () => {
      expect(enrollForm.find("#role")).to.have.length(1);
      expect(enrollForm.find("#grades_teaching")).to.have.length(0);
    });

    it("displays grade question after teaching role answer", () => {
      enrollForm.setState({role: "Librarian"});
      expect(enrollForm.find("#grades_teaching")).to.have.length(1);
    });

    it("doesn't display grade q after non-teaching role answer", () => {
      enrollForm.setState({role: "Parent"});
      expect(enrollForm.find("#grades_teaching")).to.have.length(0);
    });
  });

  describe("CSP Enroll Form", () => {
    let enrollForm;
    before(() => {
      enrollForm = shallow(
        <EnrollForm
          workshop_id={props.workshop_id}
          workshop_course="CS Principles"
          first_name={props.first_name}
          email={props.email}
          onSubmissionComplete={props.onSubmissionComplete}
        />
      );
    });

    it("does not display role question", () => {
      expect(enrollForm.find("#role")).to.have.length(0);
    });
  });

  describe("Enroll Form", () => {
    let enrollForm;
    before(() => {
      sinon.spy(jQuery, "ajax");

      enrollForm = shallow(
        <EnrollForm
          workshop_id={props.workshop_id}
          workshop_course="CS Fundamentals"
          first_name={props.first_name}
          email={props.email}
          onSubmissionComplete={props.onSubmissionComplete}
        />
      );
    });
    after(() => {
      jQuery.ajax.restore();
    });

    it("doesn't submit other school_info fields when school_id is selected", () => {
      const params = {
        first_name: "Rubeus",
        last_name: "Hagrid",
        email: props.email,
        school_info: {
          school_id: "60001411118",
          school_name: "Summit Leadership Academy High Desert",
          school_state: "CA",
          school_type: "charter",
          school_zip: "92345"
        },
        role: "Librarian",
        grades_teaching: ["Kindergarten"]
      };
      const expectedData = {...params, school_info: {school_id: "60001411118"}};

      enrollForm.setState(params);
      enrollForm.find("#submit").simulate("click");

      expect(jQuery.ajax.calledOnce).to.be.true;
      expect(JSON.stringify(expectedData)).to.equal(jQuery.ajax.getCall(0).args[0].data);
    });
  });
});
