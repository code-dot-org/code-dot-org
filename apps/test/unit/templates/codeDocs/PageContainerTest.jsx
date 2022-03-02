import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import PageContainer from '@cdo/apps/templates/codeDocs/PageContainer';

describe('PageContainer', () => {
  it('renders NavigationBar', () => {
    const wrapper = shallow(
      <PageContainer
        categoriesForNavigation={[
          {key: 'world', name: 'World'},
          {key: 'sprites', name: 'Sprites'}
        ]}
        programmingEnvironmentTitle="IDE Lab"
      >
        <div />
      </PageContainer>
    );
    expect(wrapper.find('h1').length).to.equal(1);
    expect(
      wrapper
        .find('h1')
        .text()
        .includes('IDE Lab')
    ).to.be.true;
    expect(wrapper.find('NavigationBar').length).to.equal(1);
    expect(
      wrapper
        .find('NavigationBar')
        .first()
        .props().categoriesForNavigation.length
    ).to.equal(2);
  });
});
