// The panel.
//
// What fills the hole `labs/base/src/resourcePanel/components/ResourcePanel.tsx`
// left for it (specs/PLAN.md §1). Everything it knows about the world outside
// itself comes from `TutorProvider`; everything it knows about the conversation
// comes from the injected slice. It does not know what a lab is, what a project
// is, or where the answers come from.
//
// The list SCROLLS TO THE BOTTOM when it grows, which sounds like a detail and
// is the difference between a chat and a log: an answer that arrives below the
// fold looks like no answer at all.

import classNames from 'classnames';
import {useEffect, useRef, type FC, type ReactNode} from 'react';

import {isPendingMessage} from '../model/messages';
import {useTutorConfig} from '../session/TutorContext';
import {useTutor} from '../session/useTutor';

import {ChatDisabled} from './ChatDisabled';
import {Composer} from './Composer';
import {MessageView} from './MessageView';
import {ProposalActions} from './ProposalActions';
import {SuggestedPrompts} from './SuggestedPrompts';
import {WaitingAnimation} from './WaitingAnimation';

import moduleStyles from './ai-tutor-panel.module.scss';

export interface AiTutorPanelProps {
  className?: string;
  /** Shown above an empty conversation. */
  emptyState?: ReactNode;
}

export const AiTutorPanel: FC<AiTutorPanelProps> = ({
  className,
  emptyState,
}) => {
  const {messages, awaiting, proposal, accept, reject, send} = useTutor();
  const {prompts, disabledState} = useTutorConfig();
  const foot = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // `scrollIntoView` is not implemented in jsdom, and a missing scroll is not
    // a reason for a test to fail.
    foot.current?.scrollIntoView?.({block: 'end'});
  }, [messages.length, awaiting]);

  return (
    <div className={classNames(moduleStyles.panel, className)}>
      <div className={moduleStyles.conversation}>
        {messages.length === 0 && emptyState}
        {messages.map((message, at) => (
          <MessageView
            key={message.updateId ?? `${message.timestamp}-${message.role}`}
            message={message}
            // Under the LAST message, where the legacy puts them
            // (`renderLastMessagePostText`), because that is the answer they
            // belong to and there is only ever one offer standing.
            postText={
              proposal && at === messages.length - 1 ? (
                <ProposalActions
                  proposal={proposal}
                  onAccept={accept}
                  onReject={reject}
                />
              ) : undefined
            }
          />
        ))}
        {/*
          The pending message is already in the list — it is the student's own
          turn, shown the moment they sent it — so what is missing while a turn
          is in flight is the ANSWER, and that is what the dots stand in for.
        */}
        {awaiting && messages.some(isPendingMessage) && (
          <div className={moduleStyles.waiting}>
            <WaitingAnimation />
          </div>
        )}
        <div ref={foot} />
      </div>
      {disabledState?.disabled ? (
        // Instead of the composer, not beside it. A message explaining that
        // chat is off, above a box inviting a question, would be two answers to
        // the same question.
        <ChatDisabled
          message={disabledState.disabledMessage}
          link={disabledState.disabledLink}
        />
      ) : (
        <div className={moduleStyles.foot}>
          {/*
          Above the composer and outside it, as in the legacy layout: they are
          a way to START a conversation, and a student who has begun typing
          should not have the field jump as they do.
        */}
          <SuggestedPrompts
            prompts={prompts ?? []}
            onChoose={prompt => send(prompt.value)}
            disabled={awaiting}
          />
          <Composer onSubmit={send} disabled={awaiting} />
        </div>
      )}
    </div>
  );
};

export default AiTutorPanel;
