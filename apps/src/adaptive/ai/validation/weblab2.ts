// Work in Web Lab 2: each build the student accepts from the AI build
// partner, read through the chat's handle. The files the build changed are
// the change, the exchange that produced it is the process, and the project
// as the lab holds it is the context. Checks and verdicts go back into the
// chat as alerts, and the chat takes nothing new while a check runs.

import {AcceptedBuild} from '@cdo/apps/aichat/host/ChatHostContext';
import {getStore} from '@cdo/apps/redux';

import {summarizeProjectFiles} from '../../project/summarizeProjectFiles';

import {StepWork, WorkAdapter} from './types';

export const weblab2Adapter: WorkAdapter = {
  observeWork: ({chat}, listener) => {
    if (!chat) return () => {};
    return chat.onBuildAccepted(build =>
      listener({...workFromBuild(build), project: currentProject()})
    );
  },
  notifyChecking: ({chat}) => {
    if (!chat) return () => {};
    const dismissNotification = chat.post({
      notificationType: 'info',
      includeInChatHistory: false,
      hideTimestamp: true,
      text: 'Checking your work...',
    });
    chat.disableSend();
    return () => {
      dismissNotification();
      chat.enableSend();
    };
  },
  reportAttempt: ({chat}, attempt) =>
    chat?.post({
      notificationType: attempt.pass ? 'success' : 'warning',
      includeInChatHistory: true,
      hideTimestamp: true,
      text: attempt.reason,
    }),
};

/** An accepted build as work to judge, its files described as the project's are. */
export function workFromBuild(build: AcceptedBuild): StepWork {
  const files = Object.fromEntries(build.files.map(file => [file.id, file]));
  return {
    at: build.at,
    change: summarizeProjectFiles({source: {files, folders: {}}}),
    process: build.transcript,
  };
}

// The lab keeps the project in its own state; read it as the work arrives.
// TODO: get weblab2 sources from a host context instead of redux.
function currentProject(): string {
  return summarizeProjectFiles(
    getStore().getState().lab2Project.projectSources
  );
}
