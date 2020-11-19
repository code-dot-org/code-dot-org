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
      let courseCheckbox = wrapper.find('input[name="is_course"]');
      let familyNameSelect = wrapper.find('select[name="family_name"]');

      expect(courseCheckbox.props().disabled).to.be.true;
      expect(familyNameSelect.props().value).to.equal('');

      familyNameSelect.simulate('change', {target: {value: 'Family'}});

      // have to re-find the items inorder to see updates
      courseCheckbox = wrapper.find('input[name="is_course"]');
      familyNameSelect = wrapper.find('select[name="family_name"]');

      expect(familyNameSelect.props().value).to.equal('Family');
      expect(courseCheckbox.props().disabled).to.be.false;
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
