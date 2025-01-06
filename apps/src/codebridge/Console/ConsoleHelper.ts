import CodebridgeRegistry from '@codebridge/CodebridgeRegistry';

export function writeConsoleMessage(message: string) {
  const lines = message.split('\n');
  lines.forEach(l => CodebridgeRegistry.getInstance().appendTerminalLine(l));
}

export function writeSystemMessage(message: string, appName: string) {
  writeConsoleMessage(getSystemMessage(message, appName));
}

export function writeErrorMessage(message: string) {
  writeConsoleMessage(`\x1b[31m${message}\x1b[0m`);
}

export function writeSystemError(message: string, appName: string) {
  writeErrorMessage(getSystemMessage(message, appName));
}

function getSystemMessage(message: string, appName: string) {
  const systemMessagePrefix = appName === 'pythonlab' ? '[PYTHON LAB] ' : '';
  return `${systemMessagePrefix}${message}`;
}

export function writeImage(base64Image: string) {
  const dataSize = atob(base64Image).length;
  const imageString = `\x1b]1337;File=inline=1;size=${dataSize};width=400px;height=400px:${base64Image}\x1b\\`;
  CodebridgeRegistry.getInstance().appendTerminalLine(imageString);
}
