import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import Tags from '@cdo/apps/componentLibrary/tags';

describe('Design System - Tags', () => {
  it('Tags - renders with correct label', () => {
    render(
      <Tags
        tagsList={[
          {tooltipId: 'tag1', label: 'tag1', tooltipContent: 'tag1'},
          {
            label: '+1',
            tooltipId: 'tag2',
            tooltipContent: (
              <>
                <p>tag2</p> <p>test</p>
              </>
            ),
          },
        ]}
      />
    );

    const tags = screen.getByTestId('tags');
    expect(tags).toBeDefined();
    expect(screen.getByText('tag1')).toBeDefined();
    expect(screen.getAllByText('tag1')).toHaveLength(1);
  });

  it('Tags - renders tooltip on hover, removes tooltip on unhover; shows +1 if there are two tags', async () => {
    const user = userEvent.setup();

    // Initial render
    render(
      <Tags
        tagsList={[
          {tooltipId: 'tag1', label: 'tag1', tooltipContent: 'tag1'},
          {
            label: '+1',
            tooltipId: 'tag2',
            tooltipContent: (
              <>
                <p>tag2</p> <p>test</p>
              </>
            ),
          },
        ]}
      />
    );

    const tags = screen.getByTestId('tags');
    const tag1 = screen.getByText('tag1');
    const plusOneTag = screen.getByText('+1');

    expect(tags).toBeDefined();
    expect(tag1).toBeDefined();
    expect(plusOneTag).toBeDefined();
    expect(screen.queryByText('tag2')).toBeNull();

    // Hover +1 to show the +1 tooltip
    await user.hover(plusOneTag);

    expect(screen.queryByText('tag2')).toBeDefined();

    // Hover tag1 / unhover +1 to hide the +1 tooltip
    await user.hover(tag1);

    expect(screen.queryByText('tag2')).toBeNull();
  });
});
