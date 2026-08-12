import {Button, IconButton} from '@mui/material';
import {Meta, StoryFn} from '@storybook/react-vite';

import FontAwesomeV6Icon from '@/fontAwesomeV6Icon';

import {Tooltip} from '../index';

export default {
  title: 'DesignSystem/Tooltip/Tooltip',
  component: Tooltip,
  parameters: {
    componentSubtitle: 'Built on MUI. Use this one for new code.',
  },
} as Meta;

const KeyboardHint = () => (
  <p>
    Press Tab to reach the controls below. These tooltips appear on keyboard
    focus only — hovering or clicking shows nothing.
  </p>
);

const Row: React.FunctionComponent<{children: React.ReactNode}> = ({
  children,
}) => (
  <div style={{display: 'flex', gap: '2rem', flexWrap: 'wrap'}}>{children}</div>
);

export const Default: StoryFn = () => (
  <>
    <p>
      Opens on hover and on keyboard focus. Tails are on by default, as in the
      design system; pass <code>{'arrow={false}'}</code> to drop them.
    </p>
    <Tooltip title="Runs your program">
      <Button variant="contained">Run</Button>
    </Tooltip>
  </>
);

/** For hints that are noise to a mouse user but a keyboard user's only cue. */
export const KeyboardOnly: StoryFn = () => (
  <>
    <KeyboardHint />
    <Tooltip title="Runs your program" keyboardOnly>
      <Button variant="contained">Run</Button>
    </Tooltip>
  </>
);

export const Sizes: StoryFn = () => (
  <Row>
    {(['xs', 's', 'm', 'l'] as const).map(size => (
      <Tooltip key={size} title={`Size ${size}`} size={size}>
        <Button variant="outlined">{size}</Button>
      </Tooltip>
    ))}
  </Row>
);

/** The caret is on by default; drop it with `hasCaret={false}`. */
export const Caret: StoryFn = () => (
  <Row>
    <Tooltip title="With caret" hasCaret>
      <Button variant="outlined">hasCaret</Button>
    </Tooltip>
    <Tooltip title="No caret" hasCaret={false}>
      <Button variant="outlined">hasCaret false</Button>
    </Tooltip>
  </Row>
);

/** A leading Font Awesome icon, sized per `size`, sits before the text. */
export const WithIcon: StoryFn = () => (
  <Row>
    {(['xs', 's', 'm', 'l'] as const).map(size => (
      <Tooltip
        key={size}
        title={`Size ${size}`}
        size={size}
        iconName="circle-info"
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

/** The portal escapes `data-theme`, so the tooltip needs its own. */
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
    <Tooltip title="Themed tooltip" data-theme="Dark">
      <Button variant="contained">data-theme passed</Button>
    </Tooltip>
    <Tooltip title="Unthemed tooltip">
      <Button variant="contained">data-theme omitted</Button>
    </Tooltip>
  </div>
);

/** Icon-only controls: obvious to a mouse user, spelled out on focus. */
export const KeyboardOnlyIconButtons: StoryFn = () => (
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
        <Tooltip key={iconName} title={title} size="s" keyboardOnly>
          <IconButton variant="outlined" color="secondary" aria-label={title}>
            <FontAwesomeV6Icon iconName={iconName} iconStyle="solid" />
          </IconButton>
        </Tooltip>
      ))}
    </Row>
  </>
);
