import {AppName} from '@cdo/apps/lab2/types';

import {Pathway} from '../types';

/**
 * How students work on a project in each lab, for generated instructions:
 * what they do and do not do themselves, and how to phrase what to do next.
 */
const LAB_ENVIRONMENTS: {[app in AppName]?: string} = {
  weblab2:
    'Students build the site in Web Lab 2 by prompting an AI build partner inside the editor; they do not write HTML or CSS by hand. Instructions say what to ask the AI for and where on the page it goes, never what code to write.',
};

/** The environment text for the lab the pathway's project is built in, if known. */
export function labEnvironment(pathway: Pathway): string | undefined {
  const appName = pathway.project.levelProperties?.appName;
  return appName ? LAB_ENVIRONMENTS[appName] : undefined;
}
