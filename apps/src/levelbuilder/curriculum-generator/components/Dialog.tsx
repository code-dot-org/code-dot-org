import React from 'react';

import sharedStyles from '../curriculum-generator.module.scss';

// Backdrop + panel scaffolding used by every dialog in the generator
// pages (progress, summary, save-in-flight). Owns the role / aria-modal
// markup so each page-specific dialog doesn't have to remember it; the
// page-specific content goes in as children.

interface DialogProps {
  children: React.ReactNode;
}

const Dialog: React.FC<DialogProps> = ({children}) => (
  <div className={sharedStyles.dialogBackdrop} role="dialog" aria-modal>
    <div className={sharedStyles.dialog}>{children}</div>
  </div>
);

export default Dialog;
