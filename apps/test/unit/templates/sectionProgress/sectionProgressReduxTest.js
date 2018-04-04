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
  }
};

const fakeValidScripts = [
  {
    category: 'category1',
    category_priority: 1,
    id: 456,
    name: 'Script Name',
    position: 23
  }
];

describe('sectionProgressRedux', () => {
  const initialState = sectionProgress(undefined, {});

  describe('setScriptId', () => {
    it('sets the script id', () => {
      const action = setScriptId('130');
      const nextState = sectionProgress(initialState, action);
      assert.deepEqual(nextState.scriptId, '130');
    });
  });

  describe('setSection', () => {
    it('sets the section data', () => {
      const action = setSection(fakeSectionData);
      const nextState = sectionProgress(initialState, action);
      assert.deepEqual(nextState.section, fakeSectionData);
    });
  });

  describe('setValidScripts', () => {
    it('sets the script data', () => {
      const action = setValidScripts(fakeValidScripts);
      const nextState = sectionProgress(initialState, action);
      assert.deepEqual(nextState.validScripts, fakeValidScripts);
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
