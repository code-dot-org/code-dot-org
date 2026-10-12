import {Components, Theme} from '@mui/material/styles';

import FontAwesomeV6Icon from '@/fontAwesomeV6Icon';

/**
 * `white` and labeled `tertiary` have no CADS symbol. Figma tertiary is text and icon-only.
 */

// Body line-heights; this repo has no leading token for them.
const SIZE_SPECS = {
  xs: {
    height: '1.5rem',
    padding: '0.125rem 0.5rem',
    gap: '0.25rem',
    fontSize: 'var(--font-size-body-xs)',
    lineHeight: '1.125rem',
    iconSize: '0.75rem',
    iconWidth: '0.75rem',
    iconOnlyPadding: '0.25rem',
    iconOnlyMinWidth: '1.5rem',
  },
  s: {
    height: '2rem',
    padding: '0.3125rem 0.75rem',
    gap: '0.375rem',
    fontSize: 'var(--font-size-body-sm)',
    lineHeight: '1.375rem',
    iconSize: '0.875rem',
    iconWidth: '0.875rem',
    iconOnlyPadding: '0.4375rem',
    iconOnlyMinWidth: '2rem',
  },
  m: {
    height: '2.5rem',
    padding: '0.5rem 0.875rem',
    gap: '0.5rem',
    fontSize: 'var(--font-size-body-md)',
    lineHeight: '1.5rem',
    iconSize: '1rem',
    iconWidth: '1rem',
    iconOnlyPadding: '0.625rem',
    iconOnlyMinWidth: '2.5rem',
  },
  l: {
    height: '3rem',
    padding: '0.625rem 1rem',
    gap: '0.625rem',
    fontSize: 'var(--font-size-body-lg)',
    lineHeight: '1.625rem',
    iconSize: '1.125rem',
    iconWidth: '1.125rem',
    iconOnlyPadding: '0.75rem',
    iconOnlyMinWidth: '3rem',
  },
};

