import React, {useCallback, useEffect, useMemo, useState} from 'react';
import styles from './panels.module.scss';
import EnhancedSafeMarkdown from '../templates/EnhancedSafeMarkdown';
import classNames from 'classnames';
import {commonI18n} from '../types/locale';
import FontAwesome from '../templates/FontAwesome';
import {Panel} from './types';

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
  targetWidth: number;
  targetHeight: number;
  resetOnChange?: boolean;
}

/**
 * View that renders a set of panels with an image and text. Used in the Lab2 panels level type.
 */
const PanelsView: React.FunctionComponent<PanelsProps> = ({
  panels,
  onContinue,
  targetWidth,
  targetHeight,
  resetOnChange = true,
}) => {
  const [currentPanel, setCurrentPanel] = useState(0);

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

  const handleButtonClick = useCallback(() => {
    if (currentPanel < panels.length - 1) {
      setCurrentPanel(currentPanel + 1);
    } else {
      onContinue(panels[currentPanel].nextUrl);
    }
  }, [panels, currentPanel, onContinue]);

  const handleBubbleClick = (index: number) => {
    setCurrentPanel(index);
  };

  // Reset to first panel whenever panels content changes if specified.
  useEffect(() => {
    if (resetOnChange) {
      setCurrentPanel(0);
    }
    // Reset to last panel if number of panels has reduced
    if (currentPanel >= panels.length) {
      setCurrentPanel(panels.length - 1);
    }
  }, [panels, resetOnChange, currentPanel]);

  const panel = panels[currentPanel];
  if (!panel) {
    return null;
  }

  const showSmallText = height < 300;
  const textLayoutClass =
    panel.layout === 'text-bottom-left'
      ? styles.markdownTextBottomLeft
      : styles.markdownTextTopRight;

  return (
    <div
      id="panels-container"
      className={styles.panelsContainer}
      key={currentPanel}
    >
      <div className={styles.panel} style={{width, height}}>
        <div
          className={styles.image}
          style={{
            backgroundImage: `url("${panel.imageUrl}")`,
          }}
        />
        <EnhancedSafeMarkdown
          markdown={panel.text}
          className={classNames(
            styles.markdownText,
            showSmallText && styles.markdownTextSmall,
            textLayoutClass
          )}
        />
      </div>
      <div
        className={styles.childrenArea}
        style={{width: width, height: childrenAreaHeight}}
      >
        <button
          id="panels-button"
          type="button"
          onClick={handleButtonClick}
          className={styles.button}
        >
          {currentPanel < panels.length - 1
            ? commonI18n.next()
            : commonI18n.continue()}
        </button>
        {panels.length > 1 && (
          <div id="panels-bubbles">
            {Array.from(Array(panels.length).keys()).map(index => {
              return (
                <FontAwesome
                  key={index}
                  className={classNames(
                    'icon',
                    styles.bubble,
                    index === currentPanel
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
    </div>
  );
};

export default PanelsView;
