import {Button, IconButton} from '@mui/material';
import {Meta, StoryFn} from '@storybook/react-vite';

import FontAwesomeV6Icon from '@/fontAwesomeV6Icon';

import {Tooltip} from '../index';

export default {
  title: 'DesignSystem/Tooltip/Tooltip',
  component: Tooltip,
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

/**
 * The reason this component exists. `keyboardOnly` switches off the hover and
 * touch listeners, leaving MUI's `:focus-visible` gate as the only way in. Use
 * it for hints that would be noise for a mouse user but are the only way a
 * keyboard user learns what the control does.
 */
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
 * The tooltip renders in a portal on document.body, so it does not inherit
 * `data-theme` from the trigger's ancestors. The first trigger below passes
 * `data-theme` and its tooltip matches the dark panel; the second does not and
 * its tooltip falls back to the page theme.
 */
export const InsideAThemedSubtree: StoryFn = () => (
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

/**
 * `keyboardOnly` in its natural habitat: icon-only controls whose purpose is
 * obvious to a sighted mouse user from the icon, but which a keyboard user
 * benefits from seeing spelled out on focus.
 */
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
