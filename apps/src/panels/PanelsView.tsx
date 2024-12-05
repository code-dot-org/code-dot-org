import classNames from 'classnames';
import markdownToTxt from 'markdown-to-txt';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import Typist from 'react-typist';

import {Button} from '@cdo/apps/componentLibrary/button';
import TextToSpeech from '@cdo/apps/lab2/views/components/TextToSpeech';

import {queryParams} from '../code-studio/utils';
import FontAwesome from '../legacySharedComponents/FontAwesome';
import {useBrowserTextToSpeech} from '../sharedComponents/BrowserTextToSpeechWrapper';
import EnhancedSafeMarkdown from '../templates/EnhancedSafeMarkdown';
import {commonI18n} from '../types/locale';

import {Panel} from './types';

import styles from './panelsView.module.scss';

// Leave a margin to the left and the right of the panels, to the edges
// of the screen.
const horizontalMargin = 40;

// Leave a vertical margin above and below the panels, to the edges of the
// screen.
const verticalMargin = 50;

// We need room below the panels content for the children passed in.  This area
// can contain things like a Continue button.
const childrenAreaHeight = 70;

interface PanelsProps {
  panels: Panel[];
  onContinue: (nextUrl?: string) => void;
  onSkip?: () => void;
  targetWidth: number;
  targetHeight: number;
  offerBrowserTts: boolean;
  levelId: string | null;
  resetOnChange?: boolean;
  onChangePanel?: (
    source: 'button' | 'bubble',
    currentPanel: number,
    nextPanel: number,
    timeSpentOnPanelSeconds: number
  ) => void;
  onClickContinue?: (
    currentPanel: number,
    timeSpentOnPanelSeconds: number
  ) => void;
}

/**
 * View that renders a set of panels with an image and text. Used in the Lab2 panels level type.
 */
