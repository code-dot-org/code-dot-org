export function parseErrorMessage(errorMessage: string) {
  const errorLines = errorMessage.trim().split('\n');
  console.log({errorLines});
  const mainErrorRegex = /File "<exec>", line \d+, in <module>/;
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
  // TODO: translate message
  // loop to get the stack trace
  // then the error message will be after the stack trace
}
