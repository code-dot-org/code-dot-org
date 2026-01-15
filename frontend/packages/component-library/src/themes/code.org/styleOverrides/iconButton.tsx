import type {IconButtonProps} from '@mui/material/IconButton';

/**
 * MUI IconButton style overrides to match icon-only button design.
 * Extends MUI's size system to support custom sizes: xs, s, m, l
 * Uses variants pattern similar to Button (primary/contained, secondary/outlined, tertiary/text)
 */

// Helper type for variant props that includes our extended types
type ExtendedIconButtonProps = Partial<
  IconButtonProps & {
    size: 'extraSmall' | 'small' | 'medium' | 'large';
    variant: 'contained' | 'outlined' | 'text';
    color: 'primary' | 'secondary' | 'error' | 'white' | 'tertiary';
  }
>;

// Size specifications for icon-only buttons matching genericButton.module.scss
const ICON_BUTTON_SIZE_SPECS = {
  xs: {
    padding: '0.25rem',
    minWidth: '1.5rem',
    minHeight: '1.5rem',
    iconSize: '0.8125rem',
    iconWidth: '1rem',
  },
  s: {
    padding: '0.4375rem',
    minWidth: '2rem',
    minHeight: '2rem',
    iconSize: '0.875rem',
    iconWidth: '1.125rem',
  },
  m: {
    padding: '0.625rem',
    minWidth: '2.5rem',
    minHeight: '2.5rem',
    iconSize: '1rem',
    iconWidth: '1.25rem',
  },
  l: {
    padding: '0.75rem',
    minWidth: '3rem',
    minHeight: '3rem',
    iconSize: '1.1875rem',
    iconWidth: '1.5rem',
  },
};

