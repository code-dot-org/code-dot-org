import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {MuiDivider, MuiDividerProps} from '../';

const COLORS: NonNullable<MuiDividerProps['color']>[] = ['primary', 'strong'];
const MARGINS: NonNullable<MuiDividerProps['margin']>[] = [
  'none',
  'xs',
  's',
  'm',
  'l',
];

describe('MuiDivider Component', () => {
  it('renders one bare hr, the implicit horizontal separator', () => {
    render(<MuiDivider />);
    const divider = screen.getByRole('separator');

    expect(screen.getAllByRole('separator')).toHaveLength(1);
    expect(divider.tagName).toBe('HR');
    expect(divider).toBeVisible();
    expect(divider).not.toHaveAttribute('role');
    expect(divider).not.toHaveAttribute('aria-orientation');
    expect(divider).not.toHaveAttribute('aria-hidden');
    expect(divider).not.toHaveAttribute('id');
  });

  // Chromium styles an hr's color attribute, so neither prop may reach the DOM.
  it.each(COLORS.flatMap(color => MARGINS.map(margin => ({color, margin}))))(
    'keeps color="$color" and margin="$margin" off the hr',
    ({color, margin}) => {
      render(<MuiDivider color={color} margin={margin} />);
      const divider = screen.getByRole('separator');

      expect(divider.tagName).toBe('HR');
      expect(divider).not.toHaveAttribute('color');
      expect(divider).not.toHaveAttribute('margin');
    },
  );

  it('forwards other HTML attributes to the hr', () => {
    render(
      <MuiDivider
        id="rule"
        style={{clear: 'both'}}
        data-section="results"
        aria-label="Section break"
      />,
    );
    const divider = screen.getByRole('separator', {name: 'Section break'});

    expect(divider).toHaveAttribute('id', 'rule');
    expect(divider).toHaveStyle({clear: 'both'});
    expect(divider).toHaveAttribute('data-section', 'results');
  });

  it('applies a consumer className rule to the hr', () => {
    const sheet = document.createElement('style');
    sheet.textContent = '.consumer-hidden { display: none; }';
    document.head.appendChild(sheet);
    try {
      render(<MuiDivider className="consumer-hidden" />);

      expect(screen.getByRole('separator', {hidden: true})).not.toBeVisible();
    } finally {
      sheet.remove();
    }
  });

  it('renders in place and leaves document.body alone', () => {
    const {container, unmount} = render(<MuiDivider />);

    expect(screen.getByRole('separator').parentElement).toBe(container);
    expect(document.body.children).toHaveLength(1);
    expect(document.body).not.toHaveAttribute('style');
    expect(document.body).not.toHaveAttribute('aria-hidden');

    unmount();
    expect(document.body).not.toHaveAttribute('style');
  });

  it('is not in the tab order', async () => {
    const user = userEvent.setup();
    render(
      <>
        <button type="button">Before</button>
        <MuiDivider />
        <button type="button">After</button>
      </>,
    );

    await user.tab();
    expect(screen.getByRole('button', {name: 'Before'})).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', {name: 'After'})).toHaveFocus();
  });

  it('keeps orientation, flexItem and children out of the props', () => {
    const props: MuiDividerProps[] = [
      // @ts-expect-error vertical separators use Divider from @mui/material
      {orientation: 'vertical'},
      // @ts-expect-error flex-item separators use Divider from @mui/material
      {flexItem: true},
      // @ts-expect-error children would turn the hr into a div with role="separator"
      {children: 'Or'},
    ];

    expect(props).toHaveLength(3);
  });
});
