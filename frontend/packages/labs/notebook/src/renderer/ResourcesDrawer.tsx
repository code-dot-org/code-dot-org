/**
 * ResourcesDrawer — slide-in panel for notebook-level actions.
 *
 * Opens from the right via an icon button in the NotebookView header.
 * Provides shortcuts to the GlobalsDialog, a Reset Globals action, and the
 * ArtifactShareDialog.  The drawer itself does not own dialog state; it closes
 * and calls the parent-provided callbacks so NotebookView orchestrates modal
 * lifecycle.
 */

import {
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  SvgIcon,
  Typography,
} from '@mui/material';
import {useResetGlobals} from '../runtime/runtimeStore';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for ResourcesDrawer. */
export interface ResourcesDrawerProps {
  /** Whether the drawer is currently open. */
  open: boolean;
  /** Called when the drawer should close (backdrop click, Escape, or action). */
  onClose: () => void;
  /**
   * Called when the user taps "Edit Globals".
   * The drawer closes first so the dialog has full focus.
   */
  onOpenGlobals: () => void;
  /**
   * Called when the user taps "Share with teacher".
   * The drawer closes first so the share dialog has full focus.
   */
  onOpenShare: () => void;
}

// ---------------------------------------------------------------------------
// Sub-icons
// ---------------------------------------------------------------------------

/**
 * CloseIcon — inline SVG "close" glyph.
 * Mirrors Material Design "close" path; replaces @mui/icons-material/Close.
 */
function CloseIcon(): React.ReactElement {
  return (
    <SvgIcon>
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
    </SvgIcon>
  );
}

// ---------------------------------------------------------------------------
// String constants
// ---------------------------------------------------------------------------

/** Drawer heading label. */
const STR_HEADING = 'Resources';

/** Globals section heading. */
const STR_GLOBALS_HEADING = 'Globals';

/** Globals action button label. */
const STR_EDIT_GLOBALS = 'Edit Globals';

/** Reset section heading. */
const STR_RESET_HEADING = 'Reset';

/** Reset action button label. */
const STR_RESET_GLOBALS = 'Reset Globals';

/** Share section heading. */
const STR_SHARE_HEADING = 'Share';

/** Share action button label. */
const STR_SHARE = 'Share with teacher';

// ---------------------------------------------------------------------------
// Section helper
// ---------------------------------------------------------------------------

/** Props for DrawerSection. */
interface DrawerSectionProps {
  /** Section heading displayed above the children. */
  heading: string;
  /** Section content. */
  children: React.ReactNode;
}

/**
 * Consistent heading + content block used inside ResourcesDrawer.
 */
function DrawerSection({heading, children}: DrawerSectionProps): React.ReactElement {
  return (
    <Box sx={{mb: 3}}>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        {heading}
      </Typography>
      {children}
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Slide-in drawer anchored to the right edge of the viewport.
 *
 * Each action button closes the drawer before firing its callback so the
 * subsequent dialog/modal has an unobstructed focus trap.
 */
export function ResourcesDrawer({
  open,
  onClose,
  onOpenGlobals,
  onOpenShare,
}: ResourcesDrawerProps): React.ReactElement {
  const resetGlobals = useResetGlobals();

  /** Closes the drawer then opens the GlobalsDialog. */
  function handleOpenGlobals(): void {
    onClose();
    onOpenGlobals();
  }

  /** Resets Python globals without closing the drawer. */
  function handleResetGlobals(): void {
    resetGlobals();
    onClose();
  }

  /** Closes the drawer then opens the ArtifactShareDialog. */
  function handleOpenShare(): void {
    onClose();
    onOpenShare();
  }

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{width: 280, p: 2}}>
        {/* Drawer header */}
        <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
          <Typography variant="h6" sx={{flexGrow: 1}}>
            {STR_HEADING}
          </Typography>
          <IconButton size="small" aria-label="Close resources" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{mb: 2}} />

        <DrawerSection heading={STR_GLOBALS_HEADING}>
          <Button
            variant="outlined"
            size="small"
            fullWidth
            onClick={handleOpenGlobals}
          >
            {STR_EDIT_GLOBALS}
          </Button>
        </DrawerSection>

        <DrawerSection heading={STR_RESET_HEADING}>
          <Button
            variant="outlined"
            size="small"
            color="warning"
            fullWidth
            onClick={handleResetGlobals}
          >
            {STR_RESET_GLOBALS}
          </Button>
        </DrawerSection>

        <DrawerSection heading={STR_SHARE_HEADING}>
          <Button
            variant="outlined"
            size="small"
            fullWidth
            onClick={handleOpenShare}
          >
            {STR_SHARE}
          </Button>
        </DrawerSection>
      </Box>
    </Drawer>
  );
}
