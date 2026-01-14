import {Components, Theme} from '@mui/material/styles';

/**
 * MUI Breadcrumbs theme overrides to match the design system Breadcrumbs component.
 *
 * Default size is 'm' (label2: 0.875rem / 14px, line-height: 1.54)
 *
 * To use different sizes, add a className or data-size attribute:
 * - data-size="xs": label4 (0.625rem / 10px, line-height: 1.8)
 * - data-size="s": label3 (0.75rem / 12px, line-height: 1.64)
 * - data-size="m": label2 (0.875rem / 14px, line-height: 1.54) - default
 * - data-size="l": label1 (1rem / 16px, line-height: 1.48)
 */
export const BREADCRUMBS_OVERRIDES: Components<Theme>['MuiBreadcrumbs'] = {
  styleOverrides: {
    root: ({theme}) => {
      const label2Styles = theme.typography.label2;
      const label1Styles = theme.typography.label1;
      const label3Styles = theme.typography.label3;
      const label4Styles = theme.typography.label4;

      return {
        display: 'inline-flex',
        alignItems: 'center',
        fontFeatureSettings: "'liga' off, 'clig' off",
        // Use typography styles for default size (m = label2)
        ...label2Styles,
        // Separator default size: m
        '& .MuiBreadcrumbs-separator': {
          padding: '5px 6px',
          fontSize: '12px',
          width: '15px',
          lineHeight: 1.25,
        },
        // 'i': {
        //   padding: '5px 6px',
        //   fontSize: '12px',
        //   width: '15px',
        //   lineHeight: '1.25',
        // },
        // Size: xs (label4)
        '&[data-size="xs"], &.breadcrumbs-xs': {
          ...label4Styles,
          '& .MuiBreadcrumbs-separator': {
            padding: '4px 6px',
            fontSize: '10px',
            width: '13px',
            lineHeight: 1.25,
          },
          i: {
            fontSize: '0.625rem', // 10px
          },
        },
        // Size: s (label3)
        '&[data-size="s"], &.breadcrumbs-s': {
          ...label3Styles,
          '& .MuiBreadcrumbs-separator': {
            padding: '5px 6px',
            fontSize: '11px',
            width: '14px',
            lineHeight: 1.25,
          },
          i: {
            fontSize: '0.75rem', // 12px
          },
        },
        // Size: l (label1)
        '&[data-size="l"], &.breadcrumbs-l': {
          ...label1Styles,
          '& .MuiBreadcrumbs-separator': {
            padding: '6px',
            fontSize: '13px',
            width: '16px',
            lineHeight: 1.25,
          },
          i: {
            fontSize: '1rem', // 16px
          },
        },
        // Style the links within breadcrumbs
        // MUI uses Link components for breadcrumb items
        '& .MuiLink-root, & .MuiBreadcrumbs-li > a': {
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'var(--text-neutral-primary)',
          textDecoration: 'none',
          borderRadius: '4px',
          margin: 0,
          fontFamily: 'inherit',
          fontFeatureSettings: 'inherit',
          fontWeight: 'inherit',
          fontSize: 'inherit',
          lineHeight: 'inherit',
          gap: '0.375rem',
          // Remove default Link underline
          '&:hover, &:active, &:visited': {
            textDecoration: 'none',
          },
          // Current/active breadcrumb (last item)
          '&[aria-current="page"]': {
            color: 'var(--text-brand-teal-primary)',
            cursor: 'default',
            pointerEvents: 'none',
          },
          // Focus styles
          '&:focus-visible': {
            color: 'var(--text-neutral-primary)',
            outline: '2px solid var(--borders-brand-teal-primary)',
            outlineOffset: '2px',
          },
        },
        i: {
          color: 'inherit',
          fontSize: '0.875rem', // Default size m: 14px
        },
        // Hover, active, visited states for non-last breadcrumbs
        '& .MuiBreadcrumbs-li:not(:last-child) .MuiLink-root:hover, & .MuiBreadcrumbs-li:not(:last-child) > a:hover, & .MuiBreadcrumbs-li:not(:last-child) .MuiLink-root:active, & .MuiBreadcrumbs-li:not(:last-child) > a:active, & .MuiBreadcrumbs-li:not(:last-child) .MuiLink-root:visited, & .MuiBreadcrumbs-li:not(:last-child) > a:visited':
          {
            color: 'var(--text-neutral-secondary)',
          },
        // Last breadcrumb link styling (when not using aria-current)
        '& .MuiBreadcrumbs-li:last-child .MuiLink-root, & .MuiBreadcrumbs-li:last-child > a':
          {
            color: 'var(--text-brand-teal-primary)',
            cursor: 'default',
            pointerEvents: 'none',
          },
        // Last breadcrumb Typography styling (current page)
        // Need higher specificity to override Typography default color
        '& .MuiBreadcrumbs-li:last-child .MuiTypography-root': {
          color: 'var(--text-brand-teal-primary) !important',
          cursor: 'default',
        },
        // Also target Typography directly within breadcrumbs li:last-child
        '& .MuiBreadcrumbs-li:last-child > .MuiTypography-root': {
          color: 'var(--text-brand-teal-primary) !important',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.25rem', // Add gap between icon and text
        },
      };
    },
    ol: {
      display: 'inline-flex',
      alignItems: 'center',
      margin: 0,
      padding: 0,
      listStyle: 'none',
    },
    li: {
      display: 'inline-flex',
      alignItems: 'center',
    },
    separator: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      color: 'var(--text-neutral-tertiary)',
      marginLeft: 0,
      marginRight: 0,
    },
  },
};
