import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import ProgrammingEnvironmentIndex, {
  ProgrammingEnvironmentCard,
} from '@cdo/apps/templates/codeDocs/ProgrammingEnvironmentIndex';

describe('ProgrammingEnvironmentIndex', () => {
  it('renders card for each IDE', () => {
    const wrapper = shallow(
      <ProgrammingEnvironmentIndex
        programmingEnvironments={[
          {
            name: 'spritelab',
            title: 'Sprite Lab',
            description: 'description of spritelab',
            imageUrl: 'code.org/spritelab',
            showPath: '/docs/spritelab',
          },
          {
            name: 'gamelab',
            title: 'Game Lab',
            description: 'description of gamelab',
            imageUrl: 'code.org/gamelab',
            showPath: '/docs/gamelab',
          },
        ]}
      />
    );
    expect(wrapper.find('ProgrammingEnvironmentCard').length).toBe(2);
  });
});

describe('ProgrammingEnvironmentCard', () => {
  it('renders title, description, and image for each IDE', () => {
    const wrapper = shallow(
      <ProgrammingEnvironmentCard
        programmingEnvironment={{
          name: 'spritelab',
          title: 'Sprite Lab',
          description: 'description of spritelab',
          imageUrl: 'code.org/spritelab',
          showPath: '/docs/spritelab',
        }}
      />
    );
    expect(wrapper.find('h2').length).toBe(1);
    expect(wrapper.text().includes('Sprite Lab'));
    expect(wrapper.find('EnhancedSafeMarkdown').props().markdown).toBe(
      'description of spritelab'
    );
    expect(wrapper.find('img').props().src).toBe('code.org/spritelab');
    expect(wrapper.find('Button').props().href).toBe('/docs/spritelab');
  });

  it('doesnt render description and image for each IDE if there arent ones', () => {
    const wrapper = shallow(
      <ProgrammingEnvironmentCard
        programmingEnvironment={{
          name: 'spritelab',
          title: 'Sprite Lab',
          showPath: '/docs/spritelab',
        }}
      />
    );
    expect(wrapper.find('h2').length).toBe(1);
    expect(wrapper.text().includes('Sprite Lab'));
    expect(wrapper.find('EnhancedSafeMarkdown').length).toBe(0);
    expect(wrapper.find('img').length).toBe(0);
    expect(wrapper.find('Button').props().href).toBe('/docs/spritelab');
  });

  it('doesnt render title if there isnt one', () => {
    const wrapper = shallow(
      <ProgrammingEnvironmentCard
        programmingEnvironment={{
          name: 'spritelab',
          description: 'description of spritelab',
          imageUrl: 'code.org/spritelab',
          showPath: '/docs/spritelab',
        }}
      />
    );
    expect(wrapper.find('h2').length).toBe(0);
    expect(wrapper.find('EnhancedSafeMarkdown').props().markdown).toBe(
      'description of spritelab'
    );
    expect(wrapper.find('img').props().src).toBe('code.org/spritelab');
    expect(wrapper.find('Button').props().href).toBe('/docs/spritelab');
  });
});
