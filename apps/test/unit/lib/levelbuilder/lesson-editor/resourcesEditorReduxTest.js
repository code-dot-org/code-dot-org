import {assert} from 'chai';
import resourceEditor, {
  addResource,
  editResource,
  removeResource
} from '@cdo/apps/lib/levelbuilder/lesson-editor/resourcesEditorRedux';
import resourceTestData from './resourceTestData';
import _ from 'lodash';

const getInitialState = () => _.cloneDeep(resourceTestData);

describe('resourcesEditorRedux reducer tests', () => {
  let initialState;
  beforeEach(() => (initialState = getInitialState()));

  it('add resource', () => {
    const nextState = resourceEditor(
      initialState,
      addResource({key: 'new-key', name: 'new-name', url: 'new-fake.url'})
    );
    assert.deepEqual(nextState.map(r => r.key), [
      'resource-1',
      'resource-2',
      'new-key'
    ]);
  });

  it('edit resource', () => {
    const editedResource = _.cloneDeep(resourceTestData[0]);
    editedResource.name = 'new name';
    const nextState = resourceEditor(
      initialState,
      editResource(editedResource)
    );
    assert.deepEqual(nextState.map(r => r.name), ['new name', 'Resource 2']);
  });

  it('remove resource', () => {
    const nextState = resourceEditor(
      initialState,
      removeResource('resource-1')
    );
    assert.deepEqual(nextState.map(r => r.key), ['resource-2']);
  });
});
