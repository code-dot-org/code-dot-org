import {ModalTypes} from '../constants';
import {
  AiCustomizations,
  ChatEvent,
  ChatMessage,
  FieldVisibilities,
  SaveType,
  ViewMode,
} from '../types';

export interface AichatState {
  // Content from previous chat sessions that we track purely for visibility to the user
  // and do not send to the model as history.
  chatEventsPast: ChatEvent[];
  // Items in the current chat session that we want to provide as history to the model.
  chatEventsCurrent: ChatEvent[];
  // The user message currently awaiting response from the model (if any).
  chatMessagePending?: ChatMessage;
  // Student events viewed by a teacher user in chat workspace
  studentChatHistory: ChatEvent[];
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
  userHasAichatAccess: boolean;
}
