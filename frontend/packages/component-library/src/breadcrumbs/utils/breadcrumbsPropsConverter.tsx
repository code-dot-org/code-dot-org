import {
  Breadcrumbs as MUIBreadcrumbs,
  Link as MUILink,
  Typography,
} from '@mui/material';

import FontAwesomeV6Icon from '@/fontAwesomeV6Icon';

import {BreadcrumbsProps as DSCOBreadcrumbsProps} from '../Breadcrumbs';

/**
 * Converts DSCO Breadcrumbs props to MUI Breadcrumbs props
 * @param dscoProps - The Design System Breadcrumbs props
 * @returns MUI Breadcrumbs props that can be spread directly into MUI Breadcrumbs component
 */
export function convertBreadcrumbsPropsToMUI(
  dscoProps: DSCOBreadcrumbsProps,
): React.ComponentProps<typeof MUIBreadcrumbs> & {
  size?: 'xs' | 's' | 'm' | 'l';
} {
  const {
    breadcrumbs,
    size = 'm',
    className,
    showHomeIcon,
    homeIconHref = '/',
    name,
  } = dscoProps;

  // Map size to label variant
  const sizeToVariant: Record<
    'xs' | 's' | 'm' | 'l',
    'label4' | 'label3' | 'label2' | 'label1'
  > = {
    xs: 'label4',
    s: 'label3',
    m: 'label2',
    l: 'label1',
  };

  const labelVariant = sizeToVariant[size];

  // Build children array starting with home icon if needed
  const children: React.ReactNode[] = [];

  // Add home icon if needed
  if (showHomeIcon) {
    children.push(
      <MUILink key="home" href={homeIconHref} color="inherit" underline="none">
        <FontAwesomeV6Icon iconName="house" title="Home" />
      </MUILink>,
    );
  }

  // Convert breadcrumbs array to MUI Link/Typography components
  breadcrumbs.forEach((breadcrumb, index) => {
    const isLast = index === breadcrumbs.length - 1;
    const {href, text, children: breadcrumbChildren, ...restProps} = breadcrumb;

    // Use children or text for content
    const content = breadcrumbChildren || text;

    // Last breadcrumb should be Typography (non-clickable) with label variant
    if (isLast) {
      children.push(
        <Typography
          key={href || index}
          component="span"
          variant={labelVariant}
          sx={{color: 'var(--text-brand-teal-primary)'}}
        >
          {content}
        </Typography>,
      );
    } else {
      // Non-last breadcrumbs are Links
      children.push(
        <MUILink
          key={href || index}
          href={href}
          color="inherit"
          underline="none"
          {...restProps}
        >
          {content}
        </MUILink>,
      );
    }
  });

  // Custom separator using chevron-right icon
  const separator = (
    <FontAwesomeV6Icon
      iconName="chevron-right"
      style={{display: 'flex', alignItems: 'center'}}
    />
  );

  return {
    size,
    className,
    'aria-label': `Breadcrumb navigation: ${name}`,
    separator,
    children,
  };
}
