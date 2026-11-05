/**
 * Every test renders a bare `Divider` from `@mui/material`; the `MuiDivider`
 * entry in styleOverrides/divider.ts (on CdoTheme) colors it.
 */
import {Divider, DividerProps, ThemeProvider, createTheme} from '@mui/material';
import {render, screen} from '@testing-library/react';

import CdoTheme from '@/themes/code.org';

const COLOR = 'var(--background-neutral-quaternary)';

describe('Design System - Divider (theme-only)', () => {
  const renderDivider = (props: DividerProps = {}, theme = CdoTheme) =>
    render(
      <ThemeProvider theme={theme}>
        <Divider {...props} />
      </ThemeProvider>,
    );

  it('renders a horizontal <hr> in the neutral token color', () => {
    renderDivider();
    const divider = screen.getByRole('separator');
    expect(divider.tagName).toBe('HR');
    expect(getComputedStyle(divider).borderColor).toBe(COLOR);
  });

  it('keeps the vertical layout and takes the same color', () => {
    renderDivider({orientation: 'vertical', flexItem: true});
    const style = getComputedStyle(screen.getByRole('separator'));
    expect(style.borderColor).toBe(COLOR);
    expect(style.borderBottomWidth).toBe('0px');
  });

  it('gets the color from CdoTheme, not from MUI', () => {
    renderDivider({}, createTheme());
    expect(
      getComputedStyle(screen.getByRole('separator')).borderColor,
    ).not.toBe(COLOR);
  });
});
