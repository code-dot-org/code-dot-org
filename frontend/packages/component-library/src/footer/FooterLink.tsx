import type {ComponentProps} from 'react';

import {FooterLinkEl} from './slots';

/**
 * Footer-private external-link wrapper — the single source of truth for
 * `rel="noopener noreferrer"` and `target="_blank"` semantics inside the footer.
 * Both the site-link list anchors and the attribution-image anchor go through
 * this component so the rule is encoded once.
 *
 * @param external - When true, applies noopener/noreferrer and target=_blank.
 *
 * TODO(footer): remove once the DSCO `link` → MUI `Link` migration
 * (per MIGRATION_STATUS.md) lands and MUI `Link` carries `external` natively.
 */
export function FooterLink({
  external,
  ...props
}: ComponentProps<typeof FooterLinkEl> & {
  /** Drives rel/target; when false or absent the anchor behaves normally. */
  external?: boolean;
}) {
  return (
    <FooterLinkEl
      {...props}
      {...(external ? {rel: 'noopener noreferrer', target: '_blank'} : {})}
    />
  );
}
