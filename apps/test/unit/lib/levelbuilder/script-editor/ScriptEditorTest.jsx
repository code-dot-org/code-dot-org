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
import sinon from 'sinon';
import * as utils from '@cdo/apps/utils';

describe('ScriptEditor', () => {
  let defaultProps, store;
  beforeEach(() => {
    sinon.stub(utils, 'navigateToHref');
    stubRedux();

    registerReducers({...reducers, isRtl});
    store = getStore();
    store.dispatch(init([], {}));

    defaultProps = {
      id: 1,
      initialAnnouncements: [],
      curriculumUmbrella: 'CSF',
      i18nData: {
        stageDescriptions: [],
        description:
          '# Title \n This is the unit description with [link](https://studio.code.org/home) **Bold** *italics*'
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
      initialLessonLevelData:
        "lesson_group 'lesson group', display_name: 'lesson group display name'\nlesson 'new lesson', display_name: 'lesson display name'\n"
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
    });

    it('has the correct number of each editor field type', () => {
      const wrapper = createWrapper({
        initialHidden: false
      });
      expect(wrapper.find('input').length).to.equal(23);
      expect(wrapper.find('input[type="checkbox"]').length).to.equal(11);
      expect(wrapper.find('textarea').length).to.equal(2);
      expect(wrapper.find('select').length).to.equal(5);
      expect(wrapper.find('CollapsibleEditorSection').length).to.equal(7);
      expect(wrapper.find('SaveBar').length).to.equal(1);
    });

    it('has correct markdown for preview of unit description', () => {
      const wrapper = createWrapper({
        initialHidden: false
      });
      expect(wrapper.find('TextareaWithMarkdownPreview').length).to.equal(1);
      expect(
        wrapper.find('TextareaWithMarkdownPreview').prop('markdown')
      ).to.equal(
        '# Title \n This is the unit description with [link](https://studio.code.org/home) **Bold** *italics*'
      );
    });

    it('must set family name in order to check standalone course', () => {
      const wrapper = createWrapper({
        initialHidden: false
      });
      let courseCheckbox = wrapper.find('.isCourseCheckbox');
      let familyNameSelect = wrapper.find('.familyNameSelector');

      expect(courseCheckbox.props().disabled).to.be.true;
      expect(familyNameSelect.props().value).to.equal('');

      familyNameSelect.simulate('change', {target: {value: 'Family'}});

      // have to re-find the items inorder to see updates
      courseCheckbox = wrapper.find('.isCourseCheckbox');
      familyNameSelect = wrapper.find('.familyNameSelector');

      expect(familyNameSelect.props().value).to.equal('Family');
      expect(courseCheckbox.props().disabled).to.be.false;
    });
  });

  describe('Saving Script Editor', () => {
    it('can save and keep editing', () => {
      const wrapper = createWrapper({});
      const scriptEditor = wrapper.find('ScriptEditor');

      let returnData = {
        updatedAt: '2020-11-06T21:33:32.000Z',
        scriptPath: '/s/test-script'
      };
      let server = sinon.fakeServer.create();
      server.respondWith('PUT', `/s/1`, [
        200,
        {'Content-Type': 'application/json'},
        JSON.stringify(returnData)
      ]);

      const saveBar = wrapper.find('SaveBar');

      const saveAndKeepEditingButton = saveBar.find('button').at(0);
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
      expect(scriptEditor.state().lastSaved).to.equal(
        '2020-11-06T21:33:32.000Z'
      );
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

      const saveAndKeepEditingButton = saveBar.find('button').at(0);
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

    it('can save and close', () => {
      const wrapper = createWrapper({});
      const scriptEditor = wrapper.find('ScriptEditor');

      let returnData = {
        updatedAt: '2020-11-06T21:33:32.000Z',
        scriptPath: '/s/test-script'
      };
      let server = sinon.fakeServer.create();
      server.respondWith('PUT', `/s/1`, [
        200,
        {'Content-Type': 'application/json'},
        JSON.stringify(returnData)
      ]);

      const saveBar = wrapper.find('SaveBar');

      const saveAndCloseButton = saveBar.find('button').at(1);
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

      const saveAndCloseButton = saveBar.find('button').at(1);
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

  describe('VisibleInTeacherDashboard', () => {
    it('is checked when hidden is false', () => {
      const wrapper = createWrapper({
        initialHidden: false
      });
      const checkbox = wrapper.find('input[name="visible_to_teachers"]');
      expect(checkbox.prop('checked')).to.be.true;
    });

    it('is unchecked when hidden is true', () => {
      const wrapper = createWrapper({
        initialHidden: true
      });
      const checkbox = wrapper.find('input[name="visible_to_teachers"]');
      expect(checkbox.prop('checked')).to.be.false;
    });
  });
});
