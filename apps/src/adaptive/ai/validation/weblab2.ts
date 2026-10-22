// Work in Web Lab 2: each build the student accepts from the AI build
// partner, read through the chat's handle. The files the build changed are
// the change, the exchange that produced it is the process, and the project
// as the lab holds it is the context. Verdicts go back into the chat as the
// tutor speaking.

import {AcceptedBuild} from '@cdo/apps/aichat/host/ChatHostContext';
import {getStore} from '@cdo/apps/redux';

import {summarizeProjectFiles} from '../../project/summarizeProjectFiles';

import {StepWork, WorkAdapter} from './types';

export const weblab2Adapter: WorkAdapter = {
  observe: ({chat}, listener) => {
    if (!chat) return () => {};
    return chat.onBuildAccepted(build =>
      listener({...workOf(build), project: currentProject()})
    );
  },
  report: ({chat}, attempt) =>
    chat?.post({
      notificationType: 'hostMessage',
      includeInChatHistory: true,
      text: `${
        attempt.pass ? "This meets the step's goal." : 'Not there yet.'
      } ${attempt.reason}`,
    }),
};

/** An accepted build as work to judge, its files described as the project's are. */
export function workOf(build: AcceptedBuild): StepWork {
  const files = Object.fromEntries(build.files.map(file => [file.id, file]));
  return {
    at: build.at,
    change: summarizeProjectFiles({source: {files, folders: {}}}),
    process: build.transcript,
  };
}

// The lab keeps the project in its own state; read it as the work arrives.
function currentProject(): string {
  return summarizeProjectFiles(
    getStore().getState().lab2Project.projectSources
  );
}
