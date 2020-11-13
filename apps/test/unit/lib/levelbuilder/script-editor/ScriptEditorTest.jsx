import React from 'react';
import {mount, shallow} from 'enzyme';
import ScriptEditor from '@cdo/apps/lib/levelbuilder/script-editor/ScriptEditor';
import {assert, expect} from '../../../../util/reconfiguredChai';
import ResourceType from '@cdo/apps/templates/courseOverview/resourceType';

describe('ScriptEditor', () => {
  const DEFAULT_PROPS = {
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
    initialLocales: []
  };

  describe('Script Editor', () => {
    describe('Teacher Resources', () => {
      it('adds empty resources if passed none', () => {
        const wrapper = shallow(<ScriptEditor {...DEFAULT_PROPS} />);
        assert.deepEqual(wrapper.state('teacherResources'), [
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
        ]);
      });

      it('adds empty resources if passed fewer than max', () => {
        const wrapper = shallow(
          <ScriptEditor
            {...DEFAULT_PROPS}
            initialTeacherResources={[
              {type: ResourceType.curriculum, link: '/foo'}
            ]}
          />
        );
        assert.deepEqual(wrapper.state('teacherResources'), [
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
        ]);
      });
    });

    it('has the correct number of each editor field type', () => {
      const wrapper = mount(
        <ScriptEditor {...DEFAULT_PROPS} initialHidden={false} />
      );
      expect(wrapper.find('input').length).to.equal(23);
      expect(wrapper.find('input[type="checkbox"]').length).to.equal(11);
      expect(wrapper.find('textarea').length).to.equal(2);
      expect(wrapper.find('select').length).to.equal(5);
      expect(wrapper.find('CollapsibleEditorSection').length).to.equal(7);
    });

    it('has correct markdown for preview of unit description', () => {
      const wrapper = mount(
        <ScriptEditor {...DEFAULT_PROPS} initialHidden={false} />
      );
      expect(wrapper.find('TextareaWithMarkdownPreview').length).to.equal(1);
      expect(
        wrapper.find('TextareaWithMarkdownPreview').prop('markdown')
      ).to.equal(
        '# Title \n This is the unit description with [link](https://studio.code.org/home) **Bold** *italics*'
      );
    });

    it('must set family name in order to check standalone course', () => {
      const wrapper = mount(
        <ScriptEditor {...DEFAULT_PROPS} initialHidden={false} />
      );
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
      const wrapper = mount(
        <ScriptEditor {...DEFAULT_PROPS} initialHidden={false} />
      );
      const checkbox = wrapper.find('input[name="visible_to_teachers"]');
      expect(checkbox.prop('checked')).to.be.true;
    });

    it('is unchecked when hidden is true', () => {
      const wrapper = mount(
        <ScriptEditor {...DEFAULT_PROPS} initialHidden={true} />
      );
      const checkbox = wrapper.find('input[name="visible_to_teachers"]');
      expect(checkbox.prop('checked')).to.be.false;
    });
  });
});
