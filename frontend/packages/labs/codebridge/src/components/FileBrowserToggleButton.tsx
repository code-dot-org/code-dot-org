import {IconButton} from '@mui/material';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

// Ported from the legacy ToggleFileBrowserButton: shows `arrow-left-to-line`
// (text) when the file browser is open and `folder` (outlined) when collapsed.
// The file browser renders one in its header (to collapse); a host whose layout
// fully hides the panel renders one elsewhere (to re-open).

interface FileBrowserToggleButtonProps {
  /** True when the file browser is collapsed (shows the "open" affordance). */
  collapsed?: boolean;
  onClick: () => void;
}

export const FileBrowserToggleButton = ({
  collapsed,
  onClick,
}: FileBrowserToggleButtonProps) => {
  const label = collapsed ? 'Open file manager' : 'Close file manager';
  return (
    <IconButton
      aria-label={label}
      title={label}
      aria-expanded={!collapsed}
      variant={collapsed ? 'outlined' : 'text'}
      color="tertiary"
      size="extraSmall"
      onClick={onClick}
    >
      <FontAwesomeV6Icon
        iconName={collapsed ? 'folder' : 'arrow-left-to-line'}
        iconStyle="solid"
      />
    </IconButton>
  );
};
