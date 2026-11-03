// Where the student types.
//
// Ported from `apps/src/aiComponentLibrary/userMessageEditor/UserMessageEditor.tsx`,
// minus speech-to-text and its analytics — a separate feature with its own
// permissions story, and not one the panel needs to work.
//
// Two behaviours are worth keeping and are easy to lose in a rewrite. ENTER
// SENDS and shift-enter does not, because a chat where enter inserts a newline
// is a chat nobody can use quickly. And the textarea GROWS with its content up
// to a limit, measured rather than guessed — including when its container
// resizes, which is what happens every time the resource panel is collapsed and
// reopened; without that, a height measured while the panel was narrow sticks.

import {IconButton as MuiIconButton} from '@mui/material';
import classNames from 'classnames';
import {useCallback, useEffect, useRef, useState, type FC} from 'react';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import {strings} from '../strings';

import moduleStyles from './composer.module.scss';

/** As the legacy editor: past this, the model would refuse anyway. */
const MAX_MESSAGE_LENGTH = 10000;

export interface ComposerProps {
  onSubmit: (text: string) => void;
  /** True while a turn is in flight; the field stays usable, the button does not. */
  disabled?: boolean;
  placeholder?: string;
}

export const Composer: FC<ComposerProps> = ({
  onSubmit,
  disabled = false,
  placeholder = strings.placeholder,
}) => {
  const [text, setText] = useState('');
  // Tracked here rather than with `:focus-visible`, which does not apply to the
  // div being outlined, and `:has()`, which Firefox did not support when the
  // legacy version was written.
  const [focused, setFocused] = useState(false);
  const field = useRef<HTMLTextAreaElement | null>(null);

  const empty = text.trim() === '';

  const submit = useCallback(() => {
    if (empty || disabled) {
      return;
    }
    onSubmit(text);
    setText('');
  }, [empty, disabled, onSubmit, text]);

  const resize = useCallback(() => {
    const textarea = field.current;
    if (!textarea) {
      return;
    }
    // Reset before measuring: `scrollHeight` on a textarea already sized to its
    // content reports that size, not the content's.
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight + 2}px`;
  }, []);

  useEffect(resize, [text, resize]);

  useEffect(() => {
    const textarea = field.current;
    if (!textarea || typeof ResizeObserver === 'undefined') {
      return;
    }
    let lastWidth = textarea.clientWidth;
    const observer = new ResizeObserver(entries => {
      const width = entries[0]?.contentRect.width ?? textarea.clientWidth;
      if (width !== lastWidth) {
        lastWidth = width;
        resize();
      }
    });
    observer.observe(textarea);
    return () => observer.disconnect();
  }, [resize]);

  return (
    // A LABEL, not a div with a click handler. The whole box is meant to be
    // clickable — the padding around the field included — and a label focuses
    // the control it wraps natively, with no handler, no `tabIndex` and no
    // keyboard equivalent to invent. The legacy editor used a div and an
    // `onClick`, which works for a mouse and for nothing else.
    <label
      className={classNames(
        moduleStyles.container,
        focused && moduleStyles.focused,
      )}
    >
      <textarea
        ref={field}
        className={moduleStyles.textArea}
        value={text}
        maxLength={MAX_MESSAGE_LENGTH}
        placeholder={placeholder}
        aria-label={placeholder}
        rows={1}
        onChange={event => setText(event.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={event => {
          if (event.key === 'Enter' && !event.shiftKey && !empty) {
            // Or the field would keep a blank line where the send happened.
            event.preventDefault();
            submit();
          }
        }}
      />
      <div className={moduleStyles.actions}>
        <MuiIconButton
          variant="contained"
          color="primary"
          size="extraSmall"
          disabled={disabled || empty}
          aria-label={strings.submit}
          type="button"
          onClick={event => {
            event.stopPropagation();
            submit();
          }}
        >
          <FontAwesomeV6Icon iconName="arrow-up" />
        </MuiIconButton>
      </div>
    </label>
  );
};

export default Composer;
