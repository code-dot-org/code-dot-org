import React from 'react';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {expect} from '../../util/reconfiguredChai';

import Tags from '@cdo/apps/componentLibrary/tags';

describe('Design System - Tags', () => {
  it('Tags - renders with correct label', () => {
    render(<Tags tagsList={['tag1', 'tag2']} />);

    const tags = screen.getByTestId('tags');
    expect(tags).to.exist;
    expect(screen.getByText('tag1')).to.exist;
    expect(screen.getAllByText('tag1')).to.have.lengthOf(1);
  });

  it('Tags - renders tooltip on hover, removes tooltip on unhover; shows +1 if there are two tags', async () => {
    const user = userEvent.setup();

    // Initial render
    render(<Tags tagsList={['tag1', 'tag2']} />);

    const tags = screen.getByTestId('tags');
    const tag1 = screen.getByText('tag1');
    const plusOneTag = screen.getByText('+1');

    expect(tags).to.exist;
    expect(tag1).to.exist;
    expect(plusOneTag).to.exist;
    expect(screen.queryByText('tag2')).to.be.null;

    // Hover +1 to show the +1 tooltip
    await user.hover(plusOneTag);

    expect(screen.queryByText('tag2')).to.exist;

    // Hover tag1 / unhover +1 to hide the +1 tooltip
    await user.hover(tag1);

    expect(screen.queryByText('tag2')).to.be.null;
  });
});
