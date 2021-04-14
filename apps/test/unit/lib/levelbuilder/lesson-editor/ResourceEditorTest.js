import React from 'react';
import {mount, shallow} from 'enzyme';
import sinon from 'sinon';
import {expect} from '../../../../util/reconfiguredChai';
import {UnconnectedResourcesEditor as ResourcesEditor} from '@cdo/apps/lib/levelbuilder/lesson-editor/ResourcesEditor';
import resourceTestData from './resourceTestData';

describe('ResourcesEditor', () => {
  let defaultProps, addResource, editResource, removeResource;
  beforeEach(() => {
    addResource = sinon.spy();
    editResource = sinon.spy();
    removeResource = sinon.spy();
    defaultProps = {
      resources: resourceTestData,
      resourceContext: 'testResource',
      addResource,
      editResource,
      removeResource
    };
  });

  it('renders default props', () => {
    const wrapper = mount(<ResourcesEditor {...defaultProps} />);
    expect(wrapper.find('tr').length).to.equal(resourceTestData.length + 1);
    expect(wrapper.find('SearchBox').length).to.equal(1);
  });

  it('can remove a resource', () => {
    const wrapper = mount(<ResourcesEditor {...defaultProps} />);
    const numResources = wrapper.find('tr').length;
    expect(numResources).at.least(2);
    // Find one of the "remove" buttons and click it
    const removeResourceButton = wrapper
      .find('.unit-test-remove-resource')
      .first();
    removeResourceButton.simulate('mouseDown');
    const removeDialog = wrapper.find('Dialog');
    const deleteButton = removeDialog.find('button').at(1);
    deleteButton.simulate('click');
    expect(removeResource).to.have.been.calledOnce;
  });

  it('can cancel removing a resource', () => {
    const wrapper = mount(<ResourcesEditor {...defaultProps} />);
    const numResources = wrapper.find('tr').length;
    expect(numResources).at.least(2);
    // Find one of the "remove" buttons and click it
    const removeResourceButton = wrapper
      .find('.unit-test-remove-resource')
      .first();
    removeResourceButton.simulate('mouseDown');
    const removeDialog = wrapper.find('Dialog');
    const cancelButton = removeDialog.find('button').at(0);
    cancelButton.simulate('click');
    expect(removeResource).not.to.have.been.called;
  });

  it('can add a resource', () => {
    const wrapper = shallow(<ResourcesEditor {...defaultProps} />);
    wrapper.instance().addResource({
      key: 'added-resource',
      name: 'name of resource',
      url: 'fake.fake',
      properties: {}
    });
    expect(addResource).to.have.been.calledOnce;
  });

  it('can add a resource', () => {
    const wrapper = shallow(<ResourcesEditor {...defaultProps} />);
    wrapper.instance().saveEditResource({
      key: resourceTestData[0].key,
      name: 'edited resource',
      url: 'edited url'
    });
    expect(editResource).to.have.been.calledOnce;
  });
});
