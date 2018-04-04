import { assert } from '../../../util/configuredChai';
import sectionProgress, {
  setSection,
  setValidScripts,
  setCurrentView,
  ViewType,
  setScriptId,
  addScriptData,
  addStudentLevelProgress,
} from '@cdo/apps/templates/sectionProgress/sectionProgressRedux';

const fakeSectionData = {
  id: 123,
  students: {
    id: 1,
    name: 'test1'
  },
  script: {
    id: 300,
    name: 'csp2',
  }
};

const fakeValidScripts = [
  {
    category: 'category1',
    category_priority: 1,
    id: 456,
    name: 'Script Name',
    position: 23
  },
  {
    category: 'category1',
    category_priority: 1,
    id: 300,
    name: 'csp2',
    position: 23
  }
];

describe('sectionProgressRedux', () => {
  const initialState = sectionProgress(undefined, {});

  describe('setScriptId', () => {
    it('sets the script id', () => {
      const action = setScriptId(130);
      const nextState = sectionProgress(initialState, action);
      assert.deepEqual(nextState.scriptId, 130);
    });
  });

  describe('setSection', () => {
    it('sets the section data and assigned scriptId', () => {
      const action = setSection(fakeSectionData);
      const nextState = sectionProgress(initialState, action);
      assert.deepEqual(nextState.section, fakeSectionData);
      assert.deepEqual(nextState.scriptId, 300);
    });

    it('sets the section data with no default scriptId', () => {
      const sectionDataWithNoScript = {
        ...fakeSectionData,
        script: null,
      };
      const action = setSection(sectionDataWithNoScript);
      const nextState = sectionProgress(initialState, action);
      assert.deepEqual(nextState.section, sectionDataWithNoScript);
      assert.deepEqual(nextState.scriptId, null);
    });
  });

  describe('setValidScripts', () => {
    it('sets the script data and defaults scriptId', () => {
      const action = setValidScripts(fakeValidScripts);
      const nextState = sectionProgress(initialState, action);
      assert.deepEqual(nextState.validScripts, fakeValidScripts);
      assert.deepEqual(nextState.scriptId, fakeValidScripts[0].id);
    });

    it('sets the script data and does not override already assigned scriptId', () => {
      const action = setValidScripts(fakeValidScripts);
      const nextState = sectionProgress({
        ...initialState,
        scriptId: 100
      }, action);
      assert.deepEqual(nextState.validScripts, fakeValidScripts);
      assert.deepEqual(nextState.scriptId, 100);
    });
  });

  describe('setCurrentView', () => {
    it('sets the current view to summary', () => {
      const action = setCurrentView(ViewType.SUMMARY);
      const nextState = sectionProgress(initialState, action);
      assert.deepEqual(nextState.currentView, ViewType.SUMMARY);
    });

    it('sets the current view to detail', () => {
      const action = setCurrentView(ViewType.DETAIL);
      const nextState = sectionProgress(initialState, action);
      assert.deepEqual(nextState.currentView, ViewType.DETAIL);
    });
  });

  describe('addScriptData', () => {
    it('adds multiple scriptData info', () => {
      const action = addScriptData('130', {scriptInfo: 'info'});
      const nextState = sectionProgress(initialState, action);
      assert.deepEqual(nextState.scriptDataByScript['130'], {scriptInfo: 'info'});

      const action2 = addScriptData('132', {scriptInfo: 'info2'});
      const nextState2 = sectionProgress(nextState, action2);
      assert.deepEqual(nextState2.scriptDataByScript['130'], {scriptInfo: 'info'});
      assert.deepEqual(nextState2.scriptDataByScript['132'], {scriptInfo: 'info2'});
    });
  });

  describe('addScriptData', () => {
    it('adds multiple scriptData info', () => {
      const action = addScriptData('130', {scriptInfo: 'info'});
      const nextState = sectionProgress(initialState, action);
      assert.deepEqual(nextState.scriptDataByScript['130'], {scriptInfo: 'info'});

      const action2 = addScriptData('132', {scriptInfo: 'info2'});
      const nextState2 = sectionProgress(nextState, action2);
      assert.deepEqual(nextState2.scriptDataByScript['130'], {scriptInfo: 'info'});
      assert.deepEqual(nextState2.scriptDataByScript['132'], {scriptInfo: 'info2'});
    });
  });

  describe('addStudentLevelProgress', () => {
    it('adds multiple scriptData info', () => {
      const action = addStudentLevelProgress('130', {levelProgress: 'info'});
      const nextState = sectionProgress(initialState, action);
      assert.deepEqual(nextState.studentLevelProgressByScript['130'], {levelProgress: 'info'});

      const action2 = addStudentLevelProgress('132', {levelProgress: 'info2'});
      const nextState2 = sectionProgress(nextState, action2);
      assert.deepEqual(nextState2.studentLevelProgressByScript['130'], {levelProgress: 'info'});
      assert.deepEqual(nextState2.studentLevelProgressByScript['132'], {levelProgress: 'info2'});
    });
  });
});
