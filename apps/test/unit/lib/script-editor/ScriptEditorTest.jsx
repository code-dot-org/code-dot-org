import {expect} from 'chai';
import React from 'react';
import {mount} from 'enzyme';
import ScriptEditor from '@cdo/apps/lib/script-editor/ScriptEditor';

describe('ScriptEditor', () => {
  const DEFAULT_PROPS = {
    announcements: [],
    curriculumUmbrella: 'CSF',
    i18nData: {
      stageDescriptions: []
    },
    isLevelbuilder: true,
    locales: [],
    name: 'test-script',
    scriptFamilies: [],
    teacherResources: [],
    versionYearOptions: []
  };

  describe('Script Editor', () => {
    it('has the correct number of each editor field type', () => {
      const wrapper = mount(<ScriptEditor {...DEFAULT_PROPS} hidden={false} />);
      expect(wrapper.find('input').length).to.equal(22);
      expect(wrapper.find('input[type="checkbox"]').length).to.equal(10);
      expect(wrapper.find('textarea').length).to.equal(2);
      expect(wrapper.find('select').length).to.equal(5);
    });
  });

  describe('VisibleInTeacherDashboard', () => {
    it('is checked when hidden is false', () => {
      const wrapper = mount(<ScriptEditor {...DEFAULT_PROPS} hidden={false} />);
      const checkbox = wrapper.find('input[name="visible_to_teachers"]');
      expect(checkbox.prop('checked')).to.be.true;
    });

    it('is unchecked when hidden is true', () => {
      const wrapper = mount(<ScriptEditor {...DEFAULT_PROPS} hidden={true} />);
      const checkbox = wrapper.find('input[name="visible_to_teachers"]');
      expect(checkbox.prop('checked')).to.be.false;
    });
  });
});
