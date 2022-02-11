import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import ProgrammingEnvironmentIndex, {
  ProgrammingEnvironmentCard
} from '@cdo/apps/templates/codeDocs/ProgrammingEnvironmentIndex';

describe('ProgrammingEnvironmentIndex', () => {
  it('renders title, description, and image for each IDE', () => {
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