export const BUTTON_OVERRIDES: Components<Theme>['MuiButton'] = {
  defaultProps: {
    disableRipple: true,
    loadingIndicator: (
      <FontAwesomeV6Icon
        iconName="spinner"
        iconStyle="solid"
        animationType="spin"
      />
    ),
  },
  variants: [
    {
      props: {size: 'extraSmall'},
      style: () => {
        const specs = SIZE_SPECS.xs;
        return {
          height: specs.height,
          minHeight: specs.height,
          minWidth: specs.height,
          padding: specs.padding,
          gap: specs.gap,
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
            width: specs.height,
            padding: specs.iconOnlyPadding,
            minWidth: specs.iconOnlyMinWidth,
            gap: 0,
          },
        };
      },
    },
    {
      props: {size: 'small'},
      style: () => {
        const specs = SIZE_SPECS.s;
        return {
          height: specs.height,
          minHeight: specs.height,
          minWidth: specs.height,
          padding: specs.padding,
          gap: specs.gap,
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
            width: specs.height,
            padding: specs.iconOnlyPadding,
            minWidth: specs.iconOnlyMinWidth,
            gap: 0,
          },
        };
      },
    },
    {
      props: {size: 'medium'},
      style: () => {
        const specs = SIZE_SPECS.m;
        return {
          height: specs.height,
          minHeight: specs.height,
          minWidth: specs.height,
          padding: specs.padding,
          gap: specs.gap,
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
            width: specs.height,
            padding: specs.iconOnlyPadding,
            minWidth: specs.iconOnlyMinWidth,
            gap: 0,
          },
        };
      },
    },
    {
      props: {size: 'large'},
      style: () => {
        const specs = SIZE_SPECS.l;
        return {
          height: specs.height,
          minHeight: specs.height,
          minWidth: specs.height,
          padding: specs.padding,
          gap: specs.gap,
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
            width: specs.height,
            padding: specs.iconOnlyPadding,
            minWidth: specs.iconOnlyMinWidth,
            gap: 0,
          },
        };
      },
    },

    {
      props: {variant: 'contained', color: 'primary'},
      style: {
        backgroundColor: 'var(--background-brand-primary)',
        color: 'var(--text-neutral-white-fixed)',
        '&:hover, &.force-hover, &[data-force-hover="true"]': {
          backgroundColor: 'var(--background-brand-strong)',
          color: 'var(--text-neutral-white-fixed)',
        },
        '&:focus, a&:focus': {
          color: 'var(--text-neutral-white-fixed)',
        },
        '&:active, a&:active': {
          backgroundColor: 'var(--background-brand-strong)',
          color: 'var(--text-neutral-white-fixed)',
        },
        '&.Mui-disabled': {
          backgroundColor: 'var(--background-disabled-brand)',
          color: 'var(--text-disabled-neutral-inverse)',
        },
        '&.MuiButton-loading': {
          backgroundColor: 'var(--background-brand-primary)',
          color: 'var(--text-neutral-white-fixed)',
        },
        '&.MuiButton-loading:not(:has(.MuiButton-icon))': {
          color: 'transparent',
        },
        '&.MuiButton-loading i': {
          color: 'var(--text-neutral-white-fixed)',
        },
      },
    },
    {
      props: {variant: 'contained', color: 'secondary'},
      style: {
        backgroundColor: 'var(--background-neutral-primary-inverse)',
        color: 'var(--text-neutral-primary-inverse)',
        '&:hover, &.force-hover, &[data-force-hover="true"]': {
          backgroundColor: 'var(--background-neutral-octonary)',
          color: 'var(--text-neutral-primary-inverse)',
        },
        '&:focus, a&:focus': {
          color: 'var(--text-neutral-primary-inverse)',
        },
        '&:active, a&:active': {
          backgroundColor: 'var(--background-neutral-primary-inverse)',
          color: 'var(--text-neutral-primary-inverse)',
        },
        '&.Mui-disabled': {
          backgroundColor: 'var(--background-disabled-neutral)',
          color: 'var(--text-disabled-neutral-inverse)',
        },
        '&.MuiButton-loading': {
          backgroundColor: 'var(--background-neutral-primary-inverse)',
          color: 'var(--text-neutral-primary-inverse)',
        },
        '&.MuiButton-loading:not(:has(.MuiButton-icon))': {
          color: 'transparent',
        },
        '&.MuiButton-loading i': {
          color: 'var(--text-neutral-primary-inverse)',
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
        '&.MuiButton-loading': {
          backgroundColor: 'var(--background-neutral-white-fixed)',
          color: 'var(--text-neutral-primary)',
        },
        '&.MuiButton-loading:not(:has(.MuiButton-icon))': {
          color: 'transparent',
        },
        '&.MuiButton-loading i': {
          color: 'var(--text-neutral-primary)',
        },
      },
    },
    {
      props: {variant: 'contained', color: 'orange'},
      style: {
        backgroundColor: 'var(--background-accent-orange-primary)',
        color: 'var(--text-neutral-white-fixed)',
        '&:hover, &.force-hover, &[data-force-hover="true"]': {
          backgroundColor: 'var(--background-accent-orange-strong)',
          color: 'var(--text-neutral-white-fixed)',
        },
        '&:focus, a&:focus': {
          color: 'var(--text-neutral-white-fixed)',
        },
        '&:active, a&:active': {
          backgroundColor: 'var(--background-accent-orange-strong)',
          color: 'var(--text-neutral-white-fixed)',
        },
        '&.Mui-disabled': {
          backgroundColor: 'var(--background-disabled-orange)',
          color: 'var(--text-disabled-neutral-inverse)',
        },
        '&.MuiButton-loading': {
          backgroundColor: 'var(--background-accent-orange-primary)',
          color: 'var(--text-neutral-white-fixed)',
        },
        '&.MuiButton-loading:not(:has(.MuiButton-icon))': {
          color: 'transparent',
        },
        '&.MuiButton-loading i': {
          color: 'var(--text-neutral-white-fixed)',
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
          backgroundColor: 'var(--background-error-strong)',
          color: 'var(--text-neutral-white-fixed)',
        },
        '&.Mui-disabled': {
          backgroundColor: 'var(--background-disabled-error)',
          color: 'var(--text-disabled-neutral-inverse)',
        },
        '&.MuiButton-loading': {
          backgroundColor: 'var(--background-error-primary)',
          color: 'var(--text-neutral-white-fixed)',
        },
        '&.MuiButton-loading:not(:has(.MuiButton-icon))': {
          color: 'transparent',
        },
        '&.MuiButton-loading i': {
          color: 'var(--text-neutral-white-fixed)',
        },
      },
    },

    {
      props: {variant: 'outlined', color: 'primary'},
      style: {
        backgroundColor: 'var(--background-neutral-primary)',
        border: '1px solid var(--border-neutral-solid)',
        color: 'var(--text-neutral-primary)',
        '&:hover, &.force-hover, &[data-force-hover="true"]': {
          backgroundColor: 'var(--background-neutral-tertiary)',
          border: '1px solid var(--border-neutral-solid)',
          color: 'var(--text-neutral-primary)',
        },
        '&:focus, a&:focus': {
          color: 'var(--text-neutral-primary)',
        },
        '&:active, a&:active': {
          backgroundColor: 'var(--background-neutral-tertiary)',
          border: '1px solid var(--border-neutral-solid)',
          color: 'var(--text-neutral-primary)',
        },
        '&.Mui-disabled': {
          borderColor: 'var(--border-disabled-neutral)',
          color: 'var(--text-disabled-neutral)',
          backgroundColor: 'var(--background-neutral-primary)',
        },
        '&.MuiButton-loading': {
          border: '1px solid var(--border-neutral-solid)',
          backgroundColor: 'var(--background-neutral-primary)',
          color: 'var(--text-neutral-primary)',
        },
        '&.MuiButton-loading:not(:has(.MuiButton-icon))': {
          color: 'transparent',
        },
        '&.MuiButton-loading i': {
          color: 'var(--text-neutral-primary)',
        },
      },
    },
    {
      props: {variant: 'outlined', color: 'secondary'},
      style: {
        border: '1px solid var(--border-neutral-secondary)',
        backgroundColor: 'var(--background-neutral-primary)',
        color: 'var(--text-neutral-primary)',
        '&:hover, &.force-hover, &[data-force-hover="true"]': {
          backgroundColor: 'var(--background-neutral-tertiary)',
          border: '1px solid var(--border-neutral-secondary)',
          color: 'var(--text-neutral-primary)',
        },
        '&:focus, a&:focus': {
          color: 'var(--text-neutral-primary)',
        },
        '&:active, a&:active': {
          backgroundColor: 'var(--background-neutral-tertiary)',
          border: '1px solid var(--border-neutral-secondary)',
          color: 'var(--text-neutral-primary)',
        },
        '&.Mui-disabled': {
          borderColor: 'var(--border-disabled-neutral)',
          color: 'var(--text-disabled-neutral)',
          backgroundColor: 'var(--background-neutral-primary)',
        },
        '&.MuiButton-loading': {
          border: '1px solid var(--border-neutral-secondary)',
          backgroundColor: 'var(--background-neutral-primary)',
          color: 'var(--text-neutral-primary)',
        },
        '&.MuiButton-loading:not(:has(.MuiButton-icon))': {
          color: 'transparent',
        },
        '&.MuiButton-loading i': {
          color: 'var(--text-neutral-primary)',
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
        '&.MuiButton-loading': {
          border: '1px solid var(--borders-neutral-strong)',
          backgroundColor: 'var(--background-neutral-primary)',
          color: 'var(--text-neutral-primary)',
        },
        '&.MuiButton-loading:not(:has(.MuiButton-icon))': {
          color: 'transparent',
        },
        '&.MuiButton-loading i': {
          color: 'var(--text-neutral-primary)',
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
        '&.MuiButton-loading': {
          border: '1px solid var(--neutral-base-white)',
          backgroundColor: 'var(--neutral-base-black)',
          color: 'var(--neutral-base-white)',
        },
        '&.MuiButton-loading:not(:has(.MuiButton-icon))': {
          color: 'transparent',
        },
        '&.MuiButton-loading i': {
          color: 'var(--neutral-base-white)',
        },
      },
    },
    {
      props: {variant: 'outlined', color: 'error'},
      style: {
        backgroundColor: 'var(--background-neutral-primary)',
        border: '1px solid var(--border-error-primary)',
        color: 'var(--text-error-primary)',
        '&:hover, &.force-hover, &[data-force-hover="true"]': {
          backgroundColor: 'var(--background-error-light)',
          border: '1px solid var(--border-error-primary)',
          color: 'var(--text-error-primary)',
        },
        '&:focus, a&:focus': {
          color: 'var(--text-error-primary)',
        },
        '&:active, a&:active': {
          backgroundColor: 'var(--background-error-light)',
          border: '1px solid var(--border-error-primary)',
          color: 'var(--text-error-primary)',
        },
        '&.Mui-disabled': {
          borderColor: 'var(--border-disabled-error)',
          color: 'var(--text-disabled-error)',
          backgroundColor: 'var(--background-neutral-primary)',
        },
        '&.MuiButton-loading': {
          border: '1px solid var(--border-error-primary)',
          backgroundColor: 'var(--background-error-light)',
          color: 'var(--text-error-primary)',
        },
        '&.MuiButton-loading:not(:has(.MuiButton-icon))': {
          color: 'transparent',
        },
        '&.MuiButton-loading i': {
          color: 'var(--text-error-primary)',
        },
      },
    },

    {
      props: {variant: 'text', color: 'primary'},
      style: {
        color: 'var(--text-brand-primary)',
        '&:hover, &.force-hover, &[data-force-hover="true"]': {
          backgroundColor: 'var(--background-brand-light)',
          color: 'var(--text-brand-primary)',
        },
        '&:focus, a&:focus': {
          color: 'var(--text-brand-primary)',
        },
        '&:active, a&:active': {
          backgroundColor: 'var(--background-brand-light)',
          color: 'var(--text-brand-secondary)',
        },
        '&.Mui-disabled': {
          color: 'var(--text-disabled-brand)',
          backgroundColor: 'transparent',
        },
        '&.MuiButton-loading': {
          color: 'var(--text-brand-primary)',
        },
        '&.MuiButton-loading:not(:has(.MuiButton-icon))': {
          color: 'transparent',
        },
        '&.MuiButton-loading i': {
          color: 'var(--text-brand-primary)',
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
          color: 'var(--text-disabled-neutral)',
          backgroundColor: 'transparent',
        },
        '&.MuiButton-loading': {
          color: 'var(--text-neutral-primary)',
        },
        '&.MuiButton-loading:not(:has(.MuiButton-icon))': {
          color: 'transparent',
        },
        '&.MuiButton-loading i': {
          color: 'var(--text-neutral-primary)',
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
          color: 'var(--text-disabled-neutral)',
          backgroundColor: 'transparent',
        },
        '&.MuiButton-loading': {
          color: 'var(--text-neutral-quaternary)',
        },
        '&.MuiButton-loading:not(:has(.MuiButton-icon))': {
          color: 'transparent',
        },
        '&.MuiButton-loading i': {
          color: 'var(--text-neutral-quaternary)',
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
        '&.MuiButton-loading': {
          color: 'var(--neutral-base-white)',
        },
        '&.MuiButton-loading:not(:has(.MuiButton-icon))': {
          color: 'transparent',
        },
        '&.MuiButton-loading i': {
          color: 'var(--neutral-base-white)',
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
          color: 'var(--text-disabled-error)',
          backgroundColor: 'transparent',
        },
        '&.MuiButton-loading': {
          color: 'var(--text-error-primary)',
        },
        '&.MuiButton-loading:not(:has(.MuiButton-icon))': {
          color: 'transparent',
        },
        '&.MuiButton-loading i': {
          color: 'var(--text-error-primary)',
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
        borderRadius: 'var(--shape-sm)',
        boxSizing: 'border-box',
        margin: 0,
        border: '1px solid transparent',
        textDecoration: 'none',
        cursor: 'pointer',
        transition:
          'background-color 0.2s ease-in-out, color 0.2s ease-in-out, border-color 0.2s ease-in-out',
        display: 'inline-flex',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        fontFamily: 'var(--font-family-main)',
        fontWeight: 600,
        textTransform: 'none',
        boxShadow: 'none',
        '&:hover, a&:hover': {
          boxShadow: 'none',
          textDecoration: 'none',
        },
        '&:focus, a&:focus': {
          textDecoration: 'none',
          outline: 'none',
        },
        '&:focus-visible, a&:focus-visible': {
          outline: 'none',
          boxShadow:
            '0 0 0 2px var(--background-neutral-primary), 0 0 0 4px var(--border-focused-primary)',
          textDecoration: 'none',
        },
        '&:active, a&:active': {
          boxShadow: 'none',
          textDecoration: 'none',
        },
        '&.Mui-disabled, &[aria-disabled="true"]': {
          cursor: 'not-allowed',
          opacity: 1,
          boxShadow: 'none',
        },

        // disableRipple does not always remove the ripple node.
        '& .MuiTouchRipple-root': {
          display: 'none',
        },

        '&.force-hover, &[data-force-hover="true"]': {
          boxShadow: 'none',
          textDecoration: 'none',
        },

        '& .MuiButton-startIcon': {
          marginLeft: 0,
          marginRight: 0,
        },
        '& .MuiButton-endIcon': {
          marginLeft: 0,
          marginRight: 0,
        },

        '.MuiButton-loadingIndicator': {
          color: 'inherit',
        },
      };

      return baseStyles;
    },
    // Empty so MUI's default variant styles do not replace the variants above.
    contained: () => ({}),
    outlined: () => ({}),
    text: () => ({}),
  },
};
