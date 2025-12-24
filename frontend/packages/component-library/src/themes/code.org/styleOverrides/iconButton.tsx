import {Components, Theme} from '@mui/material/styles';

/**
 * MUI IconButton style overrides to match icon-only button design.
 * Extends MUI's size system to support custom sizes: xs, s, m, l
 * Uses variants pattern similar to Button (primary/contained, secondary/outlined, tertiary/text)
 */

// Type for variant props that includes data attributes
// Using Record<string, unknown> to be compatible with MUI's variant system
// MUI's variant props accept any object for matching, and Record<string, unknown>
// is the type-safe way to represent this without using 'any'
type IconButtonVariantProps = Record<string, unknown>;

// Size specifications for icon-only buttons matching genericButton.module.scss
const ICON_BUTTON_SIZE_SPECS = {
  xs: {
    padding: '0.25rem',
    minWidth: '1.5rem',
    iconSize: '0.8125rem',
  },
  s: {
    padding: '0.4375rem',
    minWidth: '2rem',
    iconSize: '0.875rem',
  },
  m: {
    padding: '0.625rem',
    minWidth: '2.5rem',
    iconSize: '1rem',
  },
  l: {
    padding: '0.75rem',
    minWidth: '3rem',
    iconSize: '1.1875rem',
  },
};

