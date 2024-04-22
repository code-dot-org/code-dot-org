import {ChatCompletionMessage, ModelDescription} from './types';
import modelsJson from '@cdo/static/aichat/modelDescriptions.json';

export const initialChatMessages: ChatCompletionMessage[] = [];

export const modelDescriptions: ModelDescription[] = modelsJson;
