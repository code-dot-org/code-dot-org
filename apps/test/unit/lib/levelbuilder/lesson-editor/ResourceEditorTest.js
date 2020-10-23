import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import ResourcesEditor from '@cdo/apps/lib/levelbuilder/lesson-editor/ResourcesEditor';
import resourceTestData from './resourceTestData';

describe('ResourcesEditor', () => {
  let defaultProps;
  beforeEach(() => {
    defaultProps = {
      resources: resourceTestData,
      typeOptions: ['Activity Guide', 'Handout'],
      audienceOptions: ['Teacher', 'Student']
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
    expect(wrapper.find('tr').length).to.equal(numResources - 1);
  });

  it('can add a resource', () => {
    const wrapper = shallow(<ResourcesEditor {...defaultProps} />);
    const numResources = wrapper.find('tr').length;
    wrapper.instance().addResource({
      key: 'added-resource',
      name: 'name of resource',
      url: 'fake.fake',
      properties: {}
    });
    expect(wrapper.find('tr').length).to.equal(numResources + 1);
  });
});
