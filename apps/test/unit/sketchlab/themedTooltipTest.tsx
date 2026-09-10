import {
  ThemeProvider,
  useTheme,
} from '@code-dot-org/component-library/common/contexts';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import React from 'react';

import ThemedTooltip from '@cdo/apps/sketchlab/reactFlow/components/ThemedTooltip';

const SetDark = () => {
  const {theme, setTheme} = useTheme(true);
  React.useEffect(() => {
    if (theme !== 'Dark' && setTheme) setTheme('Dark');
  }, [theme, setTheme]);
  return null;
};

describe('Sketch Lab ThemedTooltip', () => {
  it('puts the active theme on the portaled bubble', async () => {
    render(
      <ThemeProvider>
        <SetDark />
        <ThemedTooltip title="Zoom in" placement="left">
          <button type="button">zoom</button>
        </ThemedTooltip>
      </ThemeProvider>
    );
    fireEvent.mouseOver(screen.getByText('zoom'));
    await waitFor(() => {
      const bubble = document.querySelector('.MuiTooltip-tooltip');
      expect(bubble).toBeTruthy();
      expect(bubble!.getAttribute('data-theme')).toBe('Dark');
    });
  });

  it('renders without a ThemeProvider', async () => {
    render(
      <ThemedTooltip title="Zoom in" placement="left">
        <button type="button">zoom</button>
      </ThemedTooltip>
    );
    fireEvent.mouseOver(screen.getByText('zoom'));
    expect(await screen.findByRole('tooltip')).toBeInTheDocument();
  });
});
