import type {Components, Theme} from '@mui/material/styles';

const SIZE_SPECS = {
  small: {
    height: '22px',
    fontSize: '0.688rem',
    lineHeight: 1.76,
    iconSize: '0.625rem',
    iconWidth: '1rem',
    closeSize: '1rem',
  },
  medium: {
    height: '24px',
    fontSize: '0.813rem',
    lineHeight: 1.64,
    iconSize: '0.75rem',
    iconWidth: '1.125rem',
    closeSize: '1.125rem',
  },
  large: {
    height: '26px',
    fontSize: '0.875rem',
    lineHeight: 1.54,
    iconSize: '0.875rem',
    iconWidth: '1.25rem',
    closeSize: '1.125rem',
  },
};

const LIGHT_COLOR_STYLES = {
  teal: {
    backgroundColor: 'var(--background-brand-teal-light)',
    textColor: 'var(--text-neutral-primary)',
    iconColor: 'var(--text-brand-teal-primary)',
  },
  purple: {
    backgroundColor: 'var(--background-brand-purple-light)',
    textColor: 'var(--text-neutral-primary)',
    iconColor: 'var(--text-brand-purple-primary)',
  },
  aqua: {
    backgroundColor: 'var(--background-brand-aqua-light)',
    textColor: 'var(--text-neutral-primary)',
    iconColor: 'var(--text-brand-aqua-secondary)',
  },
  error: {
    backgroundColor: 'var(--background-error-light)',
    textColor: 'var(--text-neutral-primary)',
    iconColor: 'var(--text-error-primary)',
  },
  warning: {
    backgroundColor: 'var(--background-warning-light)',
    textColor: 'var(--text-neutral-primary)',
    iconColor: 'var(--text-warning-secondary)',
  },
  success: {
    backgroundColor: 'var(--background-success-light)',
    textColor: 'var(--text-neutral-primary)',
    iconColor: 'var(--text-success-primary)',
  },
  gray: {
    backgroundColor: 'var(--background-neutral-tertiary)',
    textColor: 'var(--text-neutral-primary)',
    iconColor: 'var(--text-neutral-primary)',
  },
  disabled: {
    backgroundColor: 'var(--background-neutral-disabled)',
    textColor: 'var(--text-neutral-disabled-inverse)',
    iconColor: 'var(--text-neutral-disabled-inverse)',
    closeColor: 'var(--text-neutral-disabled-inverse)',
  },
};

const SOLID_COLOR_STYLES = {
  teal: {
    backgroundColor: 'var(--background-brand-teal-primary)',
    textColor: 'var(--text-neutral-white-fixed)',
  },
  purple: {
    backgroundColor: 'var(--background-brand-purple-primary)',
    textColor: 'var(--text-neutral-white-fixed)',
  },
  aqua: {
    backgroundColor: 'var(--background-brand-aqua-primary)',
    textColor: 'var(--text-neutral-black-fixed)',
  },
  error: {
    backgroundColor: 'var(--background-error-primary)',
    textColor: 'var(--text-neutral-white-fixed)',
  },
  warning: {
    backgroundColor: 'var(--background-warning-primary)',
    textColor: 'var(--text-neutral-black-fixed)',
  },
  success: {
    backgroundColor: 'var(--background-success-primary)',
    textColor: 'var(--text-neutral-white-fixed)',
  },
  gray: {
    backgroundColor: 'var(--background-neutral-septenary)',
    textColor: 'var(--text-neutral-inverse)',
  },
  disabled: {
    backgroundColor: 'var(--background-neutral-disabled)',
    textColor: 'var(--text-neutral-disabled-inverse)',
  },
};

const createVariantStyles = (
  variant: 'light' | 'solid',
  color: keyof typeof LIGHT_COLOR_STYLES,
  styles: {
    backgroundColor: string;
    textColor: string;
    iconColor?: string;
    closeColor?: string;
  },
) => ({
  props: {variant, color},
  style: {
    backgroundColor: styles.backgroundColor,
    color: styles.textColor,
    border: 'none',
    '& .tag-icon': {
      color: styles.iconColor ?? 'currentColor',
    },
    '& .tag-close-button': {
      color:
        styles.closeColor ??
        (variant === 'solid'
          ? styles.textColor
          : 'var(--text-neutral-secondary)'),
    },
    '& .tag-close-button i': {
      color: 'currentColor',
    },
    '& .tag-close-button:hover:not(:disabled)': {
      opacity: 0.8,
    },
  },
});

