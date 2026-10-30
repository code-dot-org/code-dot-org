import {memo} from 'react';

import GenericButton, {
  CoreButtonProps,
  LinkButtonSpecificProps,
} from './GenericButton';

export interface LinkButtonProps
  extends CoreButtonProps,
    LinkButtonSpecificProps {}

const LinkButton: React.FunctionComponent<LinkButtonProps> = props => (
  <GenericButton useAsLink {...props} />
);

/**
 * ###  Status: ```DEPRECATED```
 *
 * @deprecated Use MUI `Button` with `href` prop from `@mui/material` instead.
 * Style overrides are in `src/themes/code.org/styleOverrides/button.tsx`.
 * See `src/button/BUTTON_MIGRATION_TO_MUI.md` for migration guide.
 * Codemod available: `yarn codemod:buttons`.
 */
export default memo(LinkButton);
