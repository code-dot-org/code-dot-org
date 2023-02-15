import React from 'react';
import {mount, shallow} from 'enzyme';
import sinon from 'sinon';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {assert} from '../../../util/reconfiguredChai';
import {UnconnectedEditSectionForm as EditSectionForm} from '@cdo/apps/templates/teacherDashboard/EditSectionForm';
import {
  courseOfferings,
  testSection,
  noStudentsSection
} from '@cdo/apps/templates/teacherDashboard/teacherDashboardTestHelpers';
import {SectionLoginType} from '@cdo/apps/util/sharedConstants';

describe('EditSectionForm', () => {
  it('renders LoginTypeField with word and picture options for word sections with students', () => {
    const wrapper = mount(
      <EditSectionForm
        title="Edit section details"
        handleSave={() => {}}
        handleClose={() => {}}
        editSectionProperties={() => {}}
        courseOfferings={courseOfferings}
        sections={{}}
        section={testSection}
        isSaveInProgress={false}
        hiddenLessonState={{}}
        updateHiddenScript={() => {}}
        assignedUnitName="script name"
        assignedUnitLessonExtrasAvailable={false}
        assignedUnitTextToSpeechEnabled={false}
      />
    );
    const loginTypeField = wrapper.find('LoginTypeField');
    assert.equal(loginTypeField.length, 1);
    assert.equal(loginTypeField.find('option').length, 2);
    assert.equal(
      loginTypeField
        .find('option')
        .at(0)
        .props().value,
      SectionLoginType.word
    );
    assert.equal(
      loginTypeField
        .find('option')
        .at(1)
        .props().value,
      SectionLoginType.picture
    );
  });
  it('renders LoginTypeField with word and picture options for word sections without students', () => {
    const wrapper = mount(
      <EditSectionForm
        title="Edit section details"
        handleSave={() => {}}
        handleClose={() => {}}
        editSectionProperties={() => {}}
        courseOfferings={courseOfferings}
        sections={{}}
        section={noStudentsSection}
        isSaveInProgress={false}
        hiddenLessonState={{}}
        updateHiddenScript={() => {}}
        assignedUnitName="script name"
        assignedUnitLessonExtrasAvailable={false}
        assignedUnitTextToSpeechEnabled={false}
      />
    );
    const loginTypeField = wrapper.find('LoginTypeField');
    assert.equal(loginTypeField.length, 1);
    assert.equal(loginTypeField.find('option').length, 2);
    assert.equal(
      loginTypeField
        .find('option')
        .at(0)
        .props().value,
      SectionLoginType.word
    );
    assert.equal(
      loginTypeField
        .find('option')
        .at(1)
        .props().value,
      SectionLoginType.picture
    );
  });
  it('renders LoginTypeField with word and picture options for picture sections with students', () => {
    const wrapper = mount(
      <EditSectionForm
        title="Edit section details"
        handleSave={() => {}}
        handleClose={() => {}}
        editSectionProperties={() => {}}
        courseOfferings={courseOfferings}
        sections={{}}
        section={{
          ...testSection,
          loginType: SectionLoginType.picture
        }}
        isSaveInProgress={false}
        hiddenLessonState={{}}
        updateHiddenScript={() => {}}
        assignedUnitName="script name"
        assignedUnitLessonExtrasAvailable={false}
        assignedUnitTextToSpeechEnabled={false}
      />
    );
    const loginTypeField = wrapper.find('LoginTypeField');
    assert.equal(loginTypeField.length, 1);
    assert.equal(loginTypeField.find('option').length, 2);
    assert.equal(
      loginTypeField
        .find('option')
        .at(0)
        .props().value,
      SectionLoginType.word
    );
    assert.equal(
      loginTypeField
        .find('option')
        .at(1)
        .props().value,
      SectionLoginType.picture
    );
  });
  it('renders LoginTypeField with word and picture options for picture sections without students', () => {
    const wrapper = mount(
      <EditSectionForm
        title="Edit section details"
        handleSave={() => {}}
        handleClose={() => {}}
        editSectionProperties={() => {}}
        courseOfferings={courseOfferings}
        sections={{}}
        section={{
          ...noStudentsSection,
          loginType: SectionLoginType.picture
        }}
        isSaveInProgress={false}
        hiddenLessonState={{}}
        updateHiddenScript={() => {}}
        assignedUnitName="script name"
        assignedUnitLessonExtrasAvailable={false}
        assignedUnitTextToSpeechEnabled={false}
      />
    );
    const loginTypeField = wrapper.find('LoginTypeField');
    assert.equal(loginTypeField.length, 1);
    assert.equal(loginTypeField.find('option').length, 2);
    assert.equal(
      loginTypeField
        .find('option')
        .at(0)
        .props().value,
      SectionLoginType.word
    );
    assert.equal(
      loginTypeField
        .find('option')
        .at(1)
        .props().value,
      SectionLoginType.picture
    );
  });
  it('does not render LoginTypeField for personal email sections with students', () => {
    const wrapper = mount(
      <EditSectionForm
        title="Edit section details"
        handleSave={() => {}}
        handleClose={() => {}}
        editSectionProperties={() => {}}
        courseOfferings={courseOfferings}
        sections={{}}
        section={{
          ...testSection,
          loginType: SectionLoginType.email
        }}
        isSaveInProgress={false}
        hiddenLessonState={{}}
        updateHiddenScript={() => {}}
        assignedUnitName="script name"
        assignedUnitLessonExtrasAvailable={false}
        assignedUnitTextToSpeechEnabled={false}
      />
    );
    const loginTypeField = wrapper.find('LoginTypeField');
    assert.equal(loginTypeField.length, 0);
  });
  it('does not render LoginTypeField for personal email sections without students', () => {
    const wrapper = mount(
      <EditSectionForm
        title="Edit section details"
        handleSave={() => {}}
        handleClose={() => {}}
        editSectionProperties={() => {}}
        courseOfferings={courseOfferings}
        sections={{}}
        section={{
          ...noStudentsSection,
          loginType: SectionLoginType.email
        }}
        isSaveInProgress={false}
        hiddenLessonState={{}}
        updateHiddenScript={() => {}}
        assignedUnitName="script name"
        assignedUnitTextToSpeechEnabled={false}
        assignedUnitLessonExtrasAvailable={false}
      />
    );
    const loginTypeField = wrapper.find('LoginTypeField');
    assert.equal(loginTypeField.length, 0);
  });
  it('does not render LoginTypeField for Google Classroom sections with students', () => {
    const wrapper = mount(
      <EditSectionForm
        title="Edit section details"
        handleSave={() => {}}
        handleClose={() => {}}
        editSectionProperties={() => {}}
        courseOfferings={courseOfferings}
        sections={{}}
        section={{
          ...testSection,
          loginType: SectionLoginType.google_classroom
        }}
        isSaveInProgress={false}
        hiddenLessonState={{}}
        updateHiddenScript={() => {}}
        assignedUnitName="script name"
        assignedUnitTextToSpeechEnabled={false}
        assignedUnitLessonExtrasAvailable={false}
      />
    );
    const loginTypeField = wrapper.find('LoginTypeField');
    assert.equal(loginTypeField.length, 0);
  });
  it('does not render LoginTypeField for Google Classroom sections without students', () => {
    const wrapper = mount(
      <EditSectionForm
        title="Edit section details"
        handleSave={() => {}}
        handleClose={() => {}}
        editSectionProperties={() => {}}
        courseOfferings={courseOfferings}
        sections={{}}
        section={{
          ...noStudentsSection,
          loginType: SectionLoginType.google_classroom
        }}
        isSaveInProgress={false}
        hiddenLessonState={{}}
        updateHiddenScript={() => {}}
        assignedUnitName="script name"
        assignedUnitTextToSpeechEnabled={false}
        assignedUnitLessonExtrasAvailable={false}
      />
    );
    const loginTypeField = wrapper.find('LoginTypeField');
    assert.equal(loginTypeField.length, 0);
  });
  it('does not render LoginTypeField for Clever sections with students', () => {
    const wrapper = mount(
      <EditSectionForm
        title="Edit section details"
        handleSave={() => {}}
        handleClose={() => {}}
        editSectionProperties={() => {}}
        courseOfferings={courseOfferings}
        sections={{}}
        section={{
          ...testSection,
          loginType: SectionLoginType.clever
        }}
        isSaveInProgress={false}
        hiddenLessonState={{}}
        updateHiddenScript={() => {}}
        assignedUnitName="script name"
        assignedUnitLessonExtrasAvailable={false}
        assignedUnitTextToSpeechEnabled={false}
      />
    );
    const loginTypeField = wrapper.find('LoginTypeField');
    assert.equal(loginTypeField.length, 0);
  });
  it('does not render LoginTypeField for Clever sections without students', () => {
    const wrapper = mount(
      <EditSectionForm
        title="Edit section details"
        handleSave={() => {}}
        handleClose={() => {}}
        editSectionProperties={() => {}}
        courseOfferings={courseOfferings}
        sections={{}}
        section={{
          ...noStudentsSection,
          loginType: SectionLoginType.clever
        }}
        isSaveInProgress={false}
        hiddenLessonState={{}}
        updateHiddenScript={() => {}}
        assignedUnitName="script name"
        assignedUnitLessonExtrasAvailable={false}
        assignedUnitTextToSpeechEnabled={false}
      />
    );
    const loginTypeField = wrapper.find('LoginTypeField');
    assert.equal(loginTypeField.length, 0);
  });

  it('does not render TtsAutoplayField when assignedUnitTextToSpeechEnabled is false', () => {
    const wrapper = mount(
      <EditSectionForm
        title="Edit section details"
        localeCode="en_us"
        handleSave={() => {}}
        handleClose={() => {}}
        editSectionProperties={() => {}}
        courseOfferings={courseOfferings}
        sections={{}}
        section={{
          ...noStudentsSection,
          loginType: SectionLoginType.clever
        }}
        isSaveInProgress={false}
        hiddenLessonState={{}}
        updateHiddenScript={() => {}}
        assignedUnitName="script name"
        assignedUnitLessonExtrasAvailable={false}
        assignedUnitTextToSpeechEnabled={false}
      />
    );
    const ttsAutoplayField = wrapper.find('TtsAutoplayField');
    assert.equal(ttsAutoplayField.length, 0);
  });

  it('renders TtsAutoplayField when assignedUnitTextToSpeechEnabled is true', () => {
    const wrapper = mount(
      <EditSectionForm
        title="Edit section details"
        localeCode="en_us"
        handleSave={() => {}}
        handleClose={() => {}}
        editSectionProperties={() => {}}
        courseOfferings={courseOfferings}
        sections={{}}
        section={{
          ...noStudentsSection,
          loginType: SectionLoginType.clever
        }}
        isSaveInProgress={false}
        hiddenLessonState={{}}
        updateHiddenScript={() => {}}
        assignedUnitName="script name"
        assignedUnitLessonExtrasAvailable={false}
        assignedUnitTextToSpeechEnabled={true}
      />
    );
    const ttsAutoplayField = wrapper.find('TtsAutoplayField');
    assert.equal(ttsAutoplayField.length, 1);
  });

  it('does not render LessonExtrasField when assignedUnitLessonExtrasAvailable is false', () => {
    const wrapper = mount(
      <EditSectionForm
        title="Edit section details"
        handleSave={() => {}}
        handleClose={() => {}}
        editSectionProperties={() => {}}
        courseOfferings={courseOfferings}
        sections={{}}
        section={{
          ...noStudentsSection,
          loginType: SectionLoginType.clever
        }}
        isSaveInProgress={false}
        hiddenLessonState={{}}
        updateHiddenScript={() => {}}
        assignedUnitName="script name"
        assignedUnitLessonExtrasAvailable={false}
        assignedUnitTextToSpeechEnabled={false}
      />
    );
    const lessonExtrasField = wrapper.find('LessonExtrasField');
    assert.equal(lessonExtrasField.length, 0);
  });

  it('renders LessonExtrasField when assignedUnitLessonExtrasAvailable is true', () => {
    const wrapper = mount(
      <EditSectionForm
        title="Edit section details"
        handleSave={() => {}}
        handleClose={() => {}}
        editSectionProperties={() => {}}
        courseOfferings={courseOfferings}
        sections={{}}
        section={{
          ...noStudentsSection,
          loginType: SectionLoginType.clever
        }}
        isSaveInProgress={false}
        hiddenLessonState={{}}
        updateHiddenScript={() => {}}
        assignedUnitName="script name"
        assignedUnitLessonExtrasAvailable={true}
        assignedUnitTextToSpeechEnabled={false}
      />
    );
    const lessonExtrasField = wrapper.find('LessonExtrasField');
    assert.equal(lessonExtrasField.length, 1);
  });

  it('sends completed events when save is clicked', () => {
    const wrapper = shallow(
      <EditSectionForm
        isNewSection={true}
        initialUnitId={7}
        initialCourseVersionId={5}
        initialCourseOfferingId={3}
        title="Create a new section"
        handleSave={async () => {}}
        handleClose={() => {}}
        editSectionProperties={() => {}}
        courseOfferings={courseOfferings}
        sections={{}}
        section={testSection}
        isSaveInProgress={false}
        hiddenLessonState={{}}
        updateHiddenScript={() => {}}
        assignedUnitName="script name"
        assignedUnitLessonExtrasAvailable={false}
        assignedUnitTextToSpeechEnabled={false}
      />
    );

    const analyticsSpy = sinon.spy(analyticsReporter, 'sendEvent');

    wrapper.find('Button[text="Save"]').simulate('click');
    assert(analyticsSpy.calledTwice);
    assert.equal(analyticsSpy.getCall(0).firstArg, 'Section Setup Completed');
    assert.deepEqual(analyticsSpy.getCall(0).lastArg, {
      sectionCurriculum: courseOfferings[testSection.courseOfferingId].id,
      sectionCurriculumLocalizedName:
        courseOfferings[testSection.courseOfferingId].display_name,
      sectionCurriculumVersionYear: '2017',
      sectionGrade: testSection.grade,
      sectionLockSelection: testSection.restrictSection,
      sectionName: testSection.name,
      sectionPairProgramSelection: testSection.pairingAllowed,
      sectionUnitId: null
    });

    assert.equal(
      analyticsSpy.getCall(1).firstArg,
      'Section Curriculum Assigned'
    );
    assert.deepEqual(analyticsSpy.getCall(1).lastArg, {
      sectionName: testSection.name,
      sectionId: testSection.id,
      sectionLoginType: testSection.loginType,
      previousUnitId: 7,
      previousCourseId: 3,
      previousCourseVersionId: 5,
      previousVersionYear: '2022',
      newUnitId: null,
      newCourseId: courseOfferings[testSection.courseOfferingId].id,
      newCourseVersionId: Object.values(
        courseOfferings[testSection.courseOfferingId].course_versions
      ).find(cv => cv.key === '2017').id,
      newVersionYear: '2017'
    });

    analyticsSpy.restore();
  });

  it('sends cancelled event when cancel is clicked', () => {
    const wrapper = shallow(
      <EditSectionForm
        isNewSection={true}
        initialUnitId={7}
        initialCourseVersionId={5}
        initialCourseOfferingId={3}
        title="Create a new section"
        handleSave={async () => {}}
        handleClose={() => {}}
        editSectionProperties={() => {}}
        courseOfferings={courseOfferings}
        sections={{}}
        section={testSection}
        isSaveInProgress={false}
        hiddenLessonState={{}}
        updateHiddenScript={() => {}}
        assignedUnitName="script name"
        assignedUnitLessonExtrasAvailable={false}
        assignedUnitTextToSpeechEnabled={false}
      />
    );

    const analyticsSpy = sinon.spy(analyticsReporter, 'sendEvent');

    wrapper.find('Button[text="Cancel"]').simulate('click');
    assert(analyticsSpy.calledOnce);
    assert.equal(analyticsSpy.getCall(0).firstArg, 'Section Setup Cancelled');
    assert.deepEqual(analyticsSpy.getCall(0).lastArg, {
      sectionCurriculum: courseOfferings[testSection.courseOfferingId].id,
      sectionCurriculumLocalizedName:
        courseOfferings[testSection.courseOfferingId].display_name,
      sectionCurriculumVersionYear: '2017',
      sectionGrade: testSection.grade,
      sectionLockSelection: testSection.restrictSection,
      sectionName: testSection.name,
      sectionPairProgramSelection: testSection.pairingAllowed,
      sectionUnitId: null
    });

    analyticsSpy.restore();
  });
});
