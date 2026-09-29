import {CdoTheme} from '@code-dot-org/component-library/themes';
import WithConditionalTooltip from '@codebridge/components/WithConditionalTooltip';
import {createTheme, ThemeProvider} from '@mui/material/styles';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import '@testing-library/jest-dom';

// The three call sites (Lab2's submit and continue buttons, the codebridge
// console controls) use this to explain why a disabled control cannot be
// used, so the text has to survive the trip through MUI's props.

// CdoTheme drives the assertions (arrow and describeChild come from it), but
// MUI's 100ms open delay lands the state update outside act(). Zero it here;
// the delay is comfort, not behavior we assert.
const testTheme = createTheme(CdoTheme, {
  components: {MuiTooltip: {defaultProps: {enterDelay: 0, enterNextDelay: 0}}},
});

type Props = React.ComponentProps<typeof WithConditionalTooltip>;

const renderWrapper = (props: Partial<Props> = {}) =>
  render(
    <ThemeProvider theme={testTheme}>
      <WithConditionalTooltip
        showTooltip
        tooltipProps={{title: 'Run your program first'}}
        {...props}
      >
        <button type="button" disabled>
          Submit
        </button>
      </WithConditionalTooltip>
    </ThemeProvider>
  );

describe('WithConditionalTooltip', () => {
  let user: ReturnType<typeof userEvent.setup>;
  beforeEach(() => {
    user = userEvent.setup();
  });

  it('renders children without a tooltip when showTooltip is false', async () => {
    renderWrapper({showTooltip: false});

    await user.hover(screen.getByRole('button', {name: 'Submit'}));

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('forwards title as the tooltip text', async () => {
    renderWrapper();

    await user.hover(screen.getByRole('button', {name: 'Submit'}));

    expect(
      await screen.findByRole('tooltip', {name: 'Run your program first'})
    ).toBeInTheDocument();
  });

  it('defaults to placement top', async () => {
    renderWrapper();

    await user.hover(screen.getByRole('button', {name: 'Submit'}));

    const popper = (await screen.findByRole('tooltip')).closest(
      '[data-popper-placement]'
    );
    expect(popper).toHaveAttribute('data-popper-placement', 'top');
  });

  // The component spreads tooltipProps after its own placement default. Were
  // that order reversed, every caller would silently snap back to top.
  it('lets a caller override the placement default', async () => {
    renderWrapper({
      tooltipProps: {title: 'Run your program first', placement: 'right'},
    });

    await user.hover(screen.getByRole('button', {name: 'Submit'}));

    const popper = (await screen.findByRole('tooltip')).closest(
      '[data-popper-placement]'
    );
    expect(popper).toHaveAttribute('data-popper-placement', 'right');
  });

  it('forwards id, which is what ties the tooltip to its trigger', async () => {
    renderWrapper({
      tooltipProps: {title: 'Run your program first', id: 'submit-tooltip'},
    });

    const trigger = screen.getByRole('button', {name: 'Submit'})
      .parentElement as HTMLElement;
    await user.hover(trigger);

    expect(await screen.findByRole('tooltip')).toHaveAttribute(
      'id',
      'submit-tooltip'
    );
    expect(trigger).toHaveAttribute('aria-describedby', 'submit-tooltip');
  });
});
