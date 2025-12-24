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
        '&:hover': {
          boxShadow: 'none', // Remove shadow on hover
        },
        '&:focus': {
          boxShadow: 'none', // Remove shadow on focus
        },

        '&:focus-visible': {
          outline: '2px solid var(--borders-brand-teal-primary)',
          outlineOffset: '2px',
          borderRadius: '0.375rem',
          boxShadow: 'none', // Remove shadow on focus-visible
        },

        '&:active': {
          border: '1px solid transparent !important',
          boxShadow: 'none', // Remove shadow on active
        },

        '&.Mui-disabled, &[aria-disabled="true"]': {
          cursor: 'not-allowed',
          boxShadow: 'none', // Remove shadow when disabled
        },

        // Force hover state
        '&.force-hover, &[data-force-hover="true"]': {
          boxShadow: 'none',
          textDecoration: 'none',
        },
      };

      // Handle custom colors via data attributes
      // These will be styled based on variant × color combinations
      // Full color × variant styling will be added in next phase

      return baseStyles;
    },
    // Handle custom colors for contained variant (primary type)
    contained: () => {
      return {
        // Primary Purple (default) - can use MUI primary or data-color
        '&.MuiButton-colorPrimary, &[data-color="purple"]': {
          backgroundColor: 'var(--background-brand-purple-primary)',
          color: 'var(--text-neutral-white-fixed)',
          '&:hover, &.force-hover, &[data-force-hover="true"]': {
            backgroundColor: 'var(--background-brand-purple-strong)',
          },
          '&.Mui-disabled': {
            backgroundColor: 'var(--background-neutral-disabled)',
            color: 'var(--text-neutral-disabled-inverse)',
          },
        },
        // Custom colors via data attributes
        '&[data-color="black"]': {
          backgroundColor: 'var(--background-neutral-primary-inverse)',
          color: 'var(--text-neutral-inverse)',
          '&:hover, &.force-hover, &[data-force-hover="true"]': {
            backgroundColor: 'var(--background-neutral-octonary)',
          },
          '&.Mui-disabled': {
            backgroundColor: 'var(--background-neutral-disabled)',
            color: 'var(--text-neutral-disabled-inverse)',
          },
        },
        '&[data-color="white"]': {
          backgroundColor: 'var(--background-neutral-white-fixed)',
          color: 'var(--text-neutral-primary)',
          '&:hover, &.force-hover, &[data-force-hover="true"]': {
            backgroundColor: 'var(--background-neutral-quaternary)',
          },
          '&.Mui-disabled': {
            backgroundColor: 'var(--background-neutral-octonary)',
            color: 'var(--text-neutral-primary)',
          },
        },
        // Destructive (error color) - can use MUI error or data-color
        '&.MuiButton-colorError, &[data-color="destructive"]': {
          backgroundColor: 'var(--background-error-primary)',
          color: 'var(--text-neutral-white-fixed)',
          '&:hover, &.force-hover, &[data-force-hover="true"]': {
            backgroundColor: 'var(--background-error-strong)',
          },
          '&.Mui-disabled': {
            backgroundColor: 'var(--background-neutral-disabled)',
            color: 'var(--text-neutral-disabled-inverse)',
          },
        },
      };
    },
    // Handle custom colors for outlined variant (secondary type)
    outlined: () => {
      return {
        // Secondary Purple (deprecated) - via data-color
        '&[data-color="purple"]': {
          border: '1px solid var(--borders-brand-purple-primary)',
          color: 'var(--text-brand-purple-primary)',
          '&:hover, &.force-hover, &[data-force-hover="true"]': {
            backgroundColor: 'var(--background-brand-purple-hover)',
            border: '1px solid var(--borders-brand-purple-primary)',
            color: 'var(--text-brand-purple-primary)',
          },
          '&:active': {
            border: '1px solid var(--borders-brand-purple-primary) !important',
          },
          '&.Mui-disabled': {
            borderColor: 'var(--borders-neutral-disabled) !important',
            color: 'var(--text-neutral-disabled)',
            backgroundColor: 'var(--background-neutral-primary)',
          },
        },
        // Secondary Black (default secondary)
        '&.MuiButton-colorSecondary, &[data-color="black"]': {
          border: '1px solid var(--borders-neutral-solid)',
          backgroundColor: 'var(--background-neutral-primary)',
          color: 'var(--text-neutral-primary)',
          '&:hover, &.force-hover, &[data-force-hover="true"]': {
            backgroundColor: 'var(--background-neutral-tertiary)',
            border: '1px solid var(--borders-neutral-solid)',
          },
          '&:active': {
            border: '1px solid var(--borders-neutral-solid) !important',
          },
          '&.Mui-disabled': {
            borderColor: 'var(--borders-neutral-disabled) !important',
            color: 'var(--text-neutral-disabled)',
            backgroundColor: 'var(--background-neutral-primary)',
          },
        },
        '&[data-color="gray"]': {
          border: '1px solid var(--borders-neutral-strong)',
          backgroundColor: 'var(--background-neutral-primary)',
          color: 'var(--text-neutral-primary)',
          '&:hover, &.force-hover, &[data-force-hover="true"]': {
            backgroundColor: 'var(--background-neutral-tertiary)',
            border: '1px solid var(--borders-neutral-strong)',
          },
          '&:active': {
            border: '1px solid var(--borders-neutral-strong) !important',
          },
          '&.Mui-disabled': {
            borderColor: 'var(--borders-neutral-disabled) !important',
            color: 'var(--text-neutral-disabled)',
            backgroundColor: 'var(--background-neutral-primary)',
          },
        },
        '&[data-color="white"]': {
          border: '1px solid var(--neutral-base-white)',
          backgroundColor: 'var(--neutral-base-black)',
          color: 'var(--neutral-base-white)',
          '&:hover, &.force-hover, &[data-force-hover="true"]': {
            backgroundColor: 'var(--neutral-gray-80)',
            border: '1px solid var(--neutral-base-white)',
          },
          '&:active': {
            border: '1px solid var(--neutral-base-white) !important',
          },
          '&.Mui-disabled': {
            borderColor: 'var(--neutral-gray-80) !important',
            color: 'var(--neutral-gray-80)',
            backgroundColor: 'unset',
          },
        },
        // Destructive (error color) - can use MUI error or data-color
        '&.MuiButton-colorError, &[data-color="destructive"]': {
          backgroundColor: 'var(--background-neutral-primary)',
          border: '1px solid var(--borders-error-primary)',
          color: 'var(--text-error-primary)',
          '&:hover, &.force-hover, &[data-force-hover="true"]': {
            backgroundColor: 'var(--background-error-light)',
            border: '1px solid var(--borders-error-primary)',
          },
          '&:active': {
            border: '1px solid var(--borders-error-primary) !important',
          },
          '&.Mui-disabled': {
            borderColor: 'var(--borders-neutral-disabled) !important',
            color: 'var(--text-neutral-disabled)',
            backgroundColor: 'var(--background-neutral-primary)',
          },
        },
      };
    },
    // Handle custom colors for text variant (tertiary type)
    text: () => {
      return {
        // Tertiary Purple (default primary) - can use MUI primary or data-color
        '&.MuiButton-colorPrimary, &[data-color="purple"]': {
          color: 'var(--text-brand-purple-primary)',
          '&:hover, &.force-hover, &[data-force-hover="true"]': {
            backgroundColor: 'var(--background-brand-purple-hover)',
            color: 'var(--text-brand-purple-primary)',
          },
          '&:active': {
            backgroundColor: 'var(--background-brand-purple-hover)',
            color: 'var(--text-brand-purple-secondary)',
          },
          '&.Mui-disabled': {
            color: 'var(--text-neutral-disabled)',
            backgroundColor: 'unset',
          },
        },
        '&[data-color="black"]': {
          color: 'var(--text-neutral-primary)',
          '&:hover, &.force-hover, &[data-force-hover="true"]': {
            backgroundColor: 'var(--background-neutral-quaternary)',
            color: 'var(--text-neutral-primary)',
          },
          '&:active': {
            backgroundColor: 'var(--background-neutral-quaternary)',
            color: 'var(--text-neutral-tertiary)',
          },
          '&.Mui-disabled': {
            color: 'var(--text-neutral-disabled)',
            backgroundColor: 'unset',
          },
        },
        '&[data-color="white"]': {
          color: 'var(--text-neutral-inverse)',
          '&:hover, &.force-hover, &[data-force-hover="true"]': {
            backgroundColor: 'var(--neutral-white-alpha-30)',
            color: 'var(--text-neutral-inverse)',
          },
          '&:active': {
            backgroundColor: 'var(--neutral-white-alpha-30)',
            color: 'var(--neutral-gray-20)',
          },
          '&.Mui-disabled': {
            color: 'var(--text-neutral-tertiary)',
            backgroundColor: 'unset',
          },
        },
        '&[data-color="gray"]': {
          color: 'var(--text-neutral-quaternary)',
          '&:hover, &.force-hover, &[data-force-hover="true"]': {
            backgroundColor: 'var(--background-neutral-quaternary)',
            color: 'var(--text-neutral-quaternary)',
          },
          '&:active': {
            backgroundColor: 'var(--background-neutral-quaternary)',
            color: 'var(--text-neutral-tertiary)',
          },
          '&.Mui-disabled': {
            color: 'var(--text-neutral-disabled)',
            backgroundColor: 'unset',
          },
        },
        // Destructive (error color) - can use MUI error or data-color
        '&.MuiButton-colorError, &[data-color="destructive"]': {
          color: 'var(--text-error-primary)',
          '&:hover, &.force-hover, &[data-force-hover="true"]': {
            backgroundColor: 'var(--background-error-light)',
            color: 'var(--text-error-primary)',
          },
          '&:active': {
            backgroundColor: 'var(--background-error-light)',
            color: 'var(--text-error-secondary)',
          },
          '&.Mui-disabled': {
            color: 'var(--text-neutral-disabled)',
            backgroundColor: 'unset',
          },
        },
      };
    },
  },
};
