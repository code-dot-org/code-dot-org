import React from 'react';
import {isolateComponent} from 'isolate-react';
import {expect} from '../../../util/reconfiguredChai';
import NavigationBar from '@cdo/apps/templates/referenceGuides/NavigationBar';

describe('NavigationBar', () => {
  it('nav bar renders items', () => {
    const categories = [
      {key: 'key1', name: 'category 1', content: [], color: 'blue'},
      {key: 'key2', name: 'category 2', content: [], color: 'green'}
    ];
    const wrapper = isolateComponent(<NavigationBar categories={categories} />);
    expect(wrapper.findAll('CategoryNavigation').length).to.equal(2);
  });

  it('nav bar opens the initial category', () => {
    const categories = [
      {key: 'key1', name: 'category 1', content: [], color: 'blue'},
      {key: 'key2', name: 'category 2', content: [], color: 'green'}
    ];
    const wrapper = isolateComponent(
      <NavigationBar categories={categories} initialCategoryKey={'key2'} />
    );
    expect(
      wrapper
        .findAll('CategoryNavigation')
        .map(category => category.props.initialIsOpen)
    ).to.deep.equal([false, true]);
  });
});
