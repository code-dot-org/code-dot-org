import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../util/configuredChai';
import FilterGroupContainer from '@cdo/apps/tutorialExplorer/filterGroupContainer';

describe('FilterGroupContainer', () => {
  it('renders', () => {
    const title = 'Three Types of Tetris';
    const content = (
      <ul>
        <li>Tetris</li>
        <li>Tetris Blast</li>
        <li>Tetris Attack</li>
      </ul>
    );
    const wrapper = shallow(
      <FilterGroupContainer
        text={title}
      >
        {content}
      </FilterGroupContainer>
    );
    expect(wrapper).to.containMatchingElement(
      <div>
        <div>
          {title}
        </div>
        {content}
      </div>
    );
  });
});
