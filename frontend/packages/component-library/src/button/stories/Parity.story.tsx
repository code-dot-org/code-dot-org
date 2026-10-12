import {Button} from '@mui/material';
import type {ButtonProps} from '@mui/material';
import type {Meta, StoryObj} from '@storybook/react-vite';

type Mode = 'Light' | 'Dark';

type CaseSpec = {
  props: ButtonProps;
  mode: Mode;
};

// Hover, focus, and press are applied in the browser.
const CASES: Record<string, CaseSpec> = {
  'button-large-contained-primary-default-light': {
    mode: 'Light',
    props: {variant: 'contained', color: 'primary', size: 'large'},
  },
  'button-medium-contained-primary-default-light': {
    mode: 'Light',
    props: {variant: 'contained', color: 'primary', size: 'medium'},
  },
  'button-medium-contained-primary-hover-light': {
    mode: 'Light',
    props: {variant: 'contained', color: 'primary', size: 'medium'},
  },
  'button-medium-contained-primary-focus-light': {
    mode: 'Light',
    props: {variant: 'contained', color: 'primary', size: 'medium'},
  },
  'button-medium-contained-primary-pressed-light': {
    mode: 'Light',
    props: {variant: 'contained', color: 'primary', size: 'medium'},
  },
  'button-small-contained-primary-default-light': {
    mode: 'Light',
    props: {variant: 'contained', color: 'primary', size: 'small'},
  },
  'button-extrasmall-contained-primary-default-light': {
    mode: 'Light',
    props: {variant: 'contained', color: 'primary', size: 'extraSmall'},
  },
  'button-medium-contained-primary-disabled-light': {
    mode: 'Light',
    props: {
      variant: 'contained',
      color: 'primary',
      size: 'medium',
      disabled: true,
    },
  },
  'button-medium-contained-secondary-default-light': {
    mode: 'Light',
    props: {variant: 'contained', color: 'secondary', size: 'medium'},
  },
  'button-medium-contained-error-default-light': {
    mode: 'Light',
    props: {variant: 'contained', color: 'error', size: 'medium'},
  },
  'button-medium-contained-orange-default-light': {
    mode: 'Light',
    props: {variant: 'contained', color: 'orange', size: 'medium'},
  },
  'button-medium-outlined-primary-default-light': {
    mode: 'Light',
    props: {variant: 'outlined', color: 'primary', size: 'medium'},
  },
  'button-medium-outlined-primary-hover-light': {
    mode: 'Light',
    props: {variant: 'outlined', color: 'primary', size: 'medium'},
  },
  'button-medium-text-primary-default-light': {
    mode: 'Light',
    props: {variant: 'text', color: 'primary', size: 'medium'},
  },
  'button-medium-text-primary-pressed-light': {
    mode: 'Light',
    props: {variant: 'text', color: 'primary', size: 'medium'},
  },
  'button-medium-contained-primary-default-dark': {
    mode: 'Dark',
    props: {variant: 'contained', color: 'primary', size: 'medium'},
  },
};

type ParityArgs = {
  component: string;
  caseId: string;
  mode: Mode;
};

function ParityCase({caseId, mode}: ParityArgs) {
  const theme = mode || 'Light';
  const ids =
    caseId === 'all'
      ? Object.keys(CASES).filter(id => CASES[id].mode === theme)
      : [caseId];

  return (
    <div data-parity-root="" data-theme={theme}>
      <style>{`
        [data-parity-root],
        [data-parity-root] * {
          transition: none !important;
          animation: none !important;
        }
      `}</style>
      {ids.map(id => {
        const spec = CASES[id];
        if (!spec) {
          return <p key={id}>Unknown case {id}</p>;
        }
        return (
          <div
            key={id}
            data-parity-capture=""
            data-case-id={id}
            style={{
              width: 320,
              height: 160,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--background-neutral-primary)',
            }}
          >
            <Button data-parity-subject="" {...spec.props}>
              Button
            </Button>
          </div>
        );
      })}
    </div>
  );
}

const meta = {
  title: 'Parity',
  component: ParityCase,
  parameters: {layout: 'fullscreen'},
  args: {
    component: 'Button',
    caseId: 'button-medium-contained-primary-default-light',
    mode: 'Light',
  },
} satisfies Meta<typeof ParityCase>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Case: Story = {};
