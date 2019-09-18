import {expect} from 'chai';
import React from 'react';
import {mount} from 'enzyme';
import ScriptEditor from '@cdo/apps/lib/script-editor/ScriptEditor';

describe('ScriptEditor', () => {
  const DEFAULT_PROPS = {
    announcements: [],
    excludeCsfColumnInLegend: false,
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

    it('is disabled and unchecked when pilotExperiment is present', () => {
      const wrapper = mount(
        <ScriptEditor
          {...DEFAULT_PROPS}
          hidden={false}
          pilotExperiment="test-pilot"
        />
      );
      const checkbox = wrapper.find('input[name="visible_to_teachers"]');
      expect(checkbox.prop('disabled')).to.be.true;
      expect(checkbox.prop('checked')).to.be.false;
    });

    it('updates state as pilotExperiment changes', () => {
      const wrapper = mount(<ScriptEditor {...DEFAULT_PROPS} hidden={false} />);
      const visibleInTeacherDashboard = () =>
        wrapper.find('input[name="visible_to_teachers"]');
      const pilotExperiment = () =>
        wrapper.find('input[name="pilot_experiment"]');

      expect(pilotExperiment().prop('value')).to.equal('');
      expect(visibleInTeacherDashboard().prop('checked')).to.be.true;
      expect(visibleInTeacherDashboard().prop('disabled')).to.be.false;

      pilotExperiment().simulate('change', {target: {value: 'test-pilot'}});
      expect(visibleInTeacherDashboard().prop('checked')).to.be.false;
      expect(visibleInTeacherDashboard().prop('disabled')).to.be.true;

      pilotExperiment().simulate('change', {target: {value: ''}});
      expect(visibleInTeacherDashboard().prop('checked')).to.be.true;
      expect(visibleInTeacherDashboard().prop('disabled')).to.be.false;
    });
  });
});
