import {Button, IconButton, Tooltip} from '@mui/material';
import {Meta, StoryFn} from '@storybook/react-vite';

import FontAwesomeV6Icon from '@/fontAwesomeV6Icon';

import {keyboardOnlyTooltipProps} from '../index';

/**
 * Every story imports `Tooltip` straight from `@mui/material`; the look comes
 * from the `MuiTooltip` theme entry.
 */
export default {
  title: 'DesignSystem/Tooltip/Tooltip',
  component: Tooltip,
  parameters: {
    componentSubtitle: 'Bare MUI Tooltip, styled by CdoTheme.',
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
  <div style={{padding: '4rem 8rem'}}>
    <p>
      Opens on hover and on keyboard focus. The tail and the
      describe-the-trigger behavior come from <code>defaultProps</code> in the
      theme. Pass <code>{'arrow={false}'}</code> to drop the tail.
    </p>
    <Tooltip title="Runs your program">
      <Button variant="contained">Run</Button>
    </Tooltip>
  </div>
);

/** MUI's `arrow` prop toggles the caret. */
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

/** A leading icon goes in the title; the theme sizes it. */
export const WithIcon: StoryFn = () => (
  <div style={{padding: '4rem 8rem'}}>
    <Tooltip
      title={
        <>
          <FontAwesomeV6Icon iconName="circle-info" iconStyle="solid" />
          More information
        </>
      }
    >
      <Button variant="outlined">Details</Button>
    </Tooltip>
  </div>
);

export const Placements: StoryFn = () => (
  <div style={{padding: '4rem 8rem'}}>
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
    <div style={{marginTop: '4rem'}}>
      <Row>
        {(['left-start', 'left-end', 'right-start', 'right-end'] as const).map(
          placement => (
            <Tooltip
              key={placement}
              title="This is a super long tooltip to test alignment. More text to see if it wraps."
              placement={placement}
            >
              <Button variant="outlined">{placement}</Button>
            </Tooltip>
          ),
        )}
      </Row>
    </div>
  </div>
);

/** Keyboard-only, via the exported props. */
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
        <Tooltip key={iconName} title={title} {...keyboardOnlyTooltipProps}>
          <IconButton color="secondary" aria-label={title}>
            <FontAwesomeV6Icon iconName={iconName} iconStyle="solid" />
          </IconButton>
        </Tooltip>
      ))}
    </Row>
  </>
);

/**
 * The portal escapes `data-theme`, so a tooltip in a themed subtree needs its
 * own, passed through `slotProps`.
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
