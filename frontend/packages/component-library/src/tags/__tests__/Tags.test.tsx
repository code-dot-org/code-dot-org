import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import Tags, {TagProps} from './../index';

describe('Design System - Tags Component', () => {
  const tagsList: TagProps[] = [
    {
      tooltipId: 'tag1',
      label: 'tag1',
      tooltipContent: 'This is the content of tag1 tooltip',
    },
    {
      tooltipId: 'tag2',
      label: '+1',
      tooltipContent: (
        <>
          <p>This is the content of tag2 tooltip</p>
          <p>Additional tooltip content</p>
        </>
      ),
    },
  ];

  it('renders tags with correct labels', () => {
    render(<Tags tagsList={tagsList} />);

    // Verify tag labels are present
    const tag1 = screen.getByText('tag1');
    const plusOneTag = screen.getByText('+1');

    expect(tag1).toBeInTheDocument();
    expect(plusOneTag).toBeInTheDocument();
  });

  it('displays tooltip content on hover', async () => {
    const user = userEvent.setup();
    render(<Tags tagsList={tagsList} />);

    // Verify tooltip is hidden initially
    expect(
      screen.queryByText('This is the content of tag1 tooltip'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('This is the content of tag2 tooltip'),
    ).not.toBeInTheDocument();

    const plusOneTag = screen.getByText('+1');

    // Hover over the "+1" tag and verify the tooltip appears
    await user.hover(plusOneTag);
    expect(
      screen.getByText('This is the content of tag2 tooltip'),
    ).toBeInTheDocument();

    // Move hover to "tag1" and verify its tooltip appears, and the other tooltip disappears
    const tag1 = screen.getByText('tag1');
    await user.hover(tag1);

    expect(
      screen.getByText('This is the content of tag1 tooltip'),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('This is the content of tag2 tooltip'),
    ).not.toBeInTheDocument();
  });

  it('removes tooltip content on mouse leave', async () => {
    const user = userEvent.setup();
    render(<Tags tagsList={tagsList} />);

    const tag1 = screen.getByText('tag1');
    const plusOneTag = screen.getByText('+1');

    // Hover over tag1 and check tooltip appears
    await user.hover(tag1);
    expect(
      screen.getByText('This is the content of tag1 tooltip'),
    ).toBeInTheDocument();

    // Move mouse out of tag1 and check tooltip disappears
    await user.unhover(tag1);
    expect(
      screen.queryByText('This is the content of tag1 tooltip'),
    ).not.toBeInTheDocument();

    // Hover over the "+1" tag
    await user.hover(plusOneTag);
    expect(
      screen.getByText('This is the content of tag2 tooltip'),
    ).toBeInTheDocument();

    // Unhover "+1" tag and verify tooltip disappears
    await user.unhover(plusOneTag);
    expect(
      screen.queryByText('This is the content of tag2 tooltip'),
    ).not.toBeInTheDocument();
  });

  it('renders correctly with an empty tags list', () => {
    render(<Tags tagsList={[]} />);

    // Expect nothing to be rendered
    expect(screen.queryByText('tag1')).not.toBeInTheDocument();
    expect(screen.queryByText('+1')).not.toBeInTheDocument();
  });

  it('renders tag icons correctly when provided', () => {
    const tagsWithIcons: TagProps[] = [
      {
        tooltipId: 'tag-icon-1',
        label: 'tag with icon',
        tooltipContent: 'Tooltip with icon',
        icon: {
          iconName: 'check',
          iconStyle: 'solid',
          title: 'Check Icon',
          placement: 'left',
        },
      },
    ];

    render(<Tags tagsList={tagsWithIcons} />);

    const tagLabel = screen.getByText('tag with icon');
    const icon = screen.getByTitle('Check Icon');

    expect(tagLabel).toBeInTheDocument();
    expect(icon).toBeInTheDocument();
  });
});
