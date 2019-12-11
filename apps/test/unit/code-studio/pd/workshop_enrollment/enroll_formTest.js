import React from 'react';
import {assert, expect} from 'chai';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import jQuery from 'jquery';
import EnrollForm from '@cdo/apps/code-studio/pd/workshop_enrollment/enroll_form';
import {SubjectNames} from '@cdo/apps/generated/pd/sharedWorkshopConstants';

describe('Enroll Form', () => {
  // We aren't testing server responses, but have a fake server to handle calls and suppress warnings
  sinon.fakeServer.create();

  const props = {
    workshop_id: 1,
    first_name: 'Rubeus',
    email: 'rhagrid@hogwarts.edu',
    previous_courses: ['Transfiguration', 'Potions', 'Herbology'],
    onSubmissionComplete: () => {}
  };

  describe('CSF Enroll Form', () => {
    let enrollForm;
    before(() => {
      enrollForm = shallow(
        <EnrollForm
          workshop_id={props.workshop_id}
          workshop_course="CS Fundamentals"
          first_name={props.first_name}
          email={props.email}
          previous_courses={props.previous_courses}
          onSubmissionComplete={props.onSubmissionComplete}
        />
      );
    });

    it('displays role question and grade question', () => {
      expect(enrollForm.find('#role')).to.have.length(1);
      expect(enrollForm.find('#grades_teaching')).to.have.length(1);
    });

    it('displays describe role question after other/admin role answer', () => {
      enrollForm.setState({role: 'Other'});
      expect(enrollForm.find('#describe_role')).to.have.length(1);
    });

    it("doesn't display describe role question after normal teaching role answer", () => {
      enrollForm.setState({role: 'Librarian'});
      expect(enrollForm.find('#describe_role')).to.have.length(0);
    });
  });

  describe('CSF Intro Enroll Form', () => {
    let enrollForm;
    before(() => {
      enrollForm = shallow(
        <EnrollForm
          workshop_id={props.workshop_id}
          workshop_course="CS Fundamentals"
          workshop_subject={SubjectNames.SUBJECT_CSF_101}
          first_name={props.first_name}
          email={props.email}
          previous_courses={props.previous_courses}
          onSubmissionComplete={props.onSubmissionComplete}
        />
      );
    });

    it('displays intent question', () => {
      assert(enrollForm.exists({groupName: 'csf_intro_intent'}));
    });

    it('displays other factors question', () => {
      assert(enrollForm.exists({groupName: 'csf_intro_other_factors'}));
    });
  });

  describe('CSF Deep Dive Enroll Form', () => {
    let enrollForm;
    before(() => {
      enrollForm = shallow(
        <EnrollForm
          workshop_id={props.workshop_id}
          workshop_course="CS Fundamentals"
          workshop_subject={SubjectNames.SUBJECT_CSF_201}
          first_name={props.first_name}
          email={props.email}
          previous_courses={props.previous_courses}
          onSubmissionComplete={props.onSubmissionComplete}
        />
      );
    });

    it('does not display intent question', () => {
      assert.isFalse(enrollForm.exists({groupName: 'csf_intro_intent'}));
    });

    it('does not display other factors question', () => {
      assert.isFalse(enrollForm.exists({groupName: 'csf_intro_other_factors'}));
    });
  });

  describe('CSP Enroll Form', () => {
    let enrollForm;
    before(() => {
      enrollForm = shallow(
        <EnrollForm
          workshop_id={props.workshop_id}
          workshop_course="CS Principles"
          first_name={props.first_name}
          email={props.email}
          previous_courses={props.previous_courses}
          onSubmissionComplete={props.onSubmissionComplete}
          collect_demographics={false}
        />
      );
    });

    it('does not display role question', () => {
      expect(enrollForm.find('#role')).to.have.length(0);
    });

    it('does not display previous courses question', () => {
      expect(enrollForm.find('#previous_courses')).to.have.length(0);
    });

    it('does not display replace existing question', () => {
      expect(enrollForm.find('#replace_existing')).to.have.length(0);
    });

    it('does not display intent question', () => {
      assert.isFalse(enrollForm.exists({groupName: 'csf_intro_intent'}));
    });

    it('does not display other factors question', () => {
      assert.isFalse(enrollForm.exists({groupName: 'csf_intro_other_factors'}));
    });
  });

  describe('CSP Enroll Form with demographics', () => {
    let enrollForm;
    before(() => {
      enrollForm = shallow(
        <EnrollForm
          workshop_id={props.workshop_id}
          workshop_course="CS Principles"
          first_name={props.first_name}
          email={props.email}
          previous_courses={props.previous_courses}
          onSubmissionComplete={props.onSubmissionComplete}
          collect_demographics={true}
        />
      );
    });

    it('does display previous courses question', () => {
      expect(enrollForm.find('#previous_courses')).to.have.length(1);
    });

    it('does display replace existing question', () => {
      expect(enrollForm.find('#replace_existing')).to.have.length(1);
    });
  });

  describe('Enroll Form', () => {
    let enrollForm;
    beforeEach(() => {
      sinon.spy(jQuery, 'ajax');

      enrollForm = shallow(
        <EnrollForm
          workshop_id={props.workshop_id}
          workshop_course="CS Fundamentals"
          first_name={props.first_name}
          email={props.email}
          previous_courses={props.previous_courses}
          onSubmissionComplete={props.onSubmissionComplete}
        />
      );
    });
    afterEach(() => {
      jQuery.ajax.restore();
    });

    it('submits other school_info fields when no school_id', () => {
      const school_info = {
        school_name: 'Hogwarts School of Witchcraft and Wizardry',
        school_state: 'Washington',
        school_zip: '12345',
        school_type: 'Private school'
      };

      const params = {
        first_name: 'Rubeus',
        last_name: 'Hagrid',
        email: props.email,
        school_info: school_info,
        role: 'Librarian',
        grades_teaching: ['Kindergarten']
      };
      enrollForm.setState(params);

      const expectedSchoolInfo = {...school_info, school_type: 'private'};
      let expectedData = {...params, school_info: expectedSchoolInfo};

      enrollForm.find('#submit').simulate('click');

      expect(jQuery.ajax.calledOnce).to.be.true;
      expect(JSON.parse(jQuery.ajax.getCall(0).args[0].data)).to.deep.equal(
        expectedData
      );
    });

    it("doesn't submit other school_info fields when school_id is selected", () => {
      const params = {
        first_name: 'Rubeus',
        last_name: 'Hagrid',
        email: props.email,
        school_info: {
          school_id: '60001411118',
          school_name: 'Summit Leadership Academy High Desert',
          school_state: 'CA',
          school_type: 'charter',
          school_zip: '92345'
        },
        role: 'Librarian',
        grades_teaching: ['Kindergarten']
      };
      const expectedData = {...params, school_info: {school_id: '60001411118'}};

      enrollForm.setState(params);
      enrollForm.find('#submit').simulate('click');

      expect(jQuery.ajax.calledOnce).to.be.true;
      expect(JSON.parse(jQuery.ajax.getCall(0).args[0].data)).to.deep.equal(
        expectedData
      );
    });
  });
});