const PanelsView: React.FunctionComponent<PanelsProps> = ({
  panels,
  onContinue,
  onSkip,
  targetWidth,
  targetHeight,
  offerBrowserTts,
  levelId,
  resetOnChange = true,
  onChangePanel,
  onClickContinue,
}) => {
  const [currentPanelIndex, setCurrentPanelIndex] = useState(0);
  const [previousPanelIndex, setPreviousPanelIndex] = useState<
    number | undefined
  >(undefined);
  const [typingDone, setTypingDone] = useState(false);
  const {cancel} = useBrowserTextToSpeech();

  const lastPanelStartTime = useRef<number>(Date.now());

  targetWidth -= horizontalMargin * 2;
  targetHeight -= verticalMargin * 2 + childrenAreaHeight;

  const [width, height] = useMemo(() => {
    let width, height;

    // The aspect ratio of the panels.
    const contentAspectRatio = 16 / 9;

    if (targetWidth / targetHeight > contentAspectRatio) {
      height = targetHeight;
      width = contentAspectRatio * height;
    } else {
      width = targetWidth;
      height = width / contentAspectRatio;
    }
    return [width, height];
  }, [targetWidth, targetHeight]);

  const changePanel = useCallback(
    (index: number, source: 'button' | 'bubble') => {
      if (onChangePanel) {
        onChangePanel(
          source,
          currentPanelIndex,
          index,
          (Date.now() - lastPanelStartTime.current) / 1000
        );
      }
      setPreviousPanelIndex(currentPanelIndex);
      setCurrentPanelIndex(index);
    },
    [currentPanelIndex, onChangePanel]
  );

  const handleButtonClick = useCallback(() => {
    if (currentPanelIndex < panels.length - 1) {
      changePanel(currentPanelIndex + 1, 'button');
    } else {
      if (onClickContinue) {
        onClickContinue(
          currentPanelIndex,
          (Date.now() - lastPanelStartTime.current) / 1000
        );
      }
      onContinue(panels[currentPanelIndex].nextUrl);
    }
  }, [changePanel, panels, currentPanelIndex, onContinue, onClickContinue]);

  const handleBubbleClick = useCallback(
    (index: number) => {
      changePanel(index, 'bubble');
    },
    [changePanel]
  );

  // Reset to first panel whenever panels content changes if specified.
  useEffect(() => {
    if (resetOnChange) {
      setPreviousPanelIndex(undefined);
      setCurrentPanelIndex(0);
    }
  }, [panels, resetOnChange]);

  // Reset to last panel if number of panels has reduced.
  useEffect(() => {
    if (!resetOnChange && currentPanelIndex >= panels.length) {
      setCurrentPanelIndex(Math.max(panels.length - 1, 0));
    }
  }, [currentPanelIndex, panels, resetOnChange]);

  // Cancel any in-progress text-to-speech when the panel changes
  // and reset the last panel start time.
  useEffect(() => {
    if (offerBrowserTts) {
      cancel();
    }
    lastPanelStartTime.current = Date.now();
  }, [currentPanelIndex, offerBrowserTts, cancel]);

  // Reset typing if the panel changes.
  useEffect(() => {
    setTypingDone(false);
  }, [currentPanelIndex, setTypingDone]);

  const panel = panels[currentPanelIndex];
  if (!panel) {
    return null;
  }

  const previousPanel =
    panel.fadeInOverPrevious &&
    previousPanelIndex !== undefined &&
    panels[previousPanelIndex];

  const nextPanel =
    currentPanelIndex + 1 < panels.length && panels[currentPanelIndex + 1];

  const layoutClassMap = {
    'text-top-left': styles.textTopLeft,
    'text-top-center': styles.textTopCenter,
    'text-bottom-left': styles.textBottomLeft,
    'text-bottom-center': styles.textBottomCenter,
    'text-bottom-right': styles.textBottomRight,
    'text-top-right': styles.textTopRight,
  };

  const textLayoutClass = panel.layout
    ? layoutClassMap[panel.layout]
    : styles.textTopRight;

  const buttonText =
    currentPanelIndex < panels.length - 1
      ? commonI18n.next()
      : commonI18n.continue();

  const plainText = markdownToTxt(panel.text);

  const showTyping =
    panel.typing || queryParams('panels-show-typing') === 'true';

  // When typing, only show the button when the typing is done.
  const showButton = !showTyping || typingDone;

  return (
    <div
      id="panels-container"
      className={styles.panelsContainer}
      key={`${levelId || 'default'}-${currentPanelIndex}`}
    >
      <div className={styles.panel} style={{width, height}}>
        {previousPanel && (
          <div
            className={styles.image}
            style={{
              backgroundImage: `url("${previousPanel.imageUrl}")`,
            }}
          />
        )}
        <div
          className={classNames(styles.image, styles.imageCurrent)}
          style={{
            backgroundImage: `url("${panel.imageUrl}")`,
          }}
        />
        {nextPanel && (
          <div
            className={classNames(styles.image, styles.imageInvisible)}
            style={{
              backgroundImage: `url("${nextPanel.imageUrl}")`,
            }}
          />
        )}
        {panel.text && (
          <div
            className={classNames(
              styles.text,
              panel.dark && styles.textDark,
              textLayoutClass
            )}
          >
            {offerBrowserTts && <TextToSpeech text={panel.text} />}
            {showTyping ? (
              <div>
                <div className={styles.invisiblePlaceholder}>{plainText}</div>
                <Typist
                  startDelay={750}
                  avgTypingDelay={35}
                  stdTypingDelay={15}
                  cursor={{show: false}}
                  onTypingDone={() => {
                    setTypingDone(true);
                  }}
                  className={styles.typist}
                >
                  {plainText}
                </Typist>
              </div>
            ) : (
              <EnhancedSafeMarkdown markdown={panel.text} />
            )}
          </div>
        )}
      </div>
      <div
        className={styles.childrenArea}
        style={{width: width, height: childrenAreaHeight}}
      >
        {showButton && (
          <Button
            key={`button-${currentPanelIndex}`}
            id="panels-button"
            onClick={handleButtonClick}
            className={classNames(
              styles.button,
              showTyping ? styles.buttonReady : styles.buttonDelay
            )}
            text={buttonText}
          />
        )}

        {panels.length > 1 && (
          <div id="panels-bubbles">
            {Array.from(Array(panels.length).keys()).map(index => {
              return (
                <FontAwesome
                  key={index}
                  className={classNames(
                    'icon',
                    styles.bubble,
                    index === currentPanelIndex
                      ? styles.bubbleCurrent
                      : styles.bubbleNotCurrent
                  )}
                  title={undefined}
                  icon="circle"
                  onClick={() => handleBubbleClick(index)}
                />
              );
            })}
          </div>
        )}
      </div>
      {onSkip && (
        <div className={styles.skipContainer}>
          <button onClick={onSkip} type="button" className={styles.buttonSkip}>
            <span className={styles.buttonSkipContent}>
              {commonI18n.skipToProject()}
            </span>
            <FontAwesome
              title={commonI18n.skipToProject()}
              icon="arrow-right"
              className={'icon'}
            />
          </button>
        </div>
      )}
    </div>
  );
};

export default PanelsView;
