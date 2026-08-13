import {Button, IconButton, Tooltip} from '@mui/material';
import {Meta, StoryFn} from '@storybook/react-vite';

import FontAwesomeV6Icon from '@/fontAwesomeV6Icon';

/**
 * PoC for PR #74565. Every story here imports `Tooltip` straight from
 * `@mui/material` — there is no wrapper component anywhere in this file's
 * import graph. The look comes entirely from the `MuiTooltip` entry in
 * src/themes/code.org/styleOverrides/tooltip.ts.
 *
 * Stories are deliberately a mirror of DesignSystem/Tooltip/Tooltip on
 * hbergam/mui-tooltip-keyboard, so the two can be compared story by story.
 */
export default {
  title: 'DesignSystem/Tooltip/PoC theme-only (no wrapper)',
  component: Tooltip,
  parameters: {
    componentSubtitle:
      'Bare MUI Tooltip, styled by the theme. PR #74565 review PoC.',
  },
} as Meta;

const Row: React.FunctionComponent<{children: React.ReactNode}> = ({
  children,
}) => (
  <div style={{display: 'flex', gap: '2rem', flexWrap: 'wrap'}}>{children}</div>
);

const KeyboardHint = () => (
  <p>
    Press Tab to reach the controls below. These tooltips appear on keyboard
    focus only — hovering or clicking shows nothing.
  </p>
);

export const Default: StoryFn = () => (
  <>
    <p>
      Opens on hover and on keyboard focus. Tails are on and the text describes
      the trigger, both from <code>defaultProps</code> in the theme rather than
      from a component. Pass <code>{'arrow={false}'}</code> to drop the tail.
    </p>
    <Tooltip title="Runs your program">
      <Button variant="contained">Run</Button>
    </Tooltip>
  </>
);

export const Sizes: StoryFn = () => (
  <>
    <p>
      <code>size</code> is an augmented MUI prop read off{' '}
      <code>ownerState</code>, exactly as <code>breadcrumbs.ts</code> reads its
      own.
    </p>
    <Row>
      {(['xs', 's', 'm', 'l'] as const).map(size => (
        <Tooltip key={size} title={`Size ${size}`} size={size}>
          <Button variant="outlined">{size}</Button>
        </Tooltip>
      ))}
    </Row>
  </>
);

/** MUI's own `arrow`, rather than a `hasCaret` alias for it. */
export const Caret: StoryFn = () => (
  <Row>
    <Tooltip title="With caret">
      <Button variant="outlined">default</Button>
    </Tooltip>
    <Tooltip title="No caret" arrow={false}>
      <Button variant="outlined">arrow false</Button>
    </Tooltip>
  </Row>
);

/**
 * No `iconName` prop: the icon goes in the title, and the theme still sizes it
 * per `size` through its `& i` rule.
 */
export const WithIcon: StoryFn = () => (
  <Row>
    {(['xs', 's', 'm', 'l'] as const).map(size => (
      <Tooltip
        key={size}
        size={size}
        title={
          <>
            <FontAwesomeV6Icon iconName="circle-info" iconStyle="solid" />
            {`Size ${size}`}
          </>
        }
      >
        <Button variant="outlined">{size}</Button>
      </Tooltip>
    ))}
  </Row>
);

export const Placements: StoryFn = () => (
  <div style={{padding: '4rem 0'}}>
    <Row>
      {(['top', 'right', 'bottom', 'left'] as const).map(placement => (
        <Tooltip
          key={placement}
          title={`Placed ${placement}`}
          placement={placement}
        >
          <Button variant="outlined">{placement}</Button>
        </Tooltip>
      ))}
    </Row>
  </div>
);

/**
 * `keyboardOnly` without a component: the two native props it set. Switch on
 * the RTL toolbar toggle here too — MUI mirrors `-start`/`-end` placements by
 * itself once `theme.direction` is set, which is the follow-up in the review.
 */
export const KeyboardOnly: StoryFn = () => (
  <>
    <KeyboardHint />
    <Row>
      {(
        [
          ['play', 'Run your program'],
          ['rotate-left', 'Undo the last change'],
          ['trash', 'Delete this file'],
        ] as const
      ).map(([iconName, title]) => (
        <Tooltip
          key={iconName}
          title={title}
          size="s"
          disableHoverListener
          disableTouchListener
        >
          <IconButton variant="outlined" color="secondary" aria-label={title}>
            <FontAwesomeV6Icon iconName={iconName} iconStyle="solid" />
          </IconButton>
        </Tooltip>
      ))}
    </Row>
  </>
);

/**
 * The cost of reading `size` off `ownerState`: MUI copies props it does not
 * recognise onto the cloned trigger. Only the middle case is actually harmed.
 */
export const SizePropLeak: StoryFn = () => (
  <>
    <p>
      All three tooltips are <code>size=&quot;s&quot;</code>. Inspect the
      triggers.
    </p>
    <Row>
      <Tooltip title="DOM trigger" size="s">
        <button type="button">plain button — React drops the size</button>
      </Tooltip>

      <Tooltip title="Sized MUI trigger" size="s">
        <IconButton size="small" variant="outlined" aria-label="Sized">
          <FontAwesomeV6Icon iconName="check" iconStyle="solid" />
        </IconButton>
      </Tooltip>

      <Tooltip title="Unsized MUI trigger" size="s">
        <IconButton variant="outlined" aria-label="Unsized">
          <FontAwesomeV6Icon
            iconName="triangle-exclamation"
            iconStyle="solid"
          />
        </IconButton>
      </Tooltip>
    </Row>
    <p>
      Left: React refuses to render an unknown <code>size</code> on a{' '}
      <code>button</code>, so nothing leaks. Middle: the child sets its own{' '}
      <code>size</code>, which wins, because MUI spreads{' '}
      <code>children.props</code> after its own. Right: the trigger set no size,
      so it inherits <code>&quot;s&quot;</code> and lands on a dead{' '}
      <code>MuiIconButton-sizeS</code> class instead of <code>sizeMedium</code>.
      Naming the prop <code>data-size</code> removes this case entirely.
    </p>
  </>
);

/**
 * The portal escapes `data-theme` regardless of which approach ships. Passing
 * it through `slotProps` needs no wrapper; using `-fixed` tokens for the bubble
 * would remove the need altogether.
 */
export const InsideDarkTheme: StoryFn = () => (
  <div
    data-theme="Dark"
    style={{
      display: 'flex',
      gap: '2rem',
      padding: '1.5rem',
      borderRadius: '0.5rem',
      background: 'var(--background-neutral-primary)',
    }}
  >
    <Tooltip
      title="Themed tooltip"
      slotProps={{tooltip: {'data-theme': 'Dark'} as never}}
    >
      <Button variant="contained">data-theme via slotProps</Button>
    </Tooltip>
    <Tooltip title="Unthemed tooltip">
      <Button variant="contained">data-theme omitted</Button>
    </Tooltip>
  </div>
);
