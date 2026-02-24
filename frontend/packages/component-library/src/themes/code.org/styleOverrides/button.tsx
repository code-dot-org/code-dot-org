import {Components, Theme} from '@mui/material/styles';

/**
 * MUI Button style overrides to match the existing button design.
 * Extends MUI's size and color systems to support custom options:
 * - Sizes: xs, s, m, l (in addition to small, medium, large)
 * - Colors: purple, black, gray, white, destructive (in addition to primary, secondary, error)
 */

// Size specifications matching genericButton.module.scss
const SIZE_SPECS = {
  xs: {
    padding: '0.125rem 0.5rem',
    gap: '0.25rem',
    fontSize: '0.75rem', // button-four-text
    lineHeight: 1.64, // button-four-text
    iconSize: '0.8125rem',
    iconWidth: '1rem',
    iconOnlyPadding: '0.25rem',
    iconOnlyMinWidth: '1.5rem',
  },
  s: {
    padding: '0.3125rem 1rem',
    gap: '0.5rem',
    fontSize: '0.875rem', // button-three-text
    lineHeight: 1.54, // button-three-text
    iconSize: '0.875rem',
    iconWidth: '1.125rem',
    iconOnlyPadding: '0.4375rem',
    iconOnlyMinWidth: '2rem',
  },
  m: {
    padding: '0.5rem 1rem',
    gap: '0.5rem',
    fontSize: '1rem', // button-two-text
    lineHeight: 1.48, // button-two-text
    iconSize: '1rem',
    iconWidth: '1.25rem',
    iconOnlyPadding: '0.625rem',
    iconOnlyMinWidth: '2.5rem',
  },
  l: {
    padding: '0.625rem 1rem',
    gap: '0.5rem',
    fontSize: '1.25rem', // button-one-text
    lineHeight: 1.4, // button-one-text
    iconSize: '1.1875rem',
    iconWidth: '1.5rem',
    iconOnlyPadding: '0.75rem',
    iconOnlyMinWidth: '3rem',
  },
};

