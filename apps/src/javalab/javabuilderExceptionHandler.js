import msg from '@cdo/javalab/locale';
import {JavabuilderExceptionType} from './constants';
export function handleException(exceptionDetails, callback) {
  const type = exceptionDetails.value;
  const {connectionId, cause} =
    exceptionDetails.detail && exceptionDetails.detail;
  let error;
  switch (type) {
    case JavabuilderExceptionType.COMPILER_ERROR:
      error = msg.compilerError();
      break;
    case JavabuilderExceptionType.ILLEGAL_METHOD_ACCESS:
      error = msg.illegalMethodAccess({cause: cause});
      break;
    case JavabuilderExceptionType.INTERNAL_COMPILER_EXCEPTION:
      error = msg.internalCompilerException({connectionId: connectionId});
      break;
    case JavabuilderExceptionType.INTERNAL_EXCEPTION:
      error = msg.internalException({connectionId: connectionId});
      break;
    case JavabuilderExceptionType.INTERNAL_RUNTIME_EXCEPTION:
      error = msg.internalRuntimeException({connectionId: connectionId});
      break;
    case JavabuilderExceptionType.JAVA_EXTENSION_MISSING:
      error = msg.javaExtensionMissing();
      break;
    case JavabuilderExceptionType.NO_MAIN_METHOD:
      error = msg.noMainMethod();
      break;
    case JavabuilderExceptionType.RUNTIME_ERROR:
      error = msg.runtimeError({cause: cause});
      break;
    case JavabuilderExceptionType.TWO_MAIN_METHODS:
      error = msg.twoMainMethods();
      break;
    default:
      error = exceptionDetails;
      break;
  }
  callback(error);
}
