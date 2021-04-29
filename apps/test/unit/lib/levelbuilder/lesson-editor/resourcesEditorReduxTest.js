import {assert} from 'chai';
import createResourcesReducer, {
  addResource,
  editResource,
  removeResource
} from '@cdo/apps/lib/levelbuilder/lesson-editor/resourcesEditorRedux';
import resourceTestData from './resourceTestData';
import _ from 'lodash';

const getInitialState = () => _.cloneDeep(resourceTestData);

describe('resourcesEditorRedux reducer tests', () => {
  let initialState, resourcesEditor;
  beforeEach(() => {
    initialState = getInitialState();
    resourcesEditor = createResourcesReducer('lessonResource');
  });

  it('add resource', () => {
    const nextState = resourcesEditor(
      initialState,
      addResource('lessonResource', {
        key: 'new-key',
        name: 'new-name',
        url: 'new-fake.url'
      })
    );
    assert.deepEqual(nextState.map(r => r.key), [
      'resource-1',
      'resource-2',
      'new-key'
    ]);
  });

  it('keeps rollup resources at the end', () => {
    const rollupInitialState = initialState;
    initialState[1].isRollup = true;
    const nextState = resourcesEditor(
      rollupInitialState,
      addResource('lessonResource', {
        key: 'new-key',
        name: 'new-name',
        url: 'new-fake.url',
        isRollup: false
      })
    );
    assert.deepEqual(nextState.map(r => r.key), [
      'resource-1',
      'new-key',
      'resource-2'
    ]);
  });

  it('edit resource', () => {
    const editedResource = _.cloneDeep(resourceTestData[0]);
    editedResource.name = 'new name';
    const nextState = resourcesEditor(
      initialState,
      editResource('lessonResource', editedResource)
    );
    assert.deepEqual(nextState.map(r => r.name), ['new name', 'Resource 2']);
  });

  it('remove resource', () => {
    const nextState = resourcesEditor(
      initialState,
      removeResource('lessonResource', 'resource-1')
    );
    assert.deepEqual(nextState.map(r => r.key), ['resource-2']);
  });

  it('can add teacher resource without adding student resource', () => {
    const teacherResourcesEditor = createResourcesReducer('teacherResource');
    const studentResourcesEditor = createResourcesReducer('studentResource');
    const nextTeacherResourceState = teacherResourcesEditor(
      initialState,
      addResource('teacherResource', {
        key: 'new-teacher-resource-key',
        name: 'new-teacher-resource0name',
        url: 'new-fake.url'
      })
    );
    const nextStudentResourceState = studentResourcesEditor(
      initialState,
      addResource('studentResource', {
        key: 'new-student-resource-key',
        name: 'new-student-resourcename',
        url: 'new-fake.url'
      })
    );
    assert.deepEqual(nextTeacherResourceState.map(r => r.key), [
      'resource-1',
      'resource-2',
      'new-teacher-resource-key'
    ]);
    assert.deepEqual(nextStudentResourceState.map(r => r.key), [
      'resource-1',
      'resource-2',
      'new-student-resource-key'
    ]);
  });
});