export const BUTTON_OVERRIDES: Components<Theme>['MuiButton'] = {
  defaultProps: {
    disableRipple: true,
  },
  // Add variants for custom sizes
  variants: [
    // Extra small size
    {
      props: {size: 'extraSmall'},
      style: () => {
        const specs = SIZE_SPECS.xs;
        return {
          padding: specs.padding,
          gap: specs.gap,
          minHeight: 'auto',
          fontSize: specs.fontSize,
          lineHeight: specs.lineHeight,
          '& .MuiButton-startIcon, & .MuiButton-endIcon': {
            fontSize: specs.iconSize,
            width: specs.iconWidth,
            '& i': {
              fontSize: specs.iconSize,
              width: specs.iconWidth,
            },
          },
          '&[data-icon-only="true"]': {
            padding: specs.iconOnlyPadding,
            minWidth: specs.iconOnlyMinWidth,
          },
        };
      },
    },
    // Small size
    {
      props: {size: 'small'},
      style: () => {
        const specs = SIZE_SPECS.s;
        return {
          padding: specs.padding,
          gap: specs.gap,
          minHeight: 'auto',
          fontSize: specs.fontSize,
          lineHeight: specs.lineHeight,
          '& .MuiButton-startIcon, & .MuiButton-endIcon': {
            fontSize: specs.iconSize,
            width: specs.iconWidth,
            '& i': {
              fontSize: specs.iconSize,
              width: specs.iconWidth,
            },
          },
          '&[data-icon-only="true"]': {
            padding: specs.iconOnlyPadding,
            minWidth: specs.iconOnlyMinWidth,
          },
        };
      },
    },
    // Medium size (default)
    {
      props: {size: 'medium'},
      style: () => {
        const specs = SIZE_SPECS.m;
        return {
          padding: specs.padding,
          gap: specs.gap,
          minHeight: 'auto',
          fontSize: specs.fontSize,
          lineHeight: specs.lineHeight,
          '& .MuiButton-startIcon, & .MuiButton-endIcon': {
            fontSize: specs.iconSize,
            width: specs.iconWidth,
            '& i': {
              fontSize: specs.iconSize,
              width: specs.iconWidth,
            },
          },
          '&[data-icon-only="true"]': {
            padding: specs.iconOnlyPadding,
            minWidth: specs.iconOnlyMinWidth,
          },
        };
      },
    },
    // Large size
    {
      props: {size: 'large'},
      style: () => {
        const specs = SIZE_SPECS.l;
        return {
          padding: specs.padding,
          gap: specs.gap,
          minHeight: 'auto',
          fontSize: specs.fontSize,
          lineHeight: specs.lineHeight,
          '& .MuiButton-startIcon, & .MuiButton-endIcon': {
            fontSize: specs.iconSize,
            width: specs.iconWidth,
            '& i': {
              fontSize: specs.iconSize,
              width: specs.iconWidth,
            },
          },
          '&[data-icon-only="true"]': {
            padding: specs.iconOnlyPadding,
            minWidth: specs.iconOnlyMinWidth,
          },
        };
      },
    },

    // Contained (primary) variant × color combinations
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

    // Outlined (secondary) variant × color combinations
    {
      props: {variant: 'outlined', color: 'primary'},
      style: {
        border: '1px solid var(--borders-brand-purple-primary)',
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
          borderColor: 'var(--borders-neutral-disabled) !important',
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
          borderColor: 'var(--borders-neutral-disabled) !important',
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
          color: 'var(--neutral-base-white)',
        },
        '&.Mui-disabled': {
          borderColor: 'var(--neutral-gray-80) !important',
          color: 'var(--neutral-gray-80)',
          backgroundColor: 'unset',
        },
      },
    },
    {
      props: {variant: 'outlined', color: 'error'},
      style: {
        backgroundColor: 'var(--background-neutral-primary)',
        border: '1px solid var(--borders-error-primary)',
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
          borderColor: 'var(--borders-neutral-disabled) !important',
          color: 'var(--text-neutral-disabled)',
          backgroundColor: 'var(--background-neutral-primary)',
        },
      },
    },

    // Text (tertiary) variant × color combinations
    {
      props: {variant: 'text', color: 'primary'},
      style: {
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
          backgroundColor: 'unset',
        },
      },
    },
    {
      props: {variant: 'text', color: 'secondary'},
      style: {
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
          backgroundColor: 'unset',
        },
      },
    },
    {
      props: {variant: 'text', color: 'tertiary'},
      style: {
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
          backgroundColor: 'unset',
        },
      },
    },
    {
      props: {variant: 'text', color: 'white'},
      style: {
        color: 'var(--neutral-base-white)',
        '&:hover, &.force-hover, &[data-force-hover="true"]': {
          backgroundColor: 'var(--neutral-white-alpha-30)',
          color: 'var(--neutral-base-white)',
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
          backgroundColor: 'unset',
        },
      },
    },
    {
      props: {variant: 'text', color: 'error'},
      style: {
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
          backgroundColor: 'unset',
        },
      },
    },
  ],
  styleOverrides: {
    root: () => {
      const baseStyles: Record<
        string,
        string | number | Record<string, string | number>
      > = {
        borderRadius: '0.25rem',
        boxSizing: 'border-box',
        margin: 0,
        border: '1px solid transparent',
        textDecoration: 'none',
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        display: 'inline-flex',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        fontWeight: 600, // Button text is always bold
        textTransform: 'none', // Remove MUI's default uppercase
        minHeight: 'auto', // Remove MUI's default minHeight
        lineHeight: 'normal', // Use normal line height
        boxShadow: 'none', // Remove MUI's default shadow
        // Override global link styles when button is rendered as <a>
        // Using more specific selectors to override global a:hover, a:focus, a:active
        '&:hover, a&:hover': {
          boxShadow: 'none', // Remove shadow on hover
          textDecoration: 'none', // Override global a:hover styles via specificity
        },
        '&:focus, a&:focus': {
          boxShadow: 'none', // Remove shadow on focus
          textDecoration: 'none',
          outline: 'none', // Remove default outline to use focus-visible styles
        },

        '&:focus-visible, a&:focus-visible': {
          outline: '2px solid var(--borders-brand-teal-primary)',
          outlineOffset: '2px',
          borderRadius: '0.375rem',
          boxShadow: 'none', // Remove shadow on focus-visible
          textDecoration: 'none',
        },

        '&:active, a&:active': {
          border: '1px solid transparent',
          boxShadow: 'none', // Remove shadow on active
          textDecoration: 'none',
        },

        '&.Mui-disabled, &[aria-disabled="true"]': {
          cursor: 'not-allowed',
          boxShadow: 'none', // Remove shadow when disabled
        },

        // Disable ripple effect (CSS fallback in case defaultProps doesn't work)
        '& .MuiTouchRipple-root': {
          display: 'none',
        },

        // Force hover state
        '&.force-hover, &[data-force-hover="true"]': {
          boxShadow: 'none',
          textDecoration: 'none',
        },

        // Remove margins from startIcon and endIcon - use gap instead (matching genericButton.module.scss)
        '& .MuiButton-startIcon': {
          marginLeft: 0,
          marginRight: 0,
        },
        '& .MuiButton-endIcon': {
          marginLeft: 0,
          marginRight: 0,
        },

        // Pending state with hidden text - center the spinner
        '&.buttonPendingWithHiddenText': {
          position: 'relative',
        },
        '&.buttonPendingWithHiddenText .MuiButton-startIcon': {
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          margin: 0,
        },
      };

      return baseStyles;
    },
    // Color styling is now handled via variants above
    // These are intentional placeholders. In MUI, styleOverrides.variantName can override variant styles,
    // but since all variant × color styling is handled in the variants array, these are
    // kept empty to prevent MUI from applying default variant styles that would conflict with our custom styling.
    contained: () => ({}),
    outlined: () => ({}),
    text: () => ({}),
  },
};
