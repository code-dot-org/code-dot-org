import {expect} from 'chai';
import React from 'react';
import {mount} from 'enzyme';
import ScriptEditor from '@cdo/apps/lib/script-editor/ScriptEditor';

describe('ScriptEditor', () => {
  const DEFAULT_PROPS = {
    announcements: [],
    curriculumUmbrella: 'CSF',
    i18nData: {
      lessonDescriptions: []
    },
    isLevelbuilder: true,
    locales: [],
    name: 'test-script',
    scriptFamilies: [],
    teacherResources: [],
    versionYearOptions: []
  };

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
