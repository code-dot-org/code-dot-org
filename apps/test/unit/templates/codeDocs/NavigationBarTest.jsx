import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import NavigationBar, {
  CategoryNavigation
} from '@cdo/apps/templates/codeDocs/NavigationBar';

describe('NavigationBar', () => {
  it('renders CategoryNavigation for each category', () => {
    const wrapper = shallow(
      <NavigationBar
        categoriesForNavigation={[
          {key: 'world', name: 'World', programmingExpressions: []},
          {key: 'sprites', name: 'Sprites', programmingExpressions: []},
          {key: 'locations', name: 'Locations', programmingExpressions: []}
        ]}
      />
    );
    expect(wrapper.find('CategoryNavigation').length).to.equal(3);
    expect(
      wrapper.find('CategoryNavigation').map(cn => cn.props().category.name)
    ).to.eql(['World', 'Sprites', 'Locations']);
  });
});

describe('CategoryNavigation', () => {
  it('renders name and CodeDocLinks if initialIsOpen', () => {
    const wrapper = shallow(
      <CategoryNavigation
        initialIsOpen
        category={{
          key: 'world',
          name: 'World',
          programmingExpressions: [
            {key: 'setBackground', name: 'Set Background'},
            {key: 'playSound', name: 'Play Sound'}
          ]
        }}
      />
    );
    expect(wrapper.text().includes('World')).to.be.true;
    expect(wrapper.find('CodeDocLink').length).to.equal(2);
  });

  it('doesnt render CodeDocLinks if initialIsOpen is false', () => {
    const wrapper = shallow(
      <CategoryNavigation
        initialIsOpen={false}
        category={{
          key: 'world',
          name: 'World',
          programmingExpressions: [
            {key: 'setBackground', name: 'Set Background'},
            {key: 'playSound', name: 'Play Sound'}
          ]
        }}
      />
    );
    expect(wrapper.find('CodeDocLink').length).to.equal(0);
  });

  it('closes and expands section on click', () => {
    const wrapper = shallow(
      <CategoryNavigation
        initialIsOpen={false}
        category={{
          key: 'world',
          name: 'World',
          programmingExpressions: [
            {key: 'setBackground', name: 'Set Background'},
            {key: 'playSound', name: 'Play Sound'}
          ]
        }}
      />
    );
    // Starts closed
    expect(wrapper.find('CodeDocLink').length).to.equal(0);

    // Click to expand
    wrapper
      .find('span')
      .first()
      .simulate('click');
    expect(wrapper.find('CodeDocLink').length).to.equal(2);

    // Click to close again
    wrapper
      .find('span')
      .first()
      .simulate('click');
    expect(wrapper.find('CodeDocLink').length).to.equal(0);
  });
});
