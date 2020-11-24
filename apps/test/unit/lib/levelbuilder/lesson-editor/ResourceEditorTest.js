import React from 'react';
import {shallow} from 'enzyme';
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
      addResource,
      editResource,
      removeResource
    };
  });

  it('renders default props', () => {
    const wrapper = shallow(<ResourcesEditor {...defaultProps} />);
    expect(wrapper.find('tr').length).to.equal(resourceTestData.length + 1);
  });

  it('can remove a resource', () => {
    const wrapper = shallow(<ResourcesEditor {...defaultProps} />);
    const numResources = wrapper.find('tr').length;
    expect(numResources).at.least(2);
    // Find one of thet "remove" buttons and click it
    const removeResourceButton = wrapper
      .find('.fa-times')
      .first()
      .parent();
    removeResourceButton.simulate('mouseDown');
    expect(removeResource).to.have.been.calledOnce;
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
