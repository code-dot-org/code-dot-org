// One turn, as a bubble.
//
// Ported from `apps/src/aiComponentLibrary/chatMessage/ChatMessage.tsx` and the
// display half of `apps/src/aichat/views/ChatMessageView.tsx`. The shape and the
// styling are theirs: the student's turn right-aligned on neutral, the tutor's
// left-aligned on aqua, each with the corner nearest its speaker squared off.
//
// Three things from the legacy pair are not here. The TA avatar and its overlay
// belong to a product that is not this one. The `json-video` rehype map belongs
// to the lesson deep dive (specs/PLAN.md §2). The copy-button analytics dispatch
// reaches `getStore()` for a studio singleton, which is the coupling this whole
// package exists to remove.
//
// The tutor's text is MARKDOWN and the student's is not, which is the legacy
// behaviour and the right one: the model writes markdown deliberately, and a
// student typing `*` between two words means an asterisk.

import classNames from 'classnames';
import type {FC, ReactNode} from 'react';

import {Markdown} from '@code-dot-org/markdown';

import {Role, type ChatMessage} from '../model/messages';
import {AiInteractionStatus} from '../model/status';
import {strings} from '../strings';

import {failureText} from './failureText';

import moduleStyles from './message-view.module.scss';

export interface MessageViewProps {
  message: ChatMessage;
  /** Rendered inside the bubble, after the text — a proposal's files, say. */
  postText?: ReactNode;
}

export const MessageView: FC<MessageViewProps> = ({message, postText}) => {
  const {role, status} = message;
  const isAssistant = role === Role.ASSISTANT;

  const replaced = failureText(role, status);
  const text =
    replaced ?? message.chatMessageDisplayText ?? message.chatMessageText;

  // An assistant turn that failed says so in plain prose supplied by us, not by
  // the model — so it must not go through the markdown renderer, which would be
  // rendering our own copy as though the model had written it.
  const asMarkdown = isAssistant && replaced === undefined;

  // A failed turn is tinted rather than merely worded, because the difference
  // between "the tutor said this" and "the tutor could not answer" should not
  // depend on reading the sentence.
  //
  // A message still IN FLIGHT is neither. `unknown` is not-yet-settled, and
  // reading it as "not ok" paints the student's question as rejected the
  // instant they send it, then unpaints it when the answer lands.
  const failed =
    status !== AiInteractionStatus.OK && status !== AiInteractionStatus.UNKNOWN;

  if (!text && !postText) {
    return null;
  }

  return (
    <div className={moduleStyles[`container-${role}`]}>
      <div
        className={classNames(
          moduleStyles[`message-${role}`],
          failed && moduleStyles.failed,
        )}
        aria-label={isAssistant ? strings.botMessage : strings.userMessage}
      >
        {asMarkdown ? (
          <div className={moduleStyles.content}>
            <Markdown content={text} />
            {postText}
          </div>
        ) : (
          <div className={moduleStyles.content}>
            <p>{text}</p>
            {postText}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageView;
