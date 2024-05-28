export function parseErrorMessage(errorMessage: string) {
  const errorLines = errorMessage.trim().split('\n');
  const mainErrorRegex = /File "<exec>", line \d+.*/;
  let mainErrorLine = 0;
  while (
    mainErrorLine < errorLines.length &&
    !mainErrorRegex.test(errorLines[mainErrorLine])
  ) {
    mainErrorLine++;
  }
  if (mainErrorLine >= errorLines.length) {
    return errorMessage;
  }
  const mainLineNumber = parseInt(
    errorLines[mainErrorLine].match(/line (\d+)/)![1]
  );
  let parsedError = `\nmain.py, line ${mainLineNumber}`;
  let hasStackToParse = true;
  let currentLine = mainErrorLine + 1;
  const lineRegex = /File "\/home\/pyodide\/([^"]+)", line (\d+).*/;
  const caratMatch = /^\s+\^+$/;
  while (hasStackToParse && currentLine < errorLines.length) {
    if (lineRegex.test(errorLines[currentLine])) {
      const [, file, line] = errorLines[currentLine].match(lineRegex)!;
      parsedError += `\n${file}, line ${line}`;
      parsedError += `\n${errorLines[currentLine + 1]}`;
      currentLine += 2;
      if (caratMatch.test(errorLines[currentLine])) {
        parsedError += `\n${errorLines[currentLine]}`;
        currentLine++;
      }
    } else {
      hasStackToParse = false;
    }
  }
  parsedError += `\n${errorLines[currentLine]}`;
  console.log({parsedError});
  return parsedError;
  // TODO: translate message
  // loop to get the stack trace
  // then the error message will be after the stack trace
}
