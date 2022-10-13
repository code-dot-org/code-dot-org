import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import PageContainer from '@cdo/apps/templates/codeDocs/PageContainer';

describe('PageContainer', () => {
  it('renders NavigationBar', () => {
    const wrapper = shallow(
      <PageContainer
        categoriesForNavigation={[
          {
            key: 'world',
            name: 'World',
            docs: [{key: 'width', name: 'Width', link: '/docs/ide/width'}]
          },
          {
            key: 'sprites',
            name: 'Sprites',
            docs: [
              {key: 'height', name: 'Sprite.Height', link: '/docs/ide/height'}
            ]
          }
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
      wrapper.find('NavigationBar').find('NavigationCategory').length
    ).to.equal(2);
    expect(
      wrapper
        .find('NavigationBar')
        .find('NavigationCategory')
        .at(0)
        .find('NavigationItem').length
    ).to.equal(1);

    expect(
      wrapper
        .find('NavigationBar')
        .find('NavigationCategory')
        .at(1)
        .find('NavigationItem').length
    ).to.equal(1);
  });
});
