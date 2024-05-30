import moment from 'moment';
import {AiInteractionStatus as Status} from '@cdo/generated-scripts/sharedConstants';
import modelsJson from '@cdo/static/aichat/modelDescriptions.json';
import {ChatCompletionMessage, ModelDescription, Role} from './types';

export const modelDescriptions: ModelDescription[] = modelsJson;

export const RESET_MODEL_NOTIFICATION: ChatCompletionMessage = {
  id: -1,
  role: Role.MODEL_UPDATE,
  chatMessageText: 'Model customizations and model card information',
  chatMessageSuffix: ' have been reset to default settings.',
  status: Status.OK,
  timestamp: moment(Date.now()).format('LT'),
};
