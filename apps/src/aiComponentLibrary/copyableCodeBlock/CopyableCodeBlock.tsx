import Button from '@code-dot-org/component-library/button';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import classNames from 'classnames';
import React, {useState, useRef, useEffect} from 'react';

import copyToClipboard from '@cdo/apps/util/copyToClipboard';
import i18n from '@cdo/locale';

import moduleStyles from './copyable-code-block.module.scss';

const CopyableCodeBlock: React.FunctionComponent = (
  props: React.HTMLAttributes<HTMLPreElement>
) => {
  const [visible, setVisible] = useState(false);
  const [, setVisibleCount] = useState(0);
  const [ariaCopyMessage, setAriaCopyMessage] = useState('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const preRef = useRef<HTMLPreElement>(null);

  /*
   * Change the aria-live message every other time the overlay becomes visible.
   * This ensures that screenreaders (tested across browser w/ VoiceOver on Mac)
   * will read the message each time (if the same message is displayed it may
   * not be read).  We add an extra zero width space (i18n.copied already has one)
   * as adding an extra normal space is not enough to trigger a re-read.
   **/
  useEffect(() => {
    if (visible) {
      setVisibleCount(previousCount => {
        if (previousCount % 2 === 1) {
          setAriaCopyMessage(i18n.copied());
        } else {
          //Add a zero width space.
          setAriaCopyMessage(i18n.copied() + '\u200B');
        }
        return previousCount + 1;
      });
    }
  }, [visible]);

  const handleCopy = () => {
    if (preRef.current?.textContent) {
      copyToClipboard(preRef.current.textContent);

      setVisible(true);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setVisible(false);
        timeoutRef.current = null;
      }, 2000);
    }
  };

  return (
    <article className={classNames(moduleStyles.codeBlock)}>
      <header className={moduleStyles['header']}>
        <Button
          onClick={handleCopy}
          text={i18n.copyCode()}
          size="xs"
          color="black"
          iconLeft={{
            iconStyle: 'regular',
            iconName: 'copy',
          }}
          type="secondary"
          className={moduleStyles.copyButton}
        />
      </header>
      <div className={moduleStyles.codeContentBody}>
        <pre ref={preRef} className={moduleStyles.codeContent} {...props} />
        <div
          className={`${moduleStyles.codeContentOverlay}${
            visible ? ' ' + moduleStyles.showOverlay : ''
          }`}
        >
          <div className={moduleStyles.codeContentOverlayBackground} />

          <span
            className={moduleStyles.codeContentAriaMessage}
            aria-live="polite"
            aria-atomic="true"
          >
            {ariaCopyMessage}
          </span>

          <span className={moduleStyles.codeContentOverlayMessage}>
            <FontAwesomeV6Icon
              iconStyle="solid"
              iconName="circle-check"
              className={moduleStyles.checkMarkIcon}
            />
            <span aria-hidden={true} key={Date.now()}>
              {i18n.copied()}
            </span>
          </span>
        </div>
      </div>
    </article>
  );
};

export default CopyableCodeBlock;
