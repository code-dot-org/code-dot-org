import {
  AiCustomizations,
  FieldVisibilities,
  ModalTypes,
  SaveError,
  SaveType,
  ViewMode,
} from '../types';

export interface AichatLabState {
  /** Denotes whether we should show the warning or teacher onboarding modal */
  showModalType: ModalTypes | undefined;
  /** Initial AI customizations for the level based on the user's project and level properties, set when the level first loads. */
  initialAiCustomizations: AiCustomizations;
  /** The latest updated AI customizations being edited by the user, which may or may not be saved yet. */
  currentAiCustomizations: AiCustomizations;
  /** The last saved AI customizations. */
  savedAiCustomizations: AiCustomizations;
  /** Visibility settings for the customization fields. */
  fieldVisibilities: FieldVisibilities;
  /** View mode for the lab (edit or presentation). */
  viewMode: ViewMode;
  /** If a save is currently in progress */
  saveInProgress: boolean;
  /** The type of save action being performed (customization update, publish, model card save, etc). */
  currentSaveType: SaveType | undefined;
  /** Error message to display if a save fails */
  saveError: SaveError | undefined;
  /** If the user has a sent a message on this level */
  hasSentMessage: boolean;
  /** If initial customizations have been set on this level */
  hasSetInitialCustomizations: boolean;
  /** If the user has updated customizations on this level */
  hasUpdatedCustomizations: boolean;
  /** If the model customizations were just reset to the default level values. */
  showResetMessage: boolean;
  /** If the user had previously selected a model that is no longer available. */
  showUnsupportedModelMessage: boolean;
}
