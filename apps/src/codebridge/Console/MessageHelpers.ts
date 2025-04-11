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
  // Reference for color codes: https://en.wikipedia.org/wiki/ANSI_escape_code#Colors
  return `\x1b[38;5;203m${message}\x1b[0m`;
}

export function getSystemError(message: string, appName?: string) {
  return getErrorMessage(getSystemMessage(message, appName));
}