export const CHIP_OVERRIDES: Components<Theme>['MuiChip'] = {
  defaultProps: {
    variant: 'light',
    color: 'teal',
    size: 'medium',
  },
  styleOverrides: {
    root: {
      borderRadius: '6.25rem',
      padding: '2px 12px',
      maxWidth: '15em',
      '&.tag-has-icon-left': {
        paddingLeft: '8px',
      },
      '&.tag-has-icon-right, &.tag-has-action': {
        paddingRight: '8px',
      },
    },
    label: {
      padding: 0,
      textTransform: 'uppercase',
      fontWeight: 600,
      letterSpacing: '0.04rem',
    },
  },
  variants: [
    {
      props: {size: 'small'},
      style: {
        height: SIZE_SPECS.small.height,
        fontSize: SIZE_SPECS.small.fontSize,
        lineHeight: SIZE_SPECS.small.lineHeight,
        '& .MuiChip-label': {
          fontSize: SIZE_SPECS.small.fontSize,
          lineHeight: SIZE_SPECS.small.lineHeight,
        },
        '& .tag-icon': {
          fontSize: SIZE_SPECS.small.iconSize,
          width: SIZE_SPECS.small.iconWidth,
        },
        '& .tag-close-button': {
          width: SIZE_SPECS.small.closeSize,
          height: SIZE_SPECS.small.closeSize,
        },
        '& .tag-close-button i': {
          fontSize: SIZE_SPECS.small.iconSize,
        },
      },
    },
    {
      props: {size: 'medium'},
      style: {
        height: SIZE_SPECS.medium.height,
        fontSize: SIZE_SPECS.medium.fontSize,
        lineHeight: SIZE_SPECS.medium.lineHeight,
        '& .MuiChip-label': {
          fontSize: SIZE_SPECS.medium.fontSize,
          lineHeight: SIZE_SPECS.medium.lineHeight,
        },
        '& .tag-icon': {
          fontSize: SIZE_SPECS.medium.iconSize,
          width: SIZE_SPECS.medium.iconWidth,
        },
        '& .tag-close-button': {
          width: SIZE_SPECS.medium.closeSize,
          height: SIZE_SPECS.medium.closeSize,
        },
        '& .tag-close-button i': {
          fontSize: SIZE_SPECS.medium.iconSize,
        },
      },
    },
    {
      props: {size: 'large'},
      style: {
        height: SIZE_SPECS.large.height,
        fontSize: SIZE_SPECS.large.fontSize,
        lineHeight: SIZE_SPECS.large.lineHeight,
        '& .MuiChip-label': {
          fontSize: SIZE_SPECS.large.fontSize,
          lineHeight: SIZE_SPECS.large.lineHeight,
        },
        '& .tag-icon': {
          fontSize: SIZE_SPECS.large.iconSize,
          width: SIZE_SPECS.large.iconWidth,
        },
        '& .tag-close-button': {
          width: SIZE_SPECS.large.closeSize,
          height: SIZE_SPECS.large.closeSize,
        },
        '& .tag-close-button i': {
          fontSize: SIZE_SPECS.large.iconSize,
        },
      },
    },
    createVariantStyles('light', 'teal', LIGHT_COLOR_STYLES.teal),
    createVariantStyles('light', 'purple', LIGHT_COLOR_STYLES.purple),
    createVariantStyles('light', 'aqua', LIGHT_COLOR_STYLES.aqua),
    createVariantStyles('light', 'error', LIGHT_COLOR_STYLES.error),
    createVariantStyles('light', 'warning', LIGHT_COLOR_STYLES.warning),
    createVariantStyles('light', 'success', LIGHT_COLOR_STYLES.success),
    createVariantStyles('light', 'gray', LIGHT_COLOR_STYLES.gray),
    createVariantStyles('light', 'disabled', LIGHT_COLOR_STYLES.disabled),
    createVariantStyles('solid', 'teal', SOLID_COLOR_STYLES.teal),
    createVariantStyles('solid', 'purple', SOLID_COLOR_STYLES.purple),
    createVariantStyles('solid', 'aqua', SOLID_COLOR_STYLES.aqua),
    createVariantStyles('solid', 'error', SOLID_COLOR_STYLES.error),
    createVariantStyles('solid', 'warning', SOLID_COLOR_STYLES.warning),
    createVariantStyles('solid', 'success', SOLID_COLOR_STYLES.success),
    createVariantStyles('solid', 'gray', SOLID_COLOR_STYLES.gray),
    createVariantStyles('solid', 'disabled', SOLID_COLOR_STYLES.disabled),
  ],
};
