import {MuiCustomDialog as CustomDialog} from '@code-dot-org/component-library/dialog';
import React from 'react';

import PixelEditor, {PixelEditorProps} from './PixelEditor';

import moduleStyles from './pixel-editor.module.scss';

export type {PixelEditorSaveMeta} from './PixelEditor';

interface PixelEditorModalProps extends Omit<PixelEditorProps, 'children'> {
  title: string;
  onCancel: () => void;
}

/**
 * The pixel editor in a modal: header, the editor's toolbar beside its
 * canvas, and a Cancel/Save footer. Save hands back a PNG dataURI; Cancel
 * discards. Both close the modal. Until the editor is ready the modal
 * renders nothing, so a caller swapping another dialog for this one can
 * wait on onReady to avoid a scrim gap.
 */
const PixelEditorModal: React.FunctionComponent<PixelEditorModalProps> = ({
  title,
  onCancel,
  ...editorProps
}) => {
  return (
    <PixelEditor {...editorProps}>
      {({ready, themeMode, toolbar, canvas, save, canSave}) =>
        ready ? (
          <CustomDialog
            aria-label={title}
            onClose={onCancel}
            mode={themeMode}
            className={moduleStyles.modal}
          >
            <span id="dsco-dialog-description" className={moduleStyles.srOnly}>
              Draw on the image with the toolbar's tools, then save or cancel.
            </span>
            {/* Tabbable so the dialog's focus trap lands here on open (the
                WAI-ARIA dialog pattern's title-as-initial-focus): its
                first-focusable would otherwise be the pen button, whose
                focus-triggered tooltip then appears unprompted — positioned
                against the still-animating (scaled) modal — and lingers. */}
            {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */}
            <div className={moduleStyles.header} tabIndex={0}>
              {title}
            </div>
            <div className={moduleStyles.body}>
              {toolbar}
              {canvas}
            </div>
            <div className={moduleStyles.footer}>
              <button type="button" onClick={onCancel}>
                Cancel
              </button>
              <button
                type="button"
                className={moduleStyles.savePrimary}
                onClick={save}
                disabled={!canSave}
              >
                Save
              </button>
            </div>
          </CustomDialog>
        ) : null
      }
    </PixelEditor>
  );
};

export default PixelEditorModal;