// Create variants with proper typing
// Using satisfies to validate structure without type assertions
const iconButtonVariants = [
  // Size variants - matching genericButton.module.scss icon-only styles
  {
    props: {size: 'extraSmall'},
    style: {
      padding: ICON_BUTTON_SIZE_SPECS.xs.padding,
      minWidth: ICON_BUTTON_SIZE_SPECS.xs.minWidth,
      minHeight: ICON_BUTTON_SIZE_SPECS.xs.minHeight,
      '& svg, & i': {
        fontSize: ICON_BUTTON_SIZE_SPECS.xs.iconSize,
        // lineHeight: '125%',
        width: ICON_BUTTON_SIZE_SPECS.xs.iconWidth,
      },
    },
  },
  {
    props: {size: 'small'},
    style: {
      padding: ICON_BUTTON_SIZE_SPECS.s.padding,
      minWidth: ICON_BUTTON_SIZE_SPECS.s.minWidth,
      minHeight: ICON_BUTTON_SIZE_SPECS.s.minHeight,
      '& svg, & i': {
        fontSize: ICON_BUTTON_SIZE_SPECS.s.iconSize,
        lineHeight: '125%',
        width: ICON_BUTTON_SIZE_SPECS.s.iconWidth,
      },
    },
  },
  {
    props: {size: 'medium'},
    style: {
      padding: ICON_BUTTON_SIZE_SPECS.m.padding,
      minWidth: ICON_BUTTON_SIZE_SPECS.m.minWidth,
      minHeight: ICON_BUTTON_SIZE_SPECS.m.minHeight,
      '& svg, & i': {
        fontSize: ICON_BUTTON_SIZE_SPECS.m.iconSize,
        lineHeight: '125%',
        width: ICON_BUTTON_SIZE_SPECS.m.iconWidth,
      },
    },
  },
  {
    props: {size: 'large'},
    style: {
      padding: ICON_BUTTON_SIZE_SPECS.l.padding,
      minWidth: ICON_BUTTON_SIZE_SPECS.l.minWidth,
      minHeight: ICON_BUTTON_SIZE_SPECS.l.minHeight,
      '& svg, & i': {
        fontSize: ICON_BUTTON_SIZE_SPECS.l.iconSize,
        lineHeight: '125%',
        width: ICON_BUTTON_SIZE_SPECS.l.iconWidth,
      },
    },
  },

  // Contained variant × color combinations
  {
    props: {variant: 'contained', color: 'primary'},
    style: {
      backgroundColor: 'var(--background-brand-purple-primary)',
      color: 'var(--text-neutral-white-fixed)',
      '&:hover, &.force-hover, &[data-force-hover="true"]': {
        backgroundColor: 'var(--background-brand-purple-strong)',
        color: 'var(--text-neutral-white-fixed)',
      },
      '&:focus, a&:focus': {
        color: 'var(--text-neutral-white-fixed)',
      },
      '&:active, a&:active': {
        color: 'var(--text-neutral-white-fixed)',
      },
      '&.Mui-disabled': {
        backgroundColor: 'var(--background-neutral-disabled)',
        color: 'var(--text-neutral-disabled-inverse)',
      },
    },
  },
  {
    props: {variant: 'contained', color: 'secondary'},
    style: {
      backgroundColor: 'var(--background-neutral-primary-inverse)',
      color: 'var(--text-neutral-inverse)',
      '&:hover, &.force-hover, &[data-force-hover="true"]': {
        backgroundColor: 'var(--background-neutral-octonary)',
        color: 'var(--text-neutral-inverse)',
      },
      '&:focus, a&:focus': {
        color: 'var(--text-neutral-inverse)',
      },
      '&:active, a&:active': {
        color: 'var(--text-neutral-inverse)',
      },
      '&.Mui-disabled': {
        backgroundColor: 'var(--background-neutral-disabled)',
        color: 'var(--text-neutral-disabled-inverse)',
      },
    },
  },
  {
    props: {variant: 'contained', color: 'white'},
    style: {
      backgroundColor: 'var(--background-neutral-white-fixed)',
      color: 'var(--text-neutral-primary)',
      '&:hover, &.force-hover, &[data-force-hover="true"]': {
        backgroundColor: 'var(--background-neutral-quaternary)',
        color: 'var(--text-neutral-primary)',
      },
      '&:focus, a&:focus': {
        color: 'var(--text-neutral-primary)',
      },
      '&:active, a&:active': {
        color: 'var(--text-neutral-primary)',
      },
      '&.Mui-disabled': {
        backgroundColor: 'var(--background-neutral-octonary)',
        color: 'var(--text-neutral-primary)',
      },
    },
  },
  {
    props: {variant: 'contained', color: 'error'},
    style: {
      backgroundColor: 'var(--background-error-primary)',
      color: 'var(--text-neutral-white-fixed)',
      '&:hover, &.force-hover, &[data-force-hover="true"]': {
        backgroundColor: 'var(--background-error-strong)',
        color: 'var(--text-neutral-white-fixed)',
      },
      '&:focus, a&:focus': {
        color: 'var(--text-neutral-white-fixed)',
      },
      '&:active, a&:active': {
        color: 'var(--text-neutral-white-fixed)',
      },
      '&.Mui-disabled': {
        backgroundColor: 'var(--background-neutral-disabled)',
        color: 'var(--text-neutral-disabled-inverse)',
      },
    },
  },

  // Outlined variant × color combinations
  {
    props: {variant: 'outlined', color: 'primary'},
    style: {
      border: '1px solid var(--borders-brand-purple-primary)',
      backgroundColor: 'transparent',
      color: 'var(--text-brand-purple-primary)',
      '&:hover, &.force-hover, &[data-force-hover="true"]': {
        backgroundColor: 'var(--background-brand-purple-hover)',
        border: '1px solid var(--borders-brand-purple-primary)',
        color: 'var(--text-brand-purple-primary)',
      },
      '&:focus, a&:focus': {
        color: 'var(--text-brand-purple-primary)',
      },
      '&:active, a&:active': {
        border: '1px solid var(--borders-brand-purple-primary)',
        color: 'var(--text-brand-purple-primary)',
      },
      '&.Mui-disabled': {
        borderColor: 'var(--borders-neutral-disabled) !important',
        color: 'var(--text-neutral-disabled)',
        backgroundColor: 'var(--background-neutral-primary)',
      },
    },
  },
  {
    props: {variant: 'outlined', color: 'secondary'},
    style: {
      border: '1px solid var(--borders-neutral-solid)',
      backgroundColor: 'var(--background-neutral-primary)',
      color: 'var(--text-neutral-primary)',
      '&:hover, &.force-hover, &[data-force-hover="true"]': {
        backgroundColor: 'var(--background-neutral-tertiary)',
        border: '1px solid var(--borders-neutral-solid)',
        color: 'var(--text-neutral-primary)',
      },
      '&:focus, a&:focus': {
        color: 'var(--text-neutral-primary)',
      },
      '&:active, a&:active': {
        border: '1px solid var(--borders-neutral-solid)',
        color: 'var(--text-neutral-primary)',
      },
      '&.Mui-disabled': {
        borderColor: 'var(--borders-neutral-disabled)',
        color: 'var(--text-neutral-disabled)',
        backgroundColor: 'var(--background-neutral-primary)',
      },
    },
  },
  {
    props: {variant: 'outlined', color: 'tertiary'},
    style: {
      border: '1px solid var(--borders-neutral-strong)',
      backgroundColor: 'var(--background-neutral-primary)',
      color: 'var(--text-neutral-primary)',
      '&:hover, &.force-hover, &[data-force-hover="true"]': {
        backgroundColor: 'var(--background-neutral-tertiary)',
        border: '1px solid var(--borders-neutral-strong)',
        color: 'var(--text-neutral-primary)',
      },
      '&:focus, a&:focus': {
        color: 'var(--text-neutral-primary)',
      },
      '&:active, a&:active': {
        border: '1px solid var(--borders-neutral-strong)',
        color: 'var(--text-neutral-primary)',
      },
      '&.Mui-disabled': {
        borderColor: 'var(--borders-neutral-disabled)',
        color: 'var(--text-neutral-disabled)',
        backgroundColor: 'var(--background-neutral-primary)',
      },
    },
  },
  {
    props: {variant: 'outlined', color: 'white'},
    style: {
      border: '1px solid var(--neutral-base-white)',
      backgroundColor: 'var(--neutral-base-black)',
      color: 'var(--neutral-base-white)',
      '&:hover, &.force-hover, &[data-force-hover="true"]': {
        backgroundColor: 'var(--neutral-gray-80)',
        border: '1px solid var(--neutral-base-white)',
        color: 'var(--neutral-base-white)',
      },
      '&:focus, a&:focus': {
        color: 'var(--neutral-base-white)',
      },
      '&:active, a&:active': {
        border: '1px solid var(--neutral-base-white)',
        color: 'var(--neutral-base-white)', // Override global link styles via specificity
      },
      '&.Mui-disabled': {
        borderColor: 'var(--neutral-gray-80)',
        color: 'var(--neutral-gray-80)',
        backgroundColor: 'unset',
      },
    },
  },
  {
    props: {variant: 'outlined', color: 'error'},
    style: {
      border: '1px solid var(--borders-error-primary)',
      backgroundColor: 'var(--background-neutral-primary)',
      color: 'var(--text-error-primary)',
      '&:hover, &.force-hover, &[data-force-hover="true"]': {
        backgroundColor: 'var(--background-error-light)',
        border: '1px solid var(--borders-error-primary)',
        color: 'var(--text-error-primary)',
      },
      '&:focus, a&:focus': {
        color: 'var(--text-error-primary)',
      },
      '&:active, a&:active': {
        border: '1px solid var(--borders-error-primary)',
        color: 'var(--text-error-primary)',
      },
      '&.Mui-disabled': {
        borderColor: 'var(--borders-neutral-disabled)',
        color: 'var(--text-neutral-disabled)',
        backgroundColor: 'var(--background-neutral-primary)',
      },
    },
  },

  // Text variant × color combinations
  {
    props: {variant: 'text', color: 'primary'},
    style: {
      backgroundColor: 'transparent',
      color: 'var(--text-brand-purple-primary)',
      '&:hover, &.force-hover, &[data-force-hover="true"]': {
        backgroundColor: 'var(--background-brand-purple-hover)',
        color: 'var(--text-brand-purple-primary)',
      },
      '&:focus, a&:focus': {
        color: 'var(--text-brand-purple-primary)',
      },
      '&:active, a&:active': {
        backgroundColor: 'var(--background-brand-purple-hover)',
        color: 'var(--text-brand-purple-secondary)',
      },
      '&.Mui-disabled': {
        color: 'var(--text-neutral-disabled)',
        backgroundColor: 'transparent',
      },
    },
  },
  {
    props: {variant: 'text', color: 'secondary'},
    style: {
      backgroundColor: 'transparent',
      color: 'var(--text-neutral-primary)',
      '&:hover, &.force-hover, &[data-force-hover="true"]': {
        backgroundColor: 'var(--background-neutral-quaternary)',
        color: 'var(--text-neutral-primary)',
      },
      '&:focus, a&:focus': {
        color: 'var(--text-neutral-primary)',
      },
      '&:active, a&:active': {
        backgroundColor: 'var(--background-neutral-quaternary)',
        color: 'var(--text-neutral-tertiary)',
      },
      '&.Mui-disabled': {
        color: 'var(--text-neutral-disabled)',
        backgroundColor: 'transparent',
      },
    },
  },
  {
    props: {variant: 'text', color: 'tertiary'},
    style: {
      backgroundColor: 'transparent',
      color: 'var(--text-neutral-quaternary)',
      '&:hover, &.force-hover, &[data-force-hover="true"]': {
        backgroundColor: 'var(--background-neutral-quaternary)',
        color: 'var(--text-neutral-quaternary)',
      },
      '&:focus, a&:focus': {
        color: 'var(--text-neutral-quaternary)',
      },
      '&:active, a&:active': {
        backgroundColor: 'var(--background-neutral-quaternary)',
        color: 'var(--text-neutral-tertiary)',
      },
      '&.Mui-disabled': {
        color: 'var(--text-neutral-disabled)',
        backgroundColor: 'transparent',
      },
    },
  },
  {
    props: {variant: 'text', color: 'white'},
    style: {
      backgroundColor: 'transparent',
      color: 'var(--text-neutral-inverse)',
      '&:hover, &.force-hover, &[data-force-hover="true"]': {
        backgroundColor: 'var(--neutral-white-alpha-30)',
        color: 'var(--text-neutral-inverse)',
      },
      '&:focus, a&:focus': {
        color: 'var(--text-neutral-inverse)',
      },
      '&:active, a&:active': {
        backgroundColor: 'var(--neutral-white-alpha-30)',
        color: 'var(--neutral-gray-20)',
      },
      '&.Mui-disabled': {
        color: 'var(--text-neutral-tertiary)',
        backgroundColor: 'transparent',
      },
    },
  },
  {
    props: {variant: 'text', color: 'error'},
    style: {
      backgroundColor: 'transparent',
      color: 'var(--text-error-primary)',
      '&:hover, &.force-hover, &[data-force-hover="true"]': {
        backgroundColor: 'var(--background-error-light)',
        color: 'var(--text-error-primary)',
      },
      '&:focus, a&:focus': {
        color: 'var(--text-error-primary)',
      },
      '&:active, a&:active': {
        backgroundColor: 'var(--background-error-light)',
        color: 'var(--text-error-secondary)',
      },
      '&.Mui-disabled': {
        color: 'var(--text-neutral-disabled)',
        backgroundColor: 'transparent',
      },
    },
  },
] satisfies Array<{
  props: ExtendedIconButtonProps;
  style: unknown;
}>;

