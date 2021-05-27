import {assert} from 'chai';
import {mount} from 'enzyme';
import React from 'react';
import $ from 'jquery';
import sinon from 'sinon';
import {
  UnconnectedTeacherContentToggle as TeacherContentToggle,
  mapStateToProps
} from '@cdo/apps/code-studio/components/TeacherContentToggle';
import * as progressHelpers from '@cdo/apps/templates/progress/progressHelpers';
import * as hiddenLessonRedux from '@cdo/apps/code-studio/hiddenLessonRedux';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';

describe('TeacherContentToggle', () => {
  let div, renderElement;
  beforeEach(() => {
    // add DOM elements that our tecaher content toggle is going to take control
    // over
    div = $(`
      <div style="display: none">
        <div id="locked-lesson" style="display: none">FakeLockedLesson</div>
        <div id="hidden-lesson" style="display: none">FakeHiddenLesson</div>
        <div id="level-body" style="visibility: hidden">FakeLevelBody</div>
      </div>
    `).appendTo(document.body);

    // simulate the same way we render into the document in teacher.js
    const levelContent = $('#level-body');
    renderElement = $('<div/>').insertAfter(levelContent)[0];
  });

  afterEach(() => {
    div.remove();
    renderElement = null;
  });

  it('takes ownership of locked-lesson, hidden-lesson, and level-body elements', () => {
    const component = mount(
      <TeacherContentToggle
        isBlocklyOrDroplet={true}
        viewAs="Teacher"
        hiddenLessonsInitialized={false}
        sectionsAreLoaded={false}
        isHiddenStage={false}
        isLockedStage={false}
      />,
      {attachTo: renderElement}
    );

    const root = $(component.html());
    assert.equal(root.children().length, 3);

    // Each child element is a wrapper around the original DOM element, and
    // has unhidden the original DOM element
    const [
      contentElement,
      lockedStageElement,
      hiddenStageElement
    ] = root.children().toArray();

    assert.equal(contentElement.childNodes[0].getAttribute('id'), 'level-body');
    assert.equal(contentElement.childNodes[0].style.display, '');

    assert.equal(
      lockedStageElement.childNodes[0].getAttribute('id'),
      'locked-lesson'
    );
    assert.equal(lockedStageElement.childNodes[0].style.display, '');

    assert.equal(
      hiddenStageElement.childNodes[0].getAttribute('id'),
      'hidden-lesson'
    );
    assert.equal(hiddenStageElement.childNodes[0].style.display, '');
  });

  it('shows content immediately when viewAs Teacher', () => {
    const component = mount(
      <TeacherContentToggle
        isBlocklyOrDroplet={true}
        viewAs="Teacher"
        hiddenLessonsInitialized={false}
        sectionsAreLoaded={false}
        isHiddenStage={false}
        isLockedStage={false}
      />,
      {attachTo: renderElement}
    );

    const root = $(component.html());
    const [
      contentElement,
      lockedStageElement,
      hiddenStageElement
    ] = root.children().toArray();

    assert.equal(contentElement.style.display, '');
    assert.equal(contentElement.style.visibility, '');
    assert.equal(lockedStageElement.style.display, 'none');
    assert.equal(hiddenStageElement.style.display, 'none');
  });

  it('shows content after async calls when Teacher is authorized', () => {
    const component = mount(
      <TeacherContentToggle
        isBlocklyOrDroplet={false}
        viewAs="Teacher"
        hiddenLessonsInitialized={true}
        sectionsAreLoaded={true}
        isHiddenStage={false}
        isLockedStage={false}
      />,
      {attachTo: renderElement}
    );

    const root = $(component.html());
    const [
      contentElement,
      lockedStageElement,
      hiddenStageElement
    ] = root.children().toArray();

    assert.equal(contentElement.style.display, '');
    assert.equal(contentElement.style.visibility, '');
    assert.equal(lockedStageElement.style.display, 'none');
    assert.equal(hiddenStageElement.style.display, 'none');
  });

  it('shows lock message after async calls when Teacher is unauthorized', () => {
    const component = mount(
      <TeacherContentToggle
        isBlocklyOrDroplet={false}
        viewAs="Teacher"
        hiddenLessonsInitialized={true}
        sectionsAreLoaded={true}
        isHiddenStage={false}
        isLockedStage={true}
      />,
      {attachTo: renderElement}
    );

    const root = $(component.html());
    const [
      contentElement,
      lockedStageElement,
      hiddenStageElement
    ] = root.children().toArray();

    assert.equal(contentElement.style.display, 'none');
    assert.equal(contentElement.style.visibility, '');
    assert.equal(lockedStageElement.style.display, '');
    assert.equal(hiddenStageElement.style.display, 'none');
  });

  it('does not initially show anything when viewAs Student', () => {
    const component = mount(
      <TeacherContentToggle
        isBlocklyOrDroplet={true}
        viewAs="Student"
        hiddenLessonsInitialized={false}
        sectionsAreLoaded={false}
        isHiddenStage={false}
        isLockedStage={false}
      />,
      {attachTo: renderElement}
    );

    const root = $(component.html());
    const [
      contentElement,
      lockedStageElement,
      hiddenStageElement
    ] = root.children().toArray();

    // nothing visible
    assert.equal(contentElement.style.display, '');
    assert.equal(contentElement.style.visibility, 'hidden');
    assert.equal(lockedStageElement.style.display, 'none');
    assert.equal(hiddenStageElement.style.display, 'none');
  });

  it('does show hidden stage message once initialized when viewAs Student', () => {
    const component = mount(
      <TeacherContentToggle
        isBlocklyOrDroplet={true}
        viewAs="Student"
        hiddenLessonsInitialized={false}
        sectionsAreLoaded={false}
        isHiddenStage={false}
        isLockedStage={false}
      />,
      {attachTo: renderElement}
    );

    component.setProps({
      hiddenLessonsInitialized: true,
      isHiddenStage: true
    });

    let root = $(component.html());
    let [
      contentElement,
      lockedStageElement,
      hiddenStageElement
    ] = root.children().toArray();

    // content is hidden, hiddenLesson is visible
    assert.equal(contentElement.style.display, '');
    assert.equal(contentElement.style.visibility, 'hidden');
    assert.equal(lockedStageElement.style.display, 'none');
    assert.equal(hiddenStageElement.style.display, '');

    component.setProps({
      isBlocklyOrDroplet: false
    });
    root = $(component.html());
    [
      contentElement,
      lockedStageElement,
      hiddenStageElement
    ] = root.children().toArray();
    // same thing, but we also set display:none on content
    assert.equal(contentElement.style.display, 'none');
    assert.equal(contentElement.style.visibility, 'hidden');
    assert.equal(lockedStageElement.style.display, 'none');
    assert.equal(hiddenStageElement.style.display, '');
  });

  it('does show locked stage message once initialized when viewAs Student', () => {
    const component = mount(
      <TeacherContentToggle
        isBlocklyOrDroplet={true}
        viewAs="Student"
        hiddenLessonsInitialized={false}
        sectionsAreLoaded={false}
        isHiddenStage={false}
        isLockedStage={false}
      />,
      {attachTo: renderElement}
    );

    component.setProps({
      sectionsAreLoaded: true,
      isLockedStage: true
    });

    let root = $(component.html());
    let [
      contentElement,
      lockedStageElement,
      hiddenStageElement
    ] = root.children().toArray();

    // content is hidden, hiddenLesson is visible
    assert.equal(contentElement.style.display, '');
    assert.equal(contentElement.style.visibility, 'hidden');
    assert.equal(lockedStageElement.style.display, '');
    assert.equal(hiddenStageElement.style.display, 'none');

    component.setProps({
      isBlocklyOrDroplet: false
    });
    root = $(component.html());
    [
      contentElement,
      lockedStageElement,
      hiddenStageElement
    ] = root.children().toArray();
    // same thing, but we also set display:none on content
    assert.equal(contentElement.style.display, 'none');
    assert.equal(contentElement.style.visibility, 'hidden');
    assert.equal(lockedStageElement.style.display, '');
    assert.equal(hiddenStageElement.style.display, 'none');
  });

  it('shows hidden message when viewAs student if locked and hidden', () => {
    const component = mount(
      <TeacherContentToggle
        isBlocklyOrDroplet={true}
        viewAs="Student"
        hiddenLessonsInitialized={false}
        sectionsAreLoaded={false}
        isHiddenStage={false}
        isLockedStage={false}
      />,
      {attachTo: renderElement}
    );

    component.setProps({
      sectionsAreLoaded: true,
      isLockedStage: true,
      hiddenLessonsInitialized: true,
      isHiddenStage: true
    });

    const root = $(component.html());
    const [
      contentElement,
      lockedStageElement,
      hiddenStageElement
    ] = root.children().toArray();

    // content is hidden, hiddenLesson is visible
    assert.equal(contentElement.style.display, '');
    assert.equal(contentElement.style.visibility, 'hidden');
    assert.equal(lockedStageElement.style.display, 'none');
    assert.equal(hiddenStageElement.style.display, '');

    component.setProps({
      isBlocklyOrDroplet: false
    });
  });

  it('shows content after async calls if neither locked nor hidden', () => {
    const component = mount(
      <TeacherContentToggle
        isBlocklyOrDroplet={true}
        viewAs="Student"
        hiddenLessonsInitialized={false}
        sectionsAreLoaded={false}
        isHiddenStage={false}
        isLockedStage={false}
      />,
      {attachTo: renderElement}
    );

    component.setProps({
      sectionsAreLoaded: true,
      isLockedStage: false,
      hiddenLessonsInitialized: true,
      isHiddenStage: false
    });

    const root = $(component.html());
    const [
      contentElement,
      lockedStageElement,
      hiddenStageElement
    ] = root.children().toArray();

    // content is hidden, hiddenLesson is visible
    assert.equal(contentElement.style.display, '');
    assert.equal(contentElement.style.visibility, '');
    assert.equal(lockedStageElement.style.display, 'none');
    assert.equal(hiddenStageElement.style.display, 'none');

    component.setProps({
      isBlocklyOrDroplet: false
    });
  });

  describe('mapStateToProps', () => {
    afterEach(() => {
      progressHelpers.lessonIsLockedForAllStudents.restore &&
        progressHelpers.lessonIsLockedForAllStudents.restore();
      hiddenLessonRedux.isLessonHiddenForSection.restore &&
        hiddenLessonRedux.isLessonHiddenForSection.restore();
    });

    describe('when viewing as student', () => {
      const state = {
        viewAs: ViewType.Student,
        selectedSectionId: {},
        progress: {},
        teacherSections: {},
        hiddenLesson: {},
        verifiedTeacher: {}
      };

      it('sets locked hidden to true when locked and hidden', () => {
        sinon
          .stub(progressHelpers, 'lessonIsLockedForAllStudents')
          .returns(true);
        sinon.stub(hiddenLessonRedux, 'isLessonHiddenForSection').returns(true);

        const props = mapStateToProps(state);

        assert.strictEqual(props.isHiddenStage, true);
        assert.strictEqual(props.isLockedStage, true);
      });

      it('sets locked hidden to false when not locked or hidden', () => {
        sinon
          .stub(progressHelpers, 'lessonIsLockedForAllStudents')
          .returns(false);
        sinon
          .stub(hiddenLessonRedux, 'isLessonHiddenForSection')
          .returns(false);

        const props = mapStateToProps(state);

        assert.strictEqual(props.isHiddenStage, false);
        assert.strictEqual(props.isLockedStage, false);
      });
    });

    describe('when viewing as teacher', () => {
      const state = {
        viewAs: ViewType.Teacher,
        selectedSectionId: {},
        progress: {
          currentLessonId: 123,
          stages: [
            {
              id: 123,
              lockable: true
            }
          ]
        },
        teacherSections: {},
        hiddenLesson: {},
        verifiedTeacher: {
          isVerified: true
        }
      };

      const stateUnverified = {
        ...state,
        verifiedTeacher: {
          isVerified: false
        }
      };

      it('sets locked/hidden to false', () => {
        sinon.spy(progressHelpers, 'lessonIsLockedForAllStudents');
        sinon.spy(hiddenLessonRedux, 'isLessonHiddenForSection');

        const props = mapStateToProps(state);

        assert.strictEqual(props.isHiddenStage, false);
        assert.strictEqual(props.isLockedStage, false);
        assert.strictEqual(
          progressHelpers.lessonIsLockedForAllStudents.called,
          false
        );
        assert.strictEqual(
          hiddenLessonRedux.isLessonHiddenForSection.called,
          false
        );
      });

      it('sets lockable to true for unverified teacher, when stage is lockable', () => {
        const props = mapStateToProps(stateUnverified);

        assert.strictEqual(props.isHiddenStage, false);
        assert.strictEqual(props.isLockedStage, true);
      });
    });
  });
});
