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
    const {rerender} = render(<Tags tagsList={['tag1', 'tag2']} />);

    let tags = screen.getByTestId('tags');
    expect(tags).to.exist;
    expect(screen.getByText('tag1')).to.exist;
    expect(screen.getByText('+1')).to.exist;
    expect(screen.queryByText('tag2')).to.not.exist;

    await user.hover(screen.getByText('+1'));

    // Re-render after user's hover
    rerender(<Tags tagsList={['tag1', 'tag2']} />);

    expect(screen.queryByText('tag2')).to.exist;

    await user.unhover(screen.getByText('+1'));

    // Re-render after user's unhover
    rerender(<Tags tagsList={['tag1', 'tag2']} />);
    expect(screen.queryByText('tag2')).to.not.exist;
  });
});
