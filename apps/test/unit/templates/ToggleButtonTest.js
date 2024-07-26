import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import ToggleButton from '@cdo/apps/templates/ToggleButton';

describe('ToggleButton', () => {
  it('renders a "button" element', () => {
    const toggleButton = mount(
      <ToggleButton active={true} first={true} last={false} onClick={() => {}}>
        <div>click me!</div>
      </ToggleButton>
    );
    expect(toggleButton.find('button')).toHaveLength(1);
  });

  it('applies id to the element if provided', () => {
    const id = 'ButtonId';
    const toggleButton = mount(
      <ToggleButton
        id={id}
        active={true}
        first={true}
        last={false}
        onClick={() => {}}
      >
        <div>click me!</div>
      </ToggleButton>
    );
    expect(toggleButton.props().id).toBe(id);
  });
});