export const ICON_BUTTON_OVERRIDES = {
  variants: iconButtonVariants,
  styleOverrides: {
    root: () => {
      return {
        borderRadius: '0.25rem', // Force square corners (MUI defaults to circular)
        transition: 'all 0.2s ease-in-out',
        boxShadow: 'none', // Remove MUI's default shadow
        minWidth: 'auto', // Remove MUI's default minWidth
        padding: '0', // Padding is handled by size variants
        textDecoration: 'none',
        // Override global link styles when iconButton is rendered as <a>
        '&:hover, a&:hover': {
          boxShadow: 'none', // Remove shadow on hover
          textDecoration: 'none',
        },
        '&:focus, a&:focus': {
          boxShadow: 'none', // Remove shadow on focus
          textDecoration: 'none',
          outline: 'none',
        },

        '&:focus-visible, a&:focus-visible': {
          outline: '2px solid var(--borders-brand-teal-primary)',
          outlineOffset: '2px',
          borderRadius: '0.375rem',
          boxShadow: 'none', // Remove shadow on focus-visible
          textDecoration: 'none',
        },

        '&:active, a&:active': {
          boxShadow: 'none', // Remove shadow on active
          textDecoration: 'none',
        },

        '&.Mui-disabled': {
          cursor: 'not-allowed',
          boxShadow: 'none', // Remove shadow when disabled
        },

        // Force hover state (still supports data attribute for backwards compatibility)
        '&.force-hover, &[data-force-hover="true"]': {
          boxShadow: 'none',
          textDecoration: 'none',
        },

        // Disable ripple effect (CSS fallback in case defaultProps doesn't work)
        '& .MuiTouchRipple-root': {
          display: 'none',
        },
      };
    },
  },
};
