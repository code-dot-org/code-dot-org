import {
  Autocomplete,
  createTheme,
  Menu,
  MenuItem,
  ThemeProvider as MuiThemeProvider,
  Popover,
  Popper,
  TextField,
  Tooltip,
} from '@mui/material';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {ReactNode} from 'react';

import CdoTheme from '@/themes/code.org';

import {Theme, ThemeProvider, useTheme} from '../ThemeContext';

const InTheme = ({theme, children}: {theme: Theme; children: ReactNode}) => (
  <ThemeProvider initialTheme={theme}>{children}</ThemeProvider>
);

const ThemeReadout = () => {
  const {theme, toggleTheme} = useTheme();
  return (
    <button type="button" onClick={toggleTheme}>
      {theme}
    </button>
  );
};

const renderInMui = (ui: ReactNode) =>
  render(<MuiThemeProvider theme={CdoTheme}>{ui}</MuiThemeProvider>);

const anchor = () => document.createElement('div');

describe('ThemeProvider and portaled MUI surfaces', () => {
  let user: ReturnType<typeof userEvent.setup>;
  beforeEach(() => {
    user = userEvent.setup();
  });

  const openTooltip = async () => {
    await user.hover(screen.getByRole('button'));
    return screen.findByRole('tooltip');
  };

  it('puts the provider theme on the tooltip popper', async () => {
    renderInMui(
      <InTheme theme="Dark">
        <Tooltip title="tip">
          <button type="button">trigger</button>
        </Tooltip>
      </InTheme>,
    );

    const popper = await openTooltip();
    expect(popper).toHaveAttribute('data-theme', 'Dark');
    expect(popper.closest('[data-theme]')).toBe(popper);
  });

  it('keeps the CdoTheme tooltip defaults', async () => {
    renderInMui(
      <InTheme theme="Dark">
        <Tooltip title="tip">
          <button type="button">trigger</button>
        </Tooltip>
      </InTheme>,
    );

    const popper = await openTooltip();
    expect(popper.querySelector('.MuiTooltip-arrow')).not.toBeNull();
    expect(screen.getByRole('button')).toHaveAttribute(
      'aria-describedby',
      popper.id,
    );
  });

  it('follows the closest provider', async () => {
    renderInMui(
      <InTheme theme="Dark">
        <InTheme theme="Light">
          <Tooltip title="tip">
            <button type="button">trigger</button>
          </Tooltip>
        </InTheme>
      </InTheme>,
    );

    expect(await openTooltip()).toHaveAttribute('data-theme', 'Light');
  });

  it('lets a call site override the theme', async () => {
    renderInMui(
      <InTheme theme="Dark">
        <Tooltip title="tip" slotProps={{tooltip: {'data-theme': 'Light'}}}>
          <button type="button">trigger</button>
        </Tooltip>
      </InTheme>,
    );

    const popper = await openTooltip();
    const bubble = popper.querySelector('.MuiTooltip-tooltip');
    expect(bubble?.closest('[data-theme]')).toHaveAttribute(
      'data-theme',
      'Light',
    );
  });

  it('lets a call site override the theme on the popper slot', async () => {
    renderInMui(
      <InTheme theme="Dark">
        <Tooltip
          title="tip"
          slotProps={{popper: {'data-theme': 'Light'} as object}}
        >
          <button type="button">trigger</button>
        </Tooltip>
      </InTheme>,
    );

    expect(await openTooltip()).toHaveAttribute('data-theme', 'Light');
  });

  it('lets a call site override the theme through PopperProps', async () => {
    renderInMui(
      <InTheme theme="Dark">
        <Tooltip title="tip" PopperProps={{'data-theme': 'Light'} as object}>
          <button type="button">trigger</button>
        </Tooltip>
      </InTheme>,
    );

    expect(await openTooltip()).toHaveAttribute('data-theme', 'Light');
  });

  it('keeps a function slotProps on the tooltip', async () => {
    renderInMui(
      <InTheme theme="Dark">
        <Tooltip
          title="tip"
          slotProps={{tooltip: () => ({className: 'from-call-site'})}}
        >
          <button type="button">trigger</button>
        </Tooltip>
      </InTheme>,
    );

    const popper = await openTooltip();
    expect(popper).toHaveAttribute('data-theme', 'Dark');
    expect(popper.querySelector('.from-call-site')).not.toBeNull();
  });

  it('puts the provider theme on a Popover root', () => {
    renderInMui(
      <InTheme theme="Dark">
        <Popover open anchorEl={anchor}>
          <p>content</p>
        </Popover>
      </InTheme>,
    );

    expect(
      screen.getByText('content').closest('.MuiPopover-root'),
    ).toHaveAttribute('data-theme', 'Dark');
  });

  it('puts the provider theme on a Menu root', () => {
    renderInMui(
      <InTheme theme="Dark">
        <Menu open anchorEl={anchor}>
          <MenuItem>item</MenuItem>
        </Menu>
      </InTheme>,
    );

    expect(screen.getByRole('menu').closest('.MuiMenu-root')).toHaveAttribute(
      'data-theme',
      'Dark',
    );
  });

  it('puts the provider theme on an Autocomplete popper', async () => {
    renderInMui(
      <InTheme theme="Dark">
        <Autocomplete
          open
          options={['one']}
          renderInput={params => <TextField {...params} label="pick" />}
        />
      </InTheme>,
    );

    expect(
      (await screen.findByRole('listbox')).closest('.MuiAutocomplete-popper'),
    ).toHaveAttribute('data-theme', 'Dark');
  });

  it('merges into the outer theme defaultProps for Popper and Popover', () => {
    const outerTheme = createTheme({
      components: {
        MuiPopper: {defaultProps: {className: 'from-outer-popper'}},
        MuiPopover: {defaultProps: {className: 'from-outer-popover'}},
      },
    });
    render(
      <MuiThemeProvider theme={outerTheme}>
        <InTheme theme="Dark">
          <Popper open anchorEl={anchor} disablePortal>
            <p>popper</p>
          </Popper>
          <Popover open anchorEl={anchor}>
            <p>popover</p>
          </Popover>
        </InTheme>
      </MuiThemeProvider>,
    );

    const popper = screen.getByText('popper').closest('[data-theme]');
    expect(popper).toHaveClass('from-outer-popper');
    expect(popper).toHaveAttribute('data-theme', 'Dark');
    const popover = screen.getByText('popover').closest('.MuiPopover-root');
    expect(popover).toHaveClass('from-outer-popover');
    expect(popover).toHaveAttribute('data-theme', 'Dark');
  });

  it('keeps a flat outer defaultProps entry flat', () => {
    // MUI also accepts default props written directly on the entry.
    const flatTheme = createTheme({
      components: {MuiPopper: {className: 'from-flat-entry'} as object},
    });
    render(
      <MuiThemeProvider theme={flatTheme}>
        <InTheme theme="Dark">
          <Popper open anchorEl={anchor} disablePortal>
            <p>popper</p>
          </Popper>
        </InTheme>
      </MuiThemeProvider>,
    );

    const popper = screen.getByText('popper').closest('[data-theme]');
    expect(popper).toHaveClass('from-flat-entry');
    expect(popper).toHaveAttribute('data-theme', 'Dark');
  });

  it('updates an open popper when the theme changes', async () => {
    renderInMui(
      <ThemeProvider>
        <ThemeReadout />
        <Tooltip open title="tip">
          <span>trigger</span>
        </Tooltip>
      </ThemeProvider>,
    );

    const popper = await screen.findByRole('tooltip');
    expect(popper).toHaveAttribute('data-theme', 'Light');
    await user.click(screen.getByRole('button', {name: 'Light'}));
    expect(screen.getByRole('tooltip')).toHaveAttribute('data-theme', 'Dark');
  });

  it('leaves surfaces outside the provider alone', async () => {
    renderInMui(
      <Tooltip title="tip">
        <button type="button">trigger</button>
      </Tooltip>,
    );

    expect(await openTooltip()).not.toHaveAttribute('data-theme');
  });

  it('works without an outer MUI theme and logs nothing', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <InTheme theme="Dark">
        <Tooltip title="tip">
          <button type="button">trigger</button>
        </Tooltip>
      </InTheme>,
    );

    expect(await openTooltip()).toHaveAttribute('data-theme', 'Dark');
    expect(error).not.toHaveBeenCalled();
    error.mockRestore();
  });

  it('keeps the subtree mounted across a theme change', async () => {
    renderInMui(
      <ThemeProvider>
        <ThemeReadout />
      </ThemeProvider>,
    );

    const button = screen.getByRole('button');
    await user.click(button);
    expect(screen.getByRole('button')).toBe(button);
    expect(button).toHaveTextContent('Dark');
  });
});

