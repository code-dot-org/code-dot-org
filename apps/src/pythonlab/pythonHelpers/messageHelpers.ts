export function parseErrorMessage(errorMessage: string, ) {
  const errorLines = errorMessage.trim().split('\n');
  console.log({errorLines});
  if (errorLines[0].startsWith('Traceback') && errorLines.length >= 8) {
    const exceptionMessage = errorLines[7];
    if (errorLines[6].match(/line \d+/)) {
      const lineNumber = parseInt(errorLines[6].match(/line (\d+)/)![1]);
      console.log({exceptionMessage, lineNumber});
    }
  }
}