export const ICON_BUTTON_OVERRIDES: Components<Theme>['MuiIconButton'] = {
  variants: [
    // Size variants
    {
      props: {size: 'extraSmall'},
      style: {
        padding: ICON_BUTTON_SIZE_SPECS.xs.padding,
        minWidth: ICON_BUTTON_SIZE_SPECS.xs.minWidth,
        '& svg, & i': {
          fontSize: ICON_BUTTON_SIZE_SPECS.xs.iconSize,
        },
      },
    },
    {
      props: {size: 'small'},
      style: {
        padding: ICON_BUTTON_SIZE_SPECS.s.padding,
        minWidth: ICON_BUTTON_SIZE_SPECS.s.minWidth,
        '& svg, & i': {
          fontSize: ICON_BUTTON_SIZE_SPECS.s.iconSize,
        },
      },
    },
    {
      props: {size: 'medium'},
      style: {
        padding: ICON_BUTTON_SIZE_SPECS.m.padding,
        minWidth: ICON_BUTTON_SIZE_SPECS.m.minWidth,
        '& svg, & i': {
          fontSize: ICON_BUTTON_SIZE_SPECS.m.iconSize,
        },
      },
    },
    {
      props: {size: 'large'},
      style: {
        padding: ICON_BUTTON_SIZE_SPECS.l.padding,
        minWidth: ICON_BUTTON_SIZE_SPECS.l.minWidth,
        '& svg, & i': {
          fontSize: ICON_BUTTON_SIZE_SPECS.l.iconSize,
        },
      },
    },

    // Primary (contained) type variants - solid backgrounds
    {
      props: {
        'data-type': 'primary',
        'data-color': 'purple',
      } as IconButtonVariantProps,
      style: {
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
    },
    {
      props: {
        'data-type': 'primary',
        'data-color': 'black',
      } as IconButtonVariantProps,
      style: {
        backgroundColor: 'var(--background-neutral-primary-inverse)',
        color: 'var(--text-neutral-white-fixed)',
        '&:hover, &.force-hover, &[data-force-hover="true"]': {
          backgroundColor: 'var(--background-neutral-octonary)',
        },
        '&.Mui-disabled': {
          backgroundColor: 'var(--background-neutral-disabled)',
          color: 'var(--text-neutral-disabled-inverse)',
        },
      },
    },
    {
      props: {
        'data-type': 'primary',
        'data-color': 'white',
      } as IconButtonVariantProps,
      style: {
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
    },
    {
      props: {
        'data-type': 'primary',
        'data-color': 'destructive',
      } as IconButtonVariantProps,
      style: {
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
    },

    // Secondary (outlined) type variants - borders with backgrounds
    {
      props: {
        'data-type': 'secondary',
        'data-color': 'black',
      } as IconButtonVariantProps,
      style: {
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
          borderColor: 'var(--borders-neutral-disabled)',
          color: 'var(--text-neutral-disabled)',
          backgroundColor: 'var(--background-neutral-primary)',
        },
      },
    },
    {
      props: {
        'data-type': 'secondary',
        'data-color': 'gray',
      } as IconButtonVariantProps,
      style: {
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
          borderColor: 'var(--borders-neutral-disabled)',
          color: 'var(--text-neutral-disabled)',
          backgroundColor: 'var(--background-neutral-primary)',
        },
      },
    },
    {
      props: {
        'data-type': 'secondary',
        'data-color': 'white',
      } as IconButtonVariantProps,
      style: {
        border: '1px solid var(--neutral-base-white)',
        backgroundColor: 'var(--background-neutral-primary-inverse)',
        color: 'var(--text-neutral-white-fixed)',
        '&:hover, &.force-hover, &[data-force-hover="true"]': {
          backgroundColor: 'var(--background-neutral-octonary)',
          border: '1px solid var(--neutral-base-white)',
        },
        '&:active': {
          border: '1px solid var(--neutral-base-white) !important',
        },
        '&.Mui-disabled': {
          borderColor: 'var(--neutral-gray-80)',
          color: 'var(--neutral-gray-80)',
          backgroundColor: 'unset',
        },
      },
    },
    {
      props: {
        'data-type': 'secondary',
        'data-color': 'destructive',
      } as IconButtonVariantProps,
      style: {
        border: '1px solid var(--borders-error-primary)',
        backgroundColor: 'var(--background-neutral-primary)',
        color: 'var(--text-error-primary)',
        '&:hover, &.force-hover, &[data-force-hover="true"]': {
          backgroundColor: 'var(--background-error-light)',
          border: '1px solid var(--borders-error-primary)',
        },
        '&:active': {
          border: '1px solid var(--borders-error-primary) !important',
        },
        '&.Mui-disabled': {
          borderColor: 'var(--borders-neutral-disabled)',
          color: 'var(--text-neutral-disabled)',
          backgroundColor: 'var(--background-neutral-primary)',
        },
      },
    },

    // Tertiary (text) type variants - transparent backgrounds
    {
      props: {
        'data-type': 'tertiary',
        'data-color': 'purple',
      } as IconButtonVariantProps,
      style: {
        backgroundColor: 'transparent',
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
          backgroundColor: 'transparent',
        },
      },
    },
    {
      props: {
        'data-type': 'tertiary',
        'data-color': 'black',
      } as IconButtonVariantProps,
      style: {
        backgroundColor: 'transparent',
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
          backgroundColor: 'transparent',
        },
      },
    },
    {
      props: {
        'data-type': 'tertiary',
        'data-color': 'gray',
      } as IconButtonVariantProps,
      style: {
        backgroundColor: 'transparent',
        color: 'var(--text-neutral-secondary)',
        '&:hover, &.force-hover, &[data-force-hover="true"]': {
          backgroundColor: 'var(--background-neutral-quaternary)',
          color: 'var(--text-neutral-secondary)',
        },
        '&:active': {
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
      props: {
        'data-type': 'tertiary',
        'data-color': 'white',
      } as IconButtonVariantProps,
      style: {
        backgroundColor: 'transparent',
        color: 'var(--text-neutral-inverse)',
        '&:hover, &.force-hover, &[data-force-hover="true"]': {
          backgroundColor: 'var(--background-neutral-octonary)',
          color: 'var(--text-neutral-inverse)',
        },
        '&:active': {
          backgroundColor: 'var(--background-neutral-octonary)',
          color: 'var(--text-neutral-tertiary)',
        },
        '&.Mui-disabled': {
          color: 'var(--text-neutral-disabled)',
          backgroundColor: 'transparent',
        },
      },
    },
    {
      props: {
        'data-type': 'tertiary',
        'data-color': 'destructive',
      } as IconButtonVariantProps,
      style: {
        backgroundColor: 'transparent',
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
          backgroundColor: 'transparent',
        },
      },
    },
  ],
  styleOverrides: {
    root: () => {
      return {
        borderRadius: '0.25rem !important', // Force square corners (MUI defaults to circular)
        transition: 'all 0.2s ease-in-out',
        boxShadow: 'none', // Remove MUI's default shadow
        minWidth: 'auto', // Remove MUI's default minWidth
        padding: '0', // Padding is handled by size variants
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
          boxShadow: 'none', // Remove shadow on active
        },

        '&.Mui-disabled': {
          cursor: 'not-allowed',
          boxShadow: 'none', // Remove shadow when disabled
        },

        // Force hover state
        '&.force-hover, &[data-force-hover="true"]': {
          boxShadow: 'none',
        },

        // Default: If no data-type is set, treat as primary (contained)
        // This handles backwards compatibility and MUI default color props
        '&.MuiIconButton-colorPrimary, &[data-color="purple"]:not([data-type])':
          {
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
        '&[data-color="black"]:not([data-type])': {
          backgroundColor: 'var(--background-neutral-primary-inverse)',
          color: 'var(--text-neutral-white-fixed)',
          '&:hover, &.force-hover, &[data-force-hover="true"]': {
            backgroundColor: 'var(--background-neutral-octonary)',
          },
          '&.Mui-disabled': {
            backgroundColor: 'var(--background-neutral-disabled)',
            color: 'var(--text-neutral-disabled-inverse)',
          },
        },
        '&[data-color="white"]:not([data-type])': {
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
        '&.MuiIconButton-colorError, &[data-color="destructive"]:not([data-type])':
          {
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
  },
};
