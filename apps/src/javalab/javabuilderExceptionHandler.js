import msg from '@cdo/javalab/locale';

import {
  JavabuilderExceptionType,
  NeighborhoodExceptionType,
  SoundExceptionType,
  MediaExceptionType,
  TheaterExceptionType,
  CsaViewMode,
} from './constants';
import {getUnsupportedMiniAppMessage} from './utils';

export function handleException(exceptionDetails, callback, miniAppType) {
  const error = msg.exceptionMessage({
    message: getExceptionMessage(
      exceptionDetails,
      exceptionDetails.value,
      miniAppType
    ),
  });
  callback(error);
}

export function getExceptionMessage(exceptionDetails, type, miniAppType) {
  const {connectionId, cause, causeMessage, fallbackMessage} =
    exceptionDetails.detail && exceptionDetails.detail;
  let error;
  switch (type) {
    // User initiated exceptions
    case JavabuilderExceptionType.NO_FILES_TO_COMPILE:
      error = msg.errorNoJavaFiles();
      break;
    case JavabuilderExceptionType.ILLEGAL_METHOD_ACCESS:
      error = msg.illegalMethodAccess({cause: cause});
      break;
    case JavabuilderExceptionType.RUNTIME_ERROR:
      error = msg.runtimeError({cause: cause});
      break;
    case JavabuilderExceptionType.TWO_MAIN_METHODS:
      error = msg.twoMainMethods();
      break;
    case JavabuilderExceptionType.NO_MAIN_METHOD:
      error = msg.noMainMethod();
      break;
    case JavabuilderExceptionType.INVALID_MAIN_METHOD:
      error = msg.invalidMainMethod();
      break;
    case JavabuilderExceptionType.COMPILER_ERROR:
      error = msg.compilerError();
      break;
    case JavabuilderExceptionType.JAVA_EXTENSION_MISSING:
      error = msg.javaExtensionMissing();
      break;
    case JavabuilderExceptionType.CLASS_NOT_FOUND:
      error = msg.classNotFound();
      break;
    case JavabuilderExceptionType.FILE_NOT_FOUND:
      error = msg.fileNotFoundException({causeMessage});
      break;
    case JavabuilderExceptionType.INVALID_JAVA_FILE_NAME:
      error = msg.javabuilderJavaFilenameError({causeMessage});
      break;
    case JavabuilderExceptionType.MISSING_PROJECT_FILE_NAME:
      error = msg.javabuilderMissingFilenameError();
      break;
    case JavabuilderExceptionType.INVALID_CLASS:
      error = msg.javabuilderInvalidClassError({causeMessage});
      break;

    // Internal exceptions
    case JavabuilderExceptionType.INTERNAL_RUNTIME_EXCEPTION:
      error = msg.internalRuntimeException({connectionId: connectionId});
      break;
    case JavabuilderExceptionType.INTERNAL_COMPILER_EXCEPTION:
      error = msg.internalCompilerException({connectionId: connectionId});
      break;
    case JavabuilderExceptionType.UNKNOWN_ERROR:
    case JavabuilderExceptionType.INTERNAL_EXCEPTION:
      error = msg.internalException({connectionId: connectionId});
      break;

    // Neighborhood exceptions
    case NeighborhoodExceptionType.INVALID_GRID:
      error = getMiniAppErrorMessage(
        CsaViewMode.NEIGHBORHOOD,
        miniAppType,
        msg.errorNeighborhoodInvalidGrid()
      );
      break;
    case NeighborhoodExceptionType.INVALID_DIRECTION:
      error = getMiniAppErrorMessage(
        CsaViewMode.NEIGHBORHOOD,
        miniAppType,
        msg.errorNeighborhoodInvalidDirection()
      );
      break;
    case NeighborhoodExceptionType.GET_SQUARE_FAILED:
      error = getMiniAppErrorMessage(
        CsaViewMode.NEIGHBORHOOD,
        miniAppType,
        msg.errorNeighborhoodGetSquareFailed()
      );
      break;
    case NeighborhoodExceptionType.INVALID_COLOR:
      error = getMiniAppErrorMessage(
        CsaViewMode.NEIGHBORHOOD,
        miniAppType,
        msg.errorNeighborhoodInvalidColor()
      );
      break;
    case NeighborhoodExceptionType.INVALID_LOCATION:
      error = getMiniAppErrorMessage(
        CsaViewMode.NEIGHBORHOOD,
        miniAppType,
        msg.errorNeighborhoodInvalidLocation()
      );
      break;
    case NeighborhoodExceptionType.INVALID_MOVE:
      error = getMiniAppErrorMessage(
        CsaViewMode.NEIGHBORHOOD,
        miniAppType,
        msg.errorNeighborhoodInvalidMove()
      );
      break;
    case NeighborhoodExceptionType.INVALID_PAINT_LOCATION:
      error = getMiniAppErrorMessage(
        CsaViewMode.NEIGHBORHOOD,
        miniAppType,
        msg.errorNeighborhoodInvalidPaintLocation()
      );
      break;

    // Sound exceptions
    case SoundExceptionType.INVALID_AUDIO_FILE_FORMAT:
      error = getMiniAppErrorMessage(
        CsaViewMode.THEATER,
        miniAppType,
        msg.errorSoundInvalidAudioFileFormat()
      );
      break;
    case SoundExceptionType.MISSING_AUDIO_DATA:
      error = getMiniAppErrorMessage(
        CsaViewMode.THEATER,
        miniAppType,
        msg.errorSoundMissingAudioData()
      );
      break;

    // Media exceptions
    case MediaExceptionType.IMAGE_LOAD_ERROR:
      error = getMiniAppErrorMessage(
        CsaViewMode.THEATER,
        miniAppType,
        msg.errorMediaImageLoadError()
      );
      break;

    // Theater exceptions
    case TheaterExceptionType.DUPLICATE_PLAY_COMMAND:
      error = getMiniAppErrorMessage(
        CsaViewMode.THEATER,
        miniAppType,
        msg.errorTheaterDuplicatePlayCommand()
      );
      break;
    case TheaterExceptionType.INVALID_SHAPE:
      error = getMiniAppErrorMessage(
        CsaViewMode.THEATER,
        miniAppType,
        msg.errorTheaterInvalidShape()
      );
      break;
    case TheaterExceptionType.VIDEO_TOO_LONG:
      error = getMiniAppErrorMessage(
        CsaViewMode.THEATER,
        miniAppType,
        msg.errorTheaterVideoTooLong()
      );
      break;
    case TheaterExceptionType.VIDEO_TOO_LARGE:
      error = getMiniAppErrorMessage(
        CsaViewMode.THEATER,
        miniAppType,
        msg.errorTheaterVideoTooLarge()
      );
      break;

    // Fatal errors
    case JavabuilderExceptionType.CONNECTION_POOL_SHUT_DOWN:
    case JavabuilderExceptionType.LOW_DISK_SPACE:
    case JavabuilderExceptionType.TEMP_DIRECTORY_CLEANUP_ERROR:
      error = msg.internalException({connectionId: connectionId});
      break;

    default:
      error = fallbackMessage || msg.unknownError({type, connectionId});
      break;
  }
  return error;
}

/**
 * Returns the provided mini-app specific error message if the message mini-app type
 * is the same as the current level's mini-app type. Or else, returns a generic
 * unsupported mini-app type message.
 */
function getMiniAppErrorMessage(
  messageMiniAppType,
  levelMiniAppType,
  miniAppErrorMessage
) {
  return messageMiniAppType === levelMiniAppType
    ? miniAppErrorMessage
    : getUnsupportedMiniAppMessage(messageMiniAppType);
}
