import {fireEvent, render, screen, within} from '@testing-library/react';
import React from 'react';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import {updateHiddenScript} from '@cdo/apps/code-studio/hiddenLessonRedux';
import {UnconnectedMultipleSectionsAssigner as MultipleSectionsAssigner} from '@cdo/apps/templates/MultipleSectionsAssigner';
import {fakeTeacherSectionsForDropdown} from '@cdo/apps/templates/teacherDashboard/sectionAssignmentTestHelper';
import {
  assignToSection,
  unassignSection,
  sectionHasNewData,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import i18n from '@cdo/locale';

import {expect} from '../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

describe('MultipleSectionsAssigner', () => {
  const assignedSingleUnitCourseSection = fakeTeacherSectionsForDropdown[3];
  const assignedCourseButNOTUnitSection = fakeTeacherSectionsForDropdown[4];
  const assignedCourseANDUnitSection = fakeTeacherSectionsForDropdown[5];
  const unassignedSection = fakeTeacherSectionsForDropdown[2];
  const assignedSection = fakeTeacherSectionsForDropdown[1];
  const defaultProps = {
    assignmentName: 'testing section',
    onClose: () => {},
    sections: fakeTeacherSectionsForDropdown,
    unassignSection: unassignSection,
    assignToSection: assignToSection,
    updateHiddenScript: updateHiddenScript,
    participantAudience: 'student',
    isAssigningCourseOnly: true,
    sectionHasNewData: sectionHasNewData,
  };

  const setUp = (overrideProps = {}) => {
    const props = {...defaultProps, ...overrideProps};
    return render(<MultipleSectionsAssigner {...props} />);
  };

  const checkboxFor = section =>
    screen.getByRole('checkbox', {name: section.name});

  const queryCheckboxFor = section =>
    screen.queryByRole('checkbox', {name: section.name});

  const clickConfirm = () =>
    fireEvent.click(
      screen.getByRole('button', {name: i18n.confirmAssignment()})
    );

  it('renders checked and unchecked checkboxes for sections on the UNIT landing page', () => {
    setUp({
      isAssigningCourseOnly: false,
      courseId: assignedCourseANDUnitSection.courseId,
      isSingleUnitCourse: false,
      scriptId: assignedCourseANDUnitSection.unitId,
    });

    expect(checkboxFor(assignedCourseANDUnitSection).checked).to.be.true;
    expect(checkboxFor(assignedCourseButNOTUnitSection).checked).to.be.false;
  });

  it('renders checked and unchecked checkboxes for sections on the COURSE landing page', () => {
    setUp({
      isAssigningCourseOnly: true,
      courseId: assignedCourseANDUnitSection.courseId,
      isSingleUnitCourse: false,
      scriptId: assignedCourseANDUnitSection.unitId,
    });

    expect(checkboxFor(assignedCourseANDUnitSection).checked).to.be.true;
    expect(checkboxFor(assignedCourseButNOTUnitSection).checked).to.be.true;
    expect(checkboxFor(unassignedSection).checked).to.be.false;
    expect(checkboxFor(assignedSection).checked).to.be.false;
  });

  it('renders all student sections for a student course', () => {
    setUp({
      isAssigningCourseOnly: true,
      courseId: assignedCourseANDUnitSection.courseId,
      isSingleUnitCourse: false,
      scriptId: assignedCourseANDUnitSection.unitId,
      courseOfferingId: assignedCourseANDUnitSection.courseOfferingId,
      courseVersionId: assignedCourseANDUnitSection.courseVersionId,
    });

    fakeTeacherSectionsForDropdown
      .filter(section => section.participantType === 'student')
      .forEach(section => {
        expect(queryCheckboxFor(section), `expected ${section.name}`).to.exist;
      });

    fakeTeacherSectionsForDropdown
      .filter(section => section.participantType === 'teacher')
      .forEach(section => {
        expect(queryCheckboxFor(section), `expected ${section.name} absent`).to
          .be.null;
      });
  });

  it('renders all teacher sections for a teacher course', () => {
    setUp({
      isAssigningCourseOnly: true,
      courseId: assignedCourseANDUnitSection.courseId,
      isSingleUnitCourse: false,
      scriptId: assignedCourseANDUnitSection.unitId,
      courseOfferingId: assignedCourseANDUnitSection.courseOfferingId,
      courseVersionId: assignedCourseANDUnitSection.courseVersionId,
      participantAudience: 'teacher',
    });

    fakeTeacherSectionsForDropdown
      .filter(section => section.participantType === 'teacher')
      .forEach(section => {
        expect(queryCheckboxFor(section), `expected ${section.name}`).to.exist;
      });

    fakeTeacherSectionsForDropdown
      .filter(section => section.participantType === 'student')
      .forEach(section => {
        expect(queryCheckboxFor(section), `expected ${section.name} absent`).to
          .be.null;
      });
  });

  it('unassigns a unit but keeps the course assignment on the UNIT landing page of a non-standalone course when checkbox is unchecked', () => {
    const assignToSection = sinon.fake();
    const reassignConfirm = sinon.fake();

    setUp({
      isAssigningCourseOnly: false,
      courseId: assignedCourseANDUnitSection.courseId,
      isSingleUnitCourse: false,
      scriptId: assignedCourseANDUnitSection.unitId,
      assignToSection,
      reassignConfirm,
      courseOfferingId: assignedCourseANDUnitSection.courseOfferingId,
      courseVersionId: assignedCourseANDUnitSection.courseVersionId,
    });

    fireEvent.click(checkboxFor(assignedCourseANDUnitSection));
    expect(checkboxFor(assignedCourseANDUnitSection).checked).to.be.false;

    clickConfirm();

    expect(assignToSection).to.have.been.calledOnce;
    expect(reassignConfirm).to.have.been.calledOnce;
    expect(assignToSection).to.have.been.calledWith(
      assignedCourseANDUnitSection.id,
      assignedCourseANDUnitSection.courseId,
      assignedCourseANDUnitSection.courseOfferingId,
      assignedCourseANDUnitSection.courseVersionId
    );
  });

  it('assigns a unit on the unit landing page of SINGLE-UNIT course when checkbox is checked', () => {
    const assignToSection = sinon.fake();
    const reassignConfirm = sinon.fake();
    const updateHiddenScript = sinon.fake();

    setUp({
      isAssigningCourseOnly: false,
      courseId: assignedSingleUnitCourseSection.courseId,
      isSingleUnitCourse: true,
      scriptId: assignedSingleUnitCourseSection.unitId,
      assignToSection,
      reassignConfirm,
      updateHiddenScript,
      courseOfferingId: assignedSingleUnitCourseSection.courseOfferingId,
      courseVersionId: assignedSingleUnitCourseSection.courseVersionId,
    });

    fireEvent.click(checkboxFor(unassignedSection));
    expect(checkboxFor(unassignedSection).checked).to.be.true;

    clickConfirm();

    expect(updateHiddenScript).to.have.been.calledOnce;
    expect(assignToSection).to.have.been.calledOnce;
    expect(assignToSection).to.have.been.calledWith(
      unassignedSection.id,
      assignedSingleUnitCourseSection.courseId,
      assignedSingleUnitCourseSection.courseOfferingId,
      assignedSingleUnitCourseSection.courseVersionId,
      assignedSingleUnitCourseSection.unitId
    );
  });

  it('unassigns a unit on the unit landing page of SINGLE-UNIT course when checkbox is unchecked', () => {
    const unassignSection = sinon.fake();
    const reassignConfirm = sinon.fake();

    setUp({
      isAssigningCourseOnly: false,
      courseId: assignedSingleUnitCourseSection.courseId,
      isSingleUnitCourse: true,
      scriptId: assignedSingleUnitCourseSection.unitId,
      unassignSection,
      reassignConfirm,
      courseOfferingId: assignedSingleUnitCourseSection.courseOfferingId,
      courseVersionId: assignedSingleUnitCourseSection.courseVersionId,
    });

    fireEvent.click(checkboxFor(assignedSingleUnitCourseSection));
    expect(checkboxFor(assignedSingleUnitCourseSection).checked).to.be.false;

    clickConfirm();

    expect(unassignSection).to.have.been.calledOnce;
    expect(reassignConfirm).to.have.been.calledOnce;
    expect(unassignSection).to.have.been.calledWith(
      assignedSingleUnitCourseSection.id
    );
  });

  it('assigns a unit on the UNIT landing page of non-standalone course when checkbox is checked', () => {
    const reassignConfirm = sinon.fake();
    const assignToSection = sinon.fake();
    const updateHiddenScript = sinon.fake();

    setUp({
      isAssigningCourseOnly: false,
      courseId: assignedCourseANDUnitSection.courseId,
      isSingleUnitCourse: false,
      scriptId: assignedCourseANDUnitSection.unitId,
      reassignConfirm,
      assignToSection,
      updateHiddenScript,
      courseOfferingId: assignedCourseANDUnitSection.courseOfferingId,
      courseVersionId: assignedCourseANDUnitSection.courseVersionId,
    });

    fireEvent.click(checkboxFor(unassignedSection));
    expect(checkboxFor(unassignedSection).checked).to.be.true;

    clickConfirm();

    expect(updateHiddenScript).to.have.been.calledOnce;
    expect(assignToSection).to.have.been.calledOnce;
    expect(reassignConfirm).to.have.been.calledOnce;
    expect(assignToSection).to.have.been.calledWith(
      unassignedSection.id,
      assignedCourseANDUnitSection.courseId,
      assignedCourseANDUnitSection.courseOfferingId,
      assignedCourseANDUnitSection.courseVersionId,
      assignedCourseANDUnitSection.unitId
    );
  });

  it('unassigns a course on the COURSE landing page checkbox is unchecked', () => {
    const unassignSection = sinon.fake();
    const reassignConfirm = sinon.fake();

    setUp({
      isAssigningCourseOnly: true,
      courseId: assignedCourseANDUnitSection.courseId,
      isSingleUnitCourse: false,
      scriptId: assignedCourseANDUnitSection.unitId,
      unassignSection,
      reassignConfirm,
      courseOfferingId: assignedCourseANDUnitSection.courseOfferingId,
      courseVersionId: assignedCourseANDUnitSection.courseVersionId,
    });

    fireEvent.click(checkboxFor(assignedCourseANDUnitSection));
    expect(checkboxFor(assignedCourseANDUnitSection).checked).to.be.false;

    clickConfirm();

    expect(unassignSection).to.have.been.calledOnce;
    expect(reassignConfirm).to.have.been.calledOnce;
    expect(unassignSection).to.have.been.calledWith(
      assignedCourseANDUnitSection.id,
      ''
    );
  });

  it('assigns a course on the COURSE landing page checkbox is checked', () => {
    const assignToSection = sinon.fake();
    const reassignConfirm = sinon.fake();

    setUp({
      isAssigningCourseOnly: true,
      courseId: assignedCourseANDUnitSection.courseId,
      isSingleUnitCourse: false,
      scriptId: assignedCourseANDUnitSection.unitId,
      assignToSection,
      reassignConfirm,
      courseOfferingId: assignedCourseANDUnitSection.courseOfferingId,
      courseVersionId: assignedCourseANDUnitSection.courseVersionId,
    });

    fireEvent.click(checkboxFor(unassignedSection));
    expect(checkboxFor(unassignedSection).checked).to.be.true;

    clickConfirm();

    expect(assignToSection).to.have.been.calledOnce;
    expect(reassignConfirm).to.have.been.calledOnce;
    expect(assignToSection).to.have.been.calledWith(
      unassignedSection.id,
      assignedCourseANDUnitSection.courseId,
      assignedCourseANDUnitSection.courseOfferingId,
      assignedCourseANDUnitSection.courseVersionId,
      assignedCourseANDUnitSection.unitId
    );
  });

  it('can select all sections using the `select all` link', () => {
    const {container} = setUp({
      isAssigningCourseOnly: false,
      courseId: assignedCourseANDUnitSection.courseId,
      isSingleUnitCourse: false,
      scriptId: assignedCourseANDUnitSection.unitId,
    });

    fireEvent.click(
      container.ownerDocument.querySelector('#select-all-sections')
    );

    within(document.body)
      .getAllByRole('checkbox')
      .forEach(input => expect(input.checked).to.be.true);
  });
});
