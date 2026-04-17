import {ModalTypes} from '../../constants';
import {
  AiCustomizations,
  FieldVisibilities,
  SaveError,
  SaveType,
  ViewMode,
} from '../../types';

export interface AichatLabState {
  // Denotes whether we should show the warning or teacher onboarding modal
  showModalType: ModalTypes | undefined;
  initialAiCustomizations: AiCustomizations;
  currentAiCustomizations: AiCustomizations;
  savedAiCustomizations: AiCustomizations;
  fieldVisibilities: FieldVisibilities;
  viewMode: ViewMode;
  // If a save is currently in progress
  saveInProgress: boolean;
  // The type of save action being performed (customization update, publish, model card save, etc).
  currentSaveType: SaveType | undefined;
  // If the user has a sent a message on this level
  hasSentMessage: boolean;
  // If initial customizations have been set on this level
  hasSetInitialCustomizations: boolean;
  // If the user has updated customizations on this level
  hasUpdatedCustomizations: boolean;
  // Error message to display if a save fails
  saveError: SaveError | undefined;
  // If the model customizations were just reset to the default level values.
  showResetMessage: boolean;
  // If the user had previously selected a model that is no longer available.
  showUnsupportedModelMessage: boolean;
}