describe('pinned ThemeProvider', () => {
  let user: ReturnType<typeof userEvent.setup>;
  beforeEach(() => {
    user = userEvent.setup();
  });

  it('pins portaled surfaces inside a differently themed provider', async () => {
    renderInMui(
      <InTheme theme="Dark">
        <ThemeProvider theme="Light">
          <Tooltip title="tip">
            <button type="button">trigger</button>
          </Tooltip>
        </ThemeProvider>
      </InTheme>,
    );

    await user.hover(screen.getByRole('button'));
    expect(await screen.findByRole('tooltip')).toHaveAttribute(
      'data-theme',
      'Light',
    );
  });

  it('pins an unportaled popper to the section', () => {
    renderInMui(
      <InTheme theme="Dark">
        <ThemeProvider theme="Light">
          <Popper open anchorEl={anchor} disablePortal>
            <p>content</p>
          </Popper>
        </ThemeProvider>
      </InTheme>,
    );

    expect(screen.getByText('content').closest('[data-theme]')).toHaveAttribute(
      'data-theme',
      'Light',
    );
  });

  it('follows the enclosing provider when theme is passed unset', async () => {
    const maybeTheme: Theme | undefined = undefined;
    renderInMui(
      <InTheme theme="Dark">
        <ThemeProvider theme={maybeTheme}>
          <ThemeReadout />
          <Tooltip title="tip">
            <span>trigger</span>
          </Tooltip>
        </ThemeProvider>
      </InTheme>,
    );

    expect(screen.getByRole('button')).toHaveTextContent('Dark');
    await user.hover(screen.getByText('trigger'));
    expect(await screen.findByRole('tooltip')).toHaveAttribute(
      'data-theme',
      'Dark',
    );
    expect(screen.getByRole('button').parentElement).toHaveStyle({
      display: 'contents',
    });
  });

  it('keeps following the enclosing provider when it changes', async () => {
    const maybeTheme: Theme | undefined = undefined;
    renderInMui(
      <ThemeProvider>
        <ThemeReadout />
        <ThemeProvider theme={maybeTheme}>
          <p>inner</p>
        </ThemeProvider>
      </ThemeProvider>,
    );

    const inner = () => screen.getByText('inner').parentElement;
    expect(inner()).toHaveAttribute('data-theme', 'Light');
    await user.click(screen.getByRole('button'));
    expect(inner()).toHaveAttribute('data-theme', 'Dark');
  });

  it('still starts its own state when nested bare', async () => {
    renderInMui(
      <InTheme theme="Dark">
        <ThemeProvider>
          <ThemeReadout />
        </ThemeProvider>
      </InTheme>,
    );

    expect(screen.getByRole('button')).toHaveTextContent('Light');
  });

  it('starts its own state when theme is unset and nothing encloses it', () => {
    const maybeTheme: Theme | undefined = undefined;
    renderInMui(
      <ThemeProvider theme={maybeTheme}>
        <ThemeReadout />
      </ThemeProvider>,
    );

    expect(screen.getByRole('button')).toHaveTextContent('Light');
  });

  it('adds no layout box', () => {
    renderInMui(
      <ThemeProvider theme="Dark">
        <p>content</p>
      </ThemeProvider>,
    );

    const wrapper = screen.getByText('content').parentElement;
    expect(wrapper).toHaveAttribute('data-theme', 'Dark');
    expect(wrapper).toHaveStyle({display: 'contents'});
  });

  it('reports the pinned theme and toggles the enclosing provider', async () => {
    renderInMui(
      <ThemeProvider>
        <ThemeProvider theme="Light">
          <ThemeReadout />
        </ThemeProvider>
        <ThemeReadout />
      </ThemeProvider>,
    );

    const [pinned, outer] = screen.getAllByRole('button');
    await user.click(pinned);
    expect(pinned).toHaveTextContent('Light');
    expect(outer).toHaveTextContent('Dark');
  });

  it('ignores toggles with no enclosing provider', async () => {
    renderInMui(
      <ThemeProvider theme="Dark">
        <ThemeReadout />
      </ThemeProvider>,
    );

    await user.click(screen.getByRole('button'));
    expect(screen.getByRole('button')).toHaveTextContent('Dark');
  });
});
