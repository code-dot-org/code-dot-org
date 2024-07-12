import msg from '@cdo/javalab/locale';

import {UserTestResultSignalType, TestStatus} from './constants';
import {getExceptionMessage} from './javabuilderExceptionHandler';

const CHECK_MARK = '✔';
const HEAVY_X = '✖';

export function onTestResult(data, callback, miniAppType) {
  let message = '';
  const {
    status,
    className,
    methodName,
    assertionError,
    fileName,
    errorLine,
    isValidation,
    exceptionName,
    stackTrace,
  } = data.detail && data.detail;
  const statusDetails = {className: className, methodName: methodName};
  let successful = true;
  switch (data.value) {
    case UserTestResultSignalType.TEST_STATUS:
      if (status === TestStatus.SUCCESSFUL) {
        message = `${CHECK_MARK} ${msg.successfulTestResult(statusDetails)}`;
      } else if (status === TestStatus.FAILED) {
        message = `${HEAVY_X} ${msg.failedTestResult(statusDetails)}`;
        successful = false;
      } else {
        message = `${HEAVY_X} ${msg.abortedTestResult(statusDetails)}`;
        successful = false;
      }
      break;
    case UserTestResultSignalType.STATUS_DETAILS:
      message = '\t';
      if (assertionError) {
        message += assertionError;
      } else if (exceptionName) {
        message += msg.exceptionThrown({exceptionName: exceptionName});
      } else {
        message += getExceptionMessage(data, data.detail.type, miniAppType);
      }

      if (stackTrace) {
        message += `\n${stackTrace}`;
      } else if (!isValidation && fileName && errorLine) {
        message += ` (${fileName}:${errorLine})`;
      }

      break;
    default:
      break;
  }
  callback(message);
  return {success: successful, isValidation: isValidation};
}
