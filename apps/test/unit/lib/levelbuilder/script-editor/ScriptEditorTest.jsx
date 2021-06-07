import React from 'react';
import {mount} from 'enzyme';
import ScriptEditor from '@cdo/apps/lib/levelbuilder/script-editor/ScriptEditor';
import {assert, expect} from '../../../../util/reconfiguredChai';
import ResourceType from '@cdo/apps/templates/courseOverview/resourceType';
import {Provider} from 'react-redux';
import isRtl from '@cdo/apps/code-studio/isRtlRedux';
import reducers, {
  init
} from '@cdo/apps/lib/levelbuilder/script-editor/scriptEditorRedux';
import {
  stubRedux,
  restoreRedux,
  getStore,
  registerReducers
} from '@cdo/apps/redux';
import createResourcesReducer, {
  initResources
} from '@cdo/apps/lib/levelbuilder/lesson-editor/resourcesEditorRedux';
import sinon from 'sinon';
import * as utils from '@cdo/apps/utils';
import $ from 'jquery';

describe('ScriptEditor', () => {
  let defaultProps, store;
  beforeEach(() => {
    sinon.stub(utils, 'navigateToHref');
    stubRedux();

    registerReducers({
      ...reducers,
      isRtl,
      resources: createResourcesReducer('teacherResource'),
      studentResources: createResourcesReducer('studentResource')
    });
    store = getStore();
    store.dispatch(
      init(
        [
          {
            bigQuestions: '* One↵* two',
            description: 'laklkldkla"',
            displayName: 'Content',
            key: 'lesson group',
            lessons: [],
            position: 1,
            userFacing: true
          }
        ],
        {}
      )
    );
    store.dispatch(initResources([]));

    defaultProps = {
      id: 1,
      initialAnnouncements: [],
      curriculumUmbrella: 'CSF',
      i18nData: {
        lessonDescriptions: [],
        description:
          '# TEACHER Title \n This is the unit description with [link](https://studio.code.org/home) **Bold** *italics*',
        studentDescription:
          '# STUDENT Title \n This is the unit description with [link](https://studio.code.org/home) **Bold** *italics*'
      },
      isLevelbuilder: true,
      locales: [],
      name: 'test-script',
      scriptFamilies: [],
      teacherResources: [],
      versionYearOptions: [],
      initialFamilyName: '',
      initialTeacherResources: [],
      initialProjectSharing: false,
      initialLocales: [],
      isMigrated: false,
      initialIsStable: false,
      initialHidden: true,
      hasCourse: false,
      scriptPath: '/s/test-script',
      initialLessonLevelData:
        "lesson_group 'lesson group', display_name: 'lesson group display name'\nlesson 'new lesson', display_name: 'lesson display name', has_lesson_plan: true\n"
    };
  });

  afterEach(() => {
    restoreRedux();
    utils.navigateToHref.restore();
  });

  const createWrapper = overrideProps => {
    const combinedProps = {...defaultProps, ...overrideProps};
    return mount(
      <Provider store={store}>
        <ScriptEditor {...combinedProps} />
      </Provider>
    );
  };

  describe('Script Editor', () => {
    it('does not show publishing editor if hasCourse is true', () => {
      const wrapper = createWrapper({initialHidden: false, hasCourse: true});
      assert.equal(wrapper.find('CourseVersionPublishingEditor').length, 0);
    });

    it('shows publishing editor if hasCourse is false', () => {
      const wrapper = createWrapper({initialHidden: false, hasCourse: false});
      assert.equal(wrapper.find('CourseVersionPublishingEditor').length, 1);
    });

    it('uses old script editor for non migrated script', () => {
      const wrapper = createWrapper({initialHidden: false});

      expect(wrapper.find('input').length).to.equal(21);
      expect(wrapper.find('input[type="checkbox"]').length).to.equal(10);
      expect(wrapper.find('textarea').length).to.equal(3);
      expect(wrapper.find('select').length).to.equal(6);
      expect(wrapper.find('CollapsibleEditorSection').length).to.equal(8);
      expect(wrapper.find('SaveBar').length).to.equal(1);

      expect(wrapper.find('UnitCard').length).to.equal(0);
      expect(wrapper.find('#script_text').length).to.equal(1);
    });

    it('uses new script editor for migrated script', () => {
      const wrapper = createWrapper({
        initialHidden: false,
        isMigrated: true,
        initialCourseVersionId: 1
      });

      expect(wrapper.find('input').length).to.equal(25);
      expect(wrapper.find('input[type="checkbox"]').length).to.equal(12);
      expect(wrapper.find('textarea').length).to.equal(4);
      expect(wrapper.find('select').length).to.equal(5);
      expect(wrapper.find('CollapsibleEditorSection').length).to.equal(9);
      expect(wrapper.find('SaveBar').length).to.equal(1);

      expect(wrapper.find('UnitCard').length).to.equal(1);
      expect(wrapper.find('#script_text').length).to.equal(0);
    });

    describe('Teacher Resources', () => {
      it('adds empty resources if passed none', () => {
        const wrapper = createWrapper({});
        assert.deepEqual(
          wrapper.find('ScriptEditor').state('teacherResources'),
          [
            {type: '', link: ''},
            {type: '', link: ''},
            {type: '', link: ''},
            {type: '', link: ''},
            {type: '', link: ''},
            {type: '', link: ''},
            {type: '', link: ''},
            {type: '', link: ''},
            {type: '', link: ''},
            {type: '', link: ''}
          ]
        );
      });

      it('adds empty resources if passed fewer than max', () => {
        const wrapper = createWrapper({
          initialTeacherResources: [
            {type: ResourceType.curriculum, link: '/foo'}
          ]
        });

        assert.deepEqual(
          wrapper.find('ScriptEditor').state('teacherResources'),
          [
            {type: ResourceType.curriculum, link: '/foo'},
            {type: '', link: ''},
            {type: '', link: ''},
            {type: '', link: ''},
            {type: '', link: ''},
            {type: '', link: ''},
            {type: '', link: ''},
            {type: '', link: ''},
            {type: '', link: ''},
            {type: '', link: ''}
          ]
        );
      });

      it('uses new resource editor for migrated scripts', () => {
        const wrapper = createWrapper({
          isMigrated: true
        });
        expect(
          wrapper
            .find('ResourcesEditor')
            .first()
            .props().useMigratedResources
        ).to.be.true;
      });
    });

    it('has correct markdown for preview of unit description', () => {
      const wrapper = createWrapper({
        initialHidden: false
      });
      expect(wrapper.find('TextareaWithMarkdownPreview').length).to.equal(2);
      expect(
        wrapper
          .find('TextareaWithMarkdownPreview')
          .at(0)
          .prop('markdown')
      ).to.equal(
        '# TEACHER Title \n This is the unit description with [link](https://studio.code.org/home) **Bold** *italics*'
      );
      expect(
        wrapper
          .find('TextareaWithMarkdownPreview')
          .at(1)
          .prop('markdown')
      ).to.equal(
        '# STUDENT Title \n This is the unit description with [link](https://studio.code.org/home) **Bold** *italics*'
      );
    });

    it('must set family name in order to check standalone course', () => {
      const wrapper = createWrapper({
        initialHidden: false,
        initialFamilyName: 'family1'
      });
      let courseCheckbox = wrapper.find('.isCourseCheckbox');

      expect(courseCheckbox.props().disabled).to.be.false;
    });
  });

  it('disables peer review count when instructor review only selected', () => {
    const wrapper = createWrapper({
      initialOnlyInstructorReviewRequired: false,
      initialPeerReviewsRequired: 2
    });

    let peerReviewCountInput = wrapper.find('#number_peer_reviews_input');

    expect(peerReviewCountInput.props().disabled).to.be.false;
    expect(peerReviewCountInput.props().value).to.equal(2);

    const instructorReviewOnlyCheckbox = wrapper.find(
      '#only_instructor_review_checkbox'
    );
    instructorReviewOnlyCheckbox.simulate('change', {
      target: {checked: true}
    });

    peerReviewCountInput = wrapper.find('#number_peer_reviews_input');

    expect(peerReviewCountInput.props().disabled).to.be.true;
    expect(peerReviewCountInput.props().value).to.equal(0);
  });

  describe('Publish State', () => {
    it('published state is beta when visible and isStable are false and there is no pilot experiment', () => {
      const wrapper = createWrapper({});
      const scriptEditor = wrapper.find('ScriptEditor');
      expect(scriptEditor.state().publishedState).to.equal('Beta');
    });

    it('published state is pilot if there is a pilot experiment', () => {
      const wrapper = createWrapper({initialPilotExperiment: 'my-pilot'});
      const scriptEditor = wrapper.find('ScriptEditor');
      expect(scriptEditor.state().publishedState).to.equal('Pilot');
    });

    it('published state is preview if visible is true but isStable is false', () => {
      const wrapper = createWrapper({initialHidden: false});
      const scriptEditor = wrapper.find('ScriptEditor');
      expect(scriptEditor.state().publishedState).to.equal('Preview');
    });

    it('published state is recommended if visible and isStable are true', () => {
      const wrapper = createWrapper({
        initialHidden: false,
        initialIsStable: true
      });
      const scriptEditor = wrapper.find('ScriptEditor');
      expect(scriptEditor.state().publishedState).to.equal('Recommended');
    });
  });

  describe('Saving Script Editor', () => {
    let clock;

    afterEach(() => {
      if (clock) {
        clock.restore();
        clock = undefined;
      }
    });

    it('can save and keep editing', () => {
      const wrapper = createWrapper({});
      const scriptEditor = wrapper.find('ScriptEditor');

      let returnData = {
        scriptPath: '/s/test-script'
      };
      let server = sinon.fakeServer.create();
      server.respondWith('PUT', `/s/1`, [
        200,
        {'Content-Type': 'application/json'},
        JSON.stringify(returnData)
      ]);

      const saveBar = wrapper.find('SaveBar');

      const saveAndKeepEditingButton = saveBar.find('button').at(1);
      expect(saveAndKeepEditingButton.contains('Save and Keep Editing')).to.be
        .true;
      saveAndKeepEditingButton.simulate('click');

      // check the the spinner is showing
      expect(wrapper.find('.saveBar').find('FontAwesome').length).to.equal(1);
      expect(scriptEditor.state().isSaving).to.equal(true);

      clock = sinon.useFakeTimers(new Date('2020-12-01'));
      const expectedLastSaved = Date.now();
      server.respond();
      clock.tick(50);

      scriptEditor.update();
      expect(utils.navigateToHref).to.not.have.been.called;
      expect(scriptEditor.state().isSaving).to.equal(false);
      expect(scriptEditor.state().lastSaved).to.equal(expectedLastSaved);
      expect(wrapper.find('.saveBar').find('FontAwesome').length).to.equal(0);
      //check that last saved message is showing
      expect(wrapper.find('.lastSavedMessage').length).to.equal(1);
    });

    it('shows error when save and keep editing has error saving', () => {
      const wrapper = createWrapper({});
      const scriptEditor = wrapper.find('ScriptEditor');

      let returnData = 'There was an error';
      let server = sinon.fakeServer.create();
      server.respondWith('PUT', `/s/1`, [
        404,
        {'Content-Type': 'application/json'},
        returnData
      ]);

      const saveBar = wrapper.find('SaveBar');

      const saveAndKeepEditingButton = saveBar.find('button').at(1);
      expect(saveAndKeepEditingButton.contains('Save and Keep Editing')).to.be
        .true;
      saveAndKeepEditingButton.simulate('click');

      // check the the spinner is showing
      expect(wrapper.find('.saveBar').find('FontAwesome').length).to.equal(1);
      expect(scriptEditor.state().isSaving).to.equal(true);

      server.respond();
      scriptEditor.update();
      expect(utils.navigateToHref).to.not.have.been.called;
      expect(scriptEditor.state().isSaving).to.equal(false);
      expect(scriptEditor.state().error).to.equal('There was an error');
      expect(wrapper.find('.saveBar').find('FontAwesome').length).to.equal(0);
      expect(
        wrapper.find('.saveBar').contains('Error Saving: There was an error')
      ).to.be.true;

      server.restore();
    });

    it('shows error when showCalendar is true and weeklyInstructionalMinutes not provided', () => {
      sinon.stub($, 'ajax');
      const wrapper = createWrapper({initialShowCalendar: true});
      const scriptEditor = wrapper.find('ScriptEditor');

      const saveBar = wrapper.find('SaveBar');

      const saveAndKeepEditingButton = saveBar.find('button').at(1);
      expect(saveAndKeepEditingButton.contains('Save and Keep Editing')).to.be
        .true;
      saveAndKeepEditingButton.simulate('click');

      expect($.ajax).to.not.have.been.called;

      expect(scriptEditor.state().isSaving).to.equal(false);
      expect(scriptEditor.state().error).to.equal(
        'Please provide instructional minutes per week in Unit Calendar Settings.'
      );

      expect(
        wrapper
          .find('.saveBar')
          .contains(
            'Error Saving: Please provide instructional minutes per week in Unit Calendar Settings.'
          )
      ).to.be.true;
      $.ajax.restore();
    });

    it('shows error when showCalendar is true and weeklyInstructionalMinutes is invalid', () => {
      sinon.stub($, 'ajax');
      const wrapper = createWrapper({
        initialShowCalendar: true,
        initialWeeklyInstructionalMinutes: -100
      });
      const scriptEditor = wrapper.find('ScriptEditor');

      const saveBar = wrapper.find('SaveBar');

      const saveAndKeepEditingButton = saveBar.find('button').at(1);
      expect(saveAndKeepEditingButton.contains('Save and Keep Editing')).to.be
        .true;
      saveAndKeepEditingButton.simulate('click');

      expect($.ajax).to.not.have.been.called;

      expect(scriptEditor.state().isSaving).to.equal(false);
      expect(scriptEditor.state().error).to.equal(
        'Please provide a positive number of instructional minutes per week in Unit Calendar Settings.'
      );

      expect(
        wrapper
          .find('.saveBar')
          .contains(
            'Error Saving: Please provide a positive number of instructional minutes per week in Unit Calendar Settings.'
          )
      ).to.be.true;
      $.ajax.restore();
    });

    it('shows error when published state is pilot but no pilot experiment given', () => {
      sinon.stub($, 'ajax');
      const wrapper = createWrapper({});

      const scriptEditor = wrapper.find('ScriptEditor');
      scriptEditor.setState({publishedState: 'Pilot', pilotExperiment: ''});

      const saveBar = wrapper.find('SaveBar');

      const saveAndKeepEditingButton = saveBar.find('button').at(1);
      expect(saveAndKeepEditingButton.contains('Save and Keep Editing')).to.be
        .true;
      saveAndKeepEditingButton.simulate('click');

      expect($.ajax).to.not.have.been.called;

      expect(scriptEditor.state().isSaving).to.equal(false);
      expect(scriptEditor.state().error).to.equal(
        'Please provide a pilot experiment in order to save with published state as pilot.'
      );

      expect(
        wrapper
          .find('.saveBar')
          .contains(
            'Error Saving: Please provide a pilot experiment in order to save with published state as pilot.'
          )
      ).to.be.true;

      $.ajax.restore();
    });

    it('can save and close', () => {
      const wrapper = createWrapper({});
      const scriptEditor = wrapper.find('ScriptEditor');

      let returnData = {
        scriptPath: '/s/test-script'
      };
      let server = sinon.fakeServer.create();
      server.respondWith('PUT', `/s/1`, [
        200,
        {'Content-Type': 'application/json'},
        JSON.stringify(returnData)
      ]);

      const saveBar = wrapper.find('SaveBar');

      const saveAndCloseButton = saveBar.find('button').at(2);
      expect(saveAndCloseButton.contains('Save and Close')).to.be.true;
      saveAndCloseButton.simulate('click');

      // check the the spinner is showing
      expect(wrapper.find('.saveBar').find('FontAwesome').length).to.equal(1);
      expect(scriptEditor.state().isSaving).to.equal(true);

      server.respond();
      scriptEditor.update();
      expect(utils.navigateToHref).to.have.been.calledWith(
        `/s/test-script${window.location.search}`
      );

      server.restore();
    });

    it('shows error when save and keep editing has error saving', () => {
      const wrapper = createWrapper({});
      const scriptEditor = wrapper.find('ScriptEditor');

      let returnData = 'There was an error';
      let server = sinon.fakeServer.create();
      server.respondWith('PUT', `/s/1`, [
        404,
        {'Content-Type': 'application/json'},
        returnData
      ]);

      const saveBar = wrapper.find('SaveBar');

      const saveAndCloseButton = saveBar.find('button').at(2);
      expect(saveAndCloseButton.contains('Save and Close')).to.be.true;
      saveAndCloseButton.simulate('click');

      // check the the spinner is showing
      expect(wrapper.find('.saveBar').find('FontAwesome').length).to.equal(1);
      expect(scriptEditor.state().isSaving).to.equal(true);

      server.respond();

      scriptEditor.update();
      expect(utils.navigateToHref).to.not.have.been.called;

      expect(scriptEditor.state().isSaving).to.equal(false);
      expect(scriptEditor.state().error).to.equal('There was an error');
      expect(wrapper.find('.saveBar').find('FontAwesome').length).to.equal(0);
      expect(
        wrapper.find('.saveBar').contains('Error Saving: There was an error')
      ).to.be.true;

      server.restore();
    });
  });
});
