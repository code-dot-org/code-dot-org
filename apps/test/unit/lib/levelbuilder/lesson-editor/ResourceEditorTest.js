import {mount, shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {UnconnectedResourcesEditor as ResourcesEditor} from '@cdo/apps/lib/levelbuilder/lesson-editor/ResourcesEditor';



import resourceTestData from './resourceTestData';

describe('ResourcesEditor', () => {
  const defaultResourceContext = 'testResource';
  let defaultProps, addResource, editResource, removeResource;
  beforeEach(() => {
    addResource = jest.fn();
    editResource = jest.fn();
    removeResource = jest.fn();
    defaultProps = {
      resources: resourceTestData,
      resourceContext: defaultResourceContext,
      addResource,
      editResource,
      removeResource,
    };
  });

  it('renders default props', () => {
    const wrapper = mount(<ResourcesEditor {...defaultProps} />);
    expect(wrapper.find('tr').length).toBe(resourceTestData.length + 1);
    expect(wrapper.find('SearchBox').length).toBe(1);
  });

  it('can remove a resource', () => {
    const wrapper = mount(<ResourcesEditor {...defaultProps} />);
    const numResources = wrapper.find('tr').length;
    expect(numResources).toBeGreaterThanOrEqual(2);
    // Find one of the "remove" buttons and click it
    const removeResourceButton = wrapper
      .find('.unit-test-remove-resource')
      .first();
    removeResourceButton.simulate('mouseDown');
    const removeDialog = wrapper.find('Dialog');
    const deleteButton = removeDialog.find('button').at(2);
    deleteButton.simulate('click');
    expect(removeResource).toHaveBeenCalledTimes(1);
  });

  it('can cancel removing a resource', () => {
    const wrapper = mount(<ResourcesEditor {...defaultProps} />);
    const numResources = wrapper.find('tr').length;
    expect(numResources).toBeGreaterThanOrEqual(2);
    // Find one of the "remove" buttons and click it
    const removeResourceButton = wrapper
      .find('.unit-test-remove-resource')
      .first();
    removeResourceButton.simulate('mouseDown');
    const removeDialog = wrapper.find('Dialog');
    const cancelButton = removeDialog.find('button').at(0);
    cancelButton.simulate('click');
    expect(removeResource).not.toHaveBeenCalled();
  });

  it('can add a resource', () => {
    const wrapper = shallow(<ResourcesEditor {...defaultProps} />);
    wrapper.instance().addResource({
      key: 'added-resource',
      name: 'name of resource',
      url: 'fake.fake',
      properties: {},
    });
    expect(addResource).toHaveBeenCalledTimes(1);
  });

  it('can add a resource', () => {
    const wrapper = shallow(<ResourcesEditor {...defaultProps} />);
    wrapper.instance().saveEditResource({
      key: resourceTestData[0].key,
      name: 'edited resource',
      url: 'edited url',
    });
    expect(editResource).toHaveBeenCalledTimes(1);
  });

  it('shows a button to add rollup resources if getRollupsUrl is passed as a prop', () => {
    const wrapper = shallow(
      <ResourcesEditor
        {...defaultProps}
        getRollupsUrl="/s/coursea/get_rollup_resources"
      />
    );
    const addRollupsButton = wrapper.find('button').at(1);
    expect(addRollupsButton).not.toBeNull();
    expect(addRollupsButton.contains('Add rollup pages')).toBe(true);
  });

  it('adds rollup pages from server', () => {
    const wrapper = shallow(
      <ResourcesEditor
        {...defaultProps}
        getRollupsUrl="/s/coursea/get_rollup_resources"
      />
    );
    const codeRollup = {
      id: 1,
      key: 'all-code',
      name: 'All Code',
      url: '/s/coursea/code',
    };
    const vocabRollup = {
      id: 2,
      key: 'all-vocab',
      name: 'All Vocab',
      url: '/s/coursea/vocab',
    };

    const server = sinon.fakeServer.create();
    server.respondWith('GET', '/s/coursea/get_rollup_resources', [
      200,
      {'Content-Type': 'application/json'},
      JSON.stringify([codeRollup, vocabRollup]),
    ]);
    wrapper.instance().addRollupPages();
    server.respond();
    expect(addResource.withArgs(defaultResourceContext, codeRollup)).toHaveBeenCalledTimes(1);
    expect(addResource.withArgs(defaultResourceContext, vocabRollup)).toHaveBeenCalledTimes(1);
    server.mockRestore();
  });
});
