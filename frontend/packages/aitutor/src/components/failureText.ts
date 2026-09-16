// What to show instead of a message that did not survive.
//
// Ported from the `getDisplayText` switch in `apps/src/aichat/views/ChatMessageView.tsx`.
// Kept as a function of (role, status) alone, with no component around it, because
// it is the one piece of that file worth testing directly: the mapping is what
// makes a status vocabulary useful, and getting it wrong shows a student the
// wrong explanation for their own failure.

import {Role} from '../model/messages';
import {AiInteractionStatus} from '../model/status';
import {strings} from '../strings';

/**
 * The text for a message, or `undefined` to show the message's own.
 *
 * A rejected USER message is replaced rather than annotated: the student's own
 * words are the thing that was flagged, and repeating them under a notice about
 * them is the one presentation nobody wants.
 */
export const failureText = (
  role: Role,
  status: AiInteractionStatus,
): string | undefined => {
  if (role === Role.USER) {
    switch (status) {
      case AiInteractionStatus.PII_VIOLATION:
        return strings.tooPersonal;
      case AiInteractionStatus.PROFANITY_VIOLATION:
        return strings.inappropriateUser;
      default:
        return undefined;
    }
  }

  switch (status) {
    case AiInteractionStatus.PROFANITY_VIOLATION:
      return strings.inappropriateModel;
    case AiInteractionStatus.PII_VIOLATION:
      return strings.tooPersonal;
    case AiInteractionStatus.USER_INPUT_TOO_LARGE:
      return strings.inputTooLarge;
    case AiInteractionStatus.MODEL_TIMEOUT:
      return strings.timeout;
    case AiInteractionStatus.MODEL_RATE_LIMITED:
      return strings.rateLimited;
    case AiInteractionStatus.ERROR:
      return strings.responseError;
    default:
      return undefined;
  }
};
