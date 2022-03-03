import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import ProgrammingEnvironmentIndex, {
  ProgrammingEnvironmentCard
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
            imageUrl: 'code.org/spritelab'
          },
          {
            name: 'gamelab',
            title: 'Game Lab',
            description: 'description of gamelab',
            imageUrl: 'code.org/gamelab'
          }
        ]}
      />
    );
    expect(wrapper.find('ProgrammingEnvironmentCard').length).to.equal(2);
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
          imageUrl: 'code.org/spritelab'
        }}
      />
    );
    expect(wrapper.find('h2').length).to.equal(1);
    expect(wrapper.text().includes('Sprite Lab'));
    expect(wrapper.find('EnhancedSafeMarkdown').props().markdown).to.equal(
      'description of spritelab'
    );
    expect(wrapper.find('img').props().src).to.equal('code.org/spritelab');
  });

  it('doesnt render description and image for each IDE if there arent ones', () => {
    const wrapper = shallow(
      <ProgrammingEnvironmentCard
        programmingEnvironment={{
          name: 'spritelab',
          title: 'Sprite Lab'
        }}
      />
    );
    expect(wrapper.find('h2').length).to.equal(1);
    expect(wrapper.text().includes('Sprite Lab'));
    expect(wrapper.find('EnhancedSafeMarkdown').length).to.equal(0);
    expect(wrapper.find('img').length).to.equal(0);
  });

  it('doesnt render title if there isnt one', () => {
    const wrapper = shallow(
      <ProgrammingEnvironmentCard
        programmingEnvironment={{
          name: 'spritelab',
          description: 'description of spritelab',
          imageUrl: 'code.org/spritelab'
        }}
      />
    );
    expect(wrapper.find('h2').length).to.equal(0);
    expect(wrapper.find('EnhancedSafeMarkdown').props().markdown).to.equal(
      'description of spritelab'
    );
    expect(wrapper.find('img').props().src).to.equal('code.org/spritelab');
  });
});
