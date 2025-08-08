import useResizeObserver from '@react-hook/resize-observer';
import classNames from 'classnames';
import {markdownToTxt} from 'markdown-to-txt';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Typist} from 'react-typist';

import TextToSpeech, {useBrowserTextToSpeech} from '@code-dot-org/audio/textToSpeech';
import {Button} from '@code-dot-org/component-library/button';
import Markdown from '@code-dot-org/markdown';

import type {PanelData, PanelLayout} from '../types';

import moduleStyles from './panelsView.module.scss';

export type LessonBackground = 'light' | 'dark' | null;

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
  panels: PanelData[];
  background: LessonBackground;
  onContinue: (nextUrl?: string) => void;
  onSkip?: () => void;
  offerBrowserTts: boolean;
  levelId: string | null;
  resetOnChange?: boolean;
  onChangePanel?: (
    source: 'button' | 'bubble',
    currentPanel: number,
    nextPanel: number,
    timeSpentOnPanelSeconds: number,
  ) => void;
  onClickContinue?: (
    currentPanel: number,
    timeSpentOnPanelSeconds: number,
  ) => void;
}

/**
 * View that renders a set of panels with an image and text. Used in the Lab2 panels level type.
 */
const PanelsView: React.FunctionComponent<PanelsProps> = ({
  panels,
  background,
  onContinue,
  onSkip,
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
  const containerRef = useRef<HTMLDivElement>(null);

  const lastPanelStartTime = useRef<number>(Date.now());

  const [size, setSize] = useState<{width: number; height: number}>({
    width: 0,
    height: 0,
  });

  useResizeObserver(containerRef, () => {
    if (containerRef.current) {
      let width, height;

      // The aspect ratio of the panels.
      const contentAspectRatio = 16 / 9;

      const targetWidth =
        containerRef.current?.clientWidth - horizontalMargin * 2;
      const targetHeight =
        containerRef.current?.clientHeight -
        verticalMargin * 2 -
        childrenAreaHeight;
      console.log('CONTAINER', containerRef.current);

      if (targetWidth / targetHeight > contentAspectRatio) {
        height = targetHeight;
        width = contentAspectRatio * height;
      } else {
        width = targetWidth;
        height = width / contentAspectRatio;
      }
      setSize({width, height});
    }
  });

  const changePanel = useCallback(
    (index: number, source: 'button' | 'bubble') => {
      if (onChangePanel) {
        onChangePanel(
          source,
          currentPanelIndex,
          index,
          (Date.now() - lastPanelStartTime.current) / 1000,
        );
      }
      setPreviousPanelIndex(currentPanelIndex);
      setCurrentPanelIndex(index);
    },
    [currentPanelIndex, onChangePanel],
  );

  const handleButtonClick = useCallback(() => {
    if (currentPanelIndex < panels.length - 1) {
      changePanel(currentPanelIndex + 1, 'button');
    } else {
      if (onClickContinue) {
        onClickContinue(
          currentPanelIndex,
          (Date.now() - lastPanelStartTime.current) / 1000,
        );
      }
      onContinue(panels[currentPanelIndex].nextUrl);
    }
  }, [changePanel, panels, currentPanelIndex, onContinue, onClickContinue]);

  const handleBubbleClick = useCallback(
    (index: number) => {
      changePanel(index, 'bubble');
    },
    [changePanel],
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

  const capitalizeFirstLetter: (string: string) => string = (string: string) =>
    string.charAt(0).toUpperCase() + string.slice(1);

  const backgroundSuffix = capitalizeFirstLetter(background || 'dark');

  const previousPanel =
    panel.fadeInOverPrevious &&
    previousPanelIndex !== undefined &&
    panels[previousPanelIndex];

  const nextPanel =
    currentPanelIndex + 1 < panels.length && panels[currentPanelIndex + 1];

  const layoutClassMap: {
    [key in PanelLayout]: string;
  } = {
    'text-top-left': moduleStyles.textTopLeft,
    'text-top-center': moduleStyles.textTopCenter,
    'text-bottom-left': moduleStyles.textBottomLeft,
    'text-bottom-center': moduleStyles.textBottomCenter,
    'text-bottom-right': moduleStyles.textBottomRight,
    'text-top-right': moduleStyles.textTopRight,
  };

  const textLayoutClass = panel.layout
    ? layoutClassMap[panel.layout as PanelLayout]
    : moduleStyles.textTopRight;

  const buttonText =
    currentPanelIndex < panels.length - 1 ? 'Next' : 'Continue';

  const plainText = markdownToTxt(panel.text);

  const showTyping = !!panel.typing;

  // When typing, only show the button when the typing is done.
  const showButton = !showTyping || typingDone;

  return (
    <div
      id="panels-container"
      className={moduleStyles.panelsContainer}
      key={`${levelId || 'default'}-${currentPanelIndex}`}
      ref={containerRef}
    >
      <div className={moduleStyles.panel} style={size}>
        {previousPanel && (
          <div
            className={moduleStyles.image}
            style={{
              backgroundImage: `url("${previousPanel.imageUrl}")`,
            }}
          />
        )}
        <div
          className={classNames(moduleStyles.image, moduleStyles.imageCurrent)}
          style={{
            backgroundImage: `url("${panel.imageUrl}")`,
          }}
        />
        {nextPanel && (
          <div
            className={classNames(
              moduleStyles.image,
              moduleStyles.imageInvisible,
            )}
            style={{
              backgroundImage: `url("${nextPanel.imageUrl}")`,
            }}
          />
        )}
        {panel.text && (
          <div
            className={classNames(
              moduleStyles.text,
              panel.dark && moduleStyles.textDark,
              textLayoutClass,
            )}
          >
            {offerBrowserTts && <TextToSpeech text={panel.text} />}
            {showTyping ? (
              <div>
                <div className={moduleStyles.invisiblePlaceholder}>
                  {plainText}
                </div>
                <Typist
                  startDelay={750}
                  avgTypingDelay={35}
                  stdTypingDelay={15}
                  cursor={{show: false}}
                  onTypingDone={() => {
                    setTypingDone(true);
                  }}
                  className={moduleStyles.typist}
                >
                  {plainText}
                </Typist>
              </div>
            ) : (
              <Markdown content={panel.text} />
            )}
          </div>
        )}
      </div>
      <div
        className={moduleStyles.childrenArea}
        style={{width: size.width, height: childrenAreaHeight}}
      >
        {showButton && (
          <Button
            key={`button-${currentPanelIndex}`}
            id="panels-button"
            onClick={handleButtonClick}
            className={classNames(
              moduleStyles.button,
              showTyping ? moduleStyles.buttonReady : moduleStyles.buttonDelay,
            )}
            text={buttonText}
          />
        )}

        {panels.length > 1 && (
          <div id="panels-bubbles">
            {Array.from(Array(panels.length).keys()).map(index => {
              return (
                <Button
                  key={index}
                  className={classNames(
                    moduleStyles.bubble,
                    index === currentPanelIndex
                      ? moduleStyles[`bubbleCurrent${backgroundSuffix}`]
                      : moduleStyles[`bubbleNotCurrent${backgroundSuffix}`],
                  )}
                  size="xs"
                  title={''}
                  color={index === currentPanelIndex ? 'white' : 'gray'}
                  type="secondary"
                  isIconOnly
                  disabled={index === currentPanelIndex}
                  icon={{
                    iconName: 'circle',
                    iconStyle: 'solid',
                  }}
                  onClick={() => handleBubbleClick(index)}
                />
              );
            })}
          </div>
        )}
      </div>
      {onSkip && (
        <div className={moduleStyles.skipContainer}>
          <Button
            onClick={onSkip}
            icon={{
              iconName: 'arrow-right',
              iconStyle: 'solid',
            }}
            className={moduleStyles.buttonSkip}
            title="Skip to project"
          />
        </div>
      )}
    </div>
  );
};

export default PanelsView;
