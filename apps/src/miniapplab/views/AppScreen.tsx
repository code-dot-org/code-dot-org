import classNames from 'classnames';
import React, {useCallback, useRef} from 'react';

import {
  AppDesign,
  AppElement,
  ElementValues,
  screenHeight,
  screenWidth,
} from '../types';

import moduleStyles from './app-screen.module.scss';

export type ScreenMode = 'design' | 'preview' | 'run';

interface AppScreenProps {
  design: AppDesign;
  /** What the elements show; the design's own text when not running. */
  values: ElementValues;
  mode: ScreenMode;
  selectedId?: string;
  onSelect?: (id: string | undefined) => void;
  onMove?: (id: string, x: number, y: number) => void;
  onInput?: (id: string, text: string) => void;
  onPress?: (id: string) => void;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

/**
 * The phone-sized screen the app lives on.  In design mode elements can be
 * selected and dragged; while running they work like real controls.
 */
const AppScreen: React.FunctionComponent<AppScreenProps> = ({
  design,
  values,
  mode,
  selectedId,
  onSelect,
  onMove,
  onInput,
  onPress,
}) => {
  const dragRef = useRef<{id: string; dx: number; dy: number}>();
  const isDesign = mode === 'design';
  const isRun = mode === 'run';

  const onPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>, element: AppElement) => {
      if (!isDesign) {
        return;
      }
      event.stopPropagation();
      onSelect?.(element.id);
      const target = event.currentTarget;
      target.setPointerCapture(event.pointerId);
      dragRef.current = {
        id: element.id,
        dx: event.clientX - element.x,
        dy: event.clientY - element.y,
      };
    },
    [isDesign, onSelect]
  );

  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>, element: AppElement) => {
      const drag = dragRef.current;
      if (!drag || drag.id !== element.id) {
        return;
      }
      onMove?.(
        element.id,
        Math.round(
          clamp(event.clientX - drag.dx, 0, screenWidth - element.width)
        ),
        Math.round(
          clamp(event.clientY - drag.dy, 0, screenHeight - element.height)
        )
      );
    },
    [onMove]
  );

  const onPointerUp = useCallback(() => {
    dragRef.current = undefined;
  }, []);

  const renderContent = (element: AppElement) => {
    const value = values[element.id] ?? '';
    switch (element.type) {
      case 'label':
        return <div className={moduleStyles.label}>{value}</div>;
      case 'input':
        return (
          <input
            type="text"
            className={moduleStyles.input}
            placeholder={element.text}
            value={isRun ? value : ''}
            readOnly={!isRun}
            tabIndex={isRun ? 0 : -1}
            onChange={event => onInput?.(element.id, event.target.value)}
          />
        );
      case 'button':
        return (
          <button
            type="button"
            className={moduleStyles.button}
            tabIndex={isRun ? 0 : -1}
            onClick={() => isRun && onPress?.(element.id)}
          >
            {value}
          </button>
        );
      case 'output':
        return <div className={moduleStyles.output}>{value}</div>;
    }
  };

  return (
    <div
      className={classNames(moduleStyles.screen, moduleStyles[mode])}
      style={{width: screenWidth, height: screenHeight}}
      onPointerDown={() => isDesign && onSelect?.(undefined)}
    >
      {design.map(element => (
        <div
          key={element.id}
          className={classNames(
            moduleStyles.element,
            element.id === selectedId && isDesign && moduleStyles.selected
          )}
          style={{
            left: element.x,
            top: element.y,
            width: element.width,
            height: element.height,
          }}
          title={isDesign ? element.id : undefined}
          onPointerDown={event => onPointerDown(event, element)}
          onPointerMove={event => onPointerMove(event, element)}
          onPointerUp={onPointerUp}
        >
          {renderContent(element)}
        </div>
      ))}
    </div>
  );
};

export default AppScreen;
