import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import PageContainer from '@cdo/apps/templates/codeDocs/PageContainer';

describe('PageContainer', () => {
  it('renders NavigationBar', () => {
    const wrapper = shallow(
      <PageContainer
        categoriesForNavigation={[
          {
            key: 'world',
            name: 'World',
            docs: [{key: 'width', name: 'Width', link: '/docs/ide/width'}],
          },
          {
            key: 'sprites',
            name: 'Sprites',
            docs: [
              {key: 'height', name: 'Sprite.Height', link: '/docs/ide/height'},
            ],
          },
        ]}
        programmingEnvironmentTitle="IDE Lab"
      >
        <div />
      </PageContainer>
    );
    expect(wrapper.find('h1').length).toBe(1);
    expect(wrapper.find('h1').text().includes('IDE Lab')).toBe(true);
    expect(wrapper.find('NavigationBar').length).toBe(1);
    expect(
      wrapper.find('NavigationBar').find('NavigationCategory').length
    ).toBe(2);
    expect(
      wrapper
        .find('NavigationBar')
        .find('NavigationCategory')
        .at(0)
        .find('NavigationItem').length
    ).toBe(1);

    expect(
      wrapper
        .find('NavigationBar')
        .find('NavigationCategory')
        .at(1)
        .find('NavigationItem').length
    ).toBe(1);
  });
});
