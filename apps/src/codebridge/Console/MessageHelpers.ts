import codebridgeI18n from '@cdo/apps/codebridge/locale';

import {RunType} from '../types';

const IMAGE_WIDTH = 600;
const IMAGE_HEIGHT = 600;

export function getSystemMessage(message: string, appName?: string) {
  const systemMessagePrefix = appName === 'pythonlab' ? '[PYTHON LAB] ' : '';
  return `${systemMessagePrefix}${message}`;
}

export function getImageMessage(base64Image: string) {
  const dataSize = atob(base64Image).length;
  // This is a special sequence that tells the terminal to display an image
  // See documentation here: https://iterm2.com/documentation-images.html
  return `\x1b]1337;File=inline=1;size=${dataSize};width=${IMAGE_WIDTH}px;height=${IMAGE_HEIGHT}px:${base64Image}\x1b\\`;
}

export function getErrorMessage(message: string) {
  // This colors the message red in the terminal
  return getMessageWithColor(message, 31);
}

export function getSystemError(message: string, appName?: string) {
  return getErrorMessage(getSystemMessage(message, appName));
}

export function getTimestampMessage(runType: RunType) {
  const currentDate = new Date();
  const formattedTime = currentDate.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
  let runString = codebridgeI18n.runAt({time: formattedTime});
  if (runType === RunType.TEST) {
    runString = codebridgeI18n.testAt({time: formattedTime});
  } else if (runType === RunType.VALIDATION) {
    runString = codebridgeI18n.validateAt({time: formattedTime});
  }
  // The full message should be 32 characters long, padded with '-' on both sides
  const stringLength = runString.length;
  const paddingLeftCount = Math.max(Math.floor((32 - stringLength) / 2), 0);
  const paddingRightCount = Math.max(32 - stringLength - paddingLeftCount, 0);
  const fullMessage =
    '-'.repeat(paddingLeftCount) + runString + '-'.repeat(paddingRightCount);
  // "Bright Black" (aka gray)
  return getMessageWithColor(fullMessage, 90);
}

// Return the message colored with the given ANSI color code.
// The message will reset the color at the end so the next message will be the default color.
// Reference for color codes: https://en.wikipedia.org/wiki/ANSI_escape_code#Colors
// We have overriden some colors based on theme, see consoleThemes.ts for any overrides.
function getMessageWithColor(message: string, ansiColor: number) {
  return `\x1b[${ansiColor}m${message}\x1b[0m`;
}
