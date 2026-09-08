import GenericAlertDialog from './components/GenericAlertDialog';
import GenericConfirmationDialog from './components/GenericConfirmationDialog';
import GenericDialog from './components/GenericDialog';
import GenericDropdown from './components/GenericDropdown';
import GenericPrompt from './components/GenericPrompt';
import PendingDialog from './components/PendingDialog';
import SkipDialog from './components/SkipDialog';
import StartOverDialog from './components/StartOverDialog';
import type {DialogTypeType} from './types';
import {DialogType} from './types';

/**
 * Manages displaying common dialogs for Lab2.
 */
const DialogViews: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key in DialogTypeType]: React.FunctionComponent<any>;
} = {
  [DialogType.StartOver]: StartOverDialog,
  [DialogType.Skip]: SkipDialog,
  [DialogType.GenericAlert]: GenericAlertDialog,
  [DialogType.GenericConfirmation]: GenericConfirmationDialog,
  [DialogType.GenericDialog]: GenericDialog,
  [DialogType.GenericDropdown]: GenericDropdown,
  [DialogType.GenericPrompt]: GenericPrompt,
  [DialogType.PendingDialog]: PendingDialog,
};

export default DialogViews;
