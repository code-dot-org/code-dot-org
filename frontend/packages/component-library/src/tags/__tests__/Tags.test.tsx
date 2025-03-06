import {render, screen, waitFor} from '@testing-library/react';
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

  it('displays tooltip content with tab navigation', async () => {
    const user = userEvent.setup();
    render(<Tags tagsList={tagsList} />);

    // Verify tooltip is hidden initially
    expect(
      screen.queryByText('This is the content of tag1 tooltip'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('This is the content of tag2 tooltip'),
    ).not.toBeInTheDocument();

    // Tab to tag1 and check tooltip appears
    await user.tab();
    expect(
      screen.getByText('This is the content of tag1 tooltip'),
    ).toBeInTheDocument();

    // Tab to tooltip then second tag and ensure it appears and first disappears
    await user.tab();
    await user.tab();

    expect(
      screen.getByText('This is the content of tag2 tooltip'),
    ).toBeInTheDocument();
    await waitFor(
      () =>
        expect(
          screen.queryByText('This is the content of tag1 tooltip'),
        ).not.toBeInTheDocument(),
      {timeout: 1000}, // 1-second wait to account for fadeout
    );
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

    // Verify that it doesn't disappear when you hover on the tooltip itself
    const tooltip1 = screen.getByText('This is the content of tag1 tooltip');
    await user.hover(tooltip1);
    expect(
      screen.getByText('This is the content of tag1 tooltip'),
    ).toBeInTheDocument();

    // Move mouse to second tag and check first tooltip disappears
    await user.hover(plusOneTag);
    await waitFor(
      () =>
        expect(
          screen.queryByText('This is the content of tag1 tooltip'),
        ).not.toBeInTheDocument(),
      {timeout: 1000}, // 1-second wait to account for fadeout
    );
    expect(
      screen.getByText('This is the content of tag2 tooltip'),
    ).toBeInTheDocument();

    // Unhover "+1" tag and verify tooltip disappears
    await user.unhover(document.body);
    await waitFor(
      () =>
        expect(
          screen.queryByText('This is the content of tag2 tooltip'),
        ).not.toBeInTheDocument(),
      {timeout: 1000}, // 1-second wait to account for fadeout
    );
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
