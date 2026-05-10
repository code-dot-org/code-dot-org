import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import React from 'react';

import {SlideSpec} from '../types';

import moduleStyles from '../lesson-slides-generator.module.scss';

interface SlideCardProps {
  spec: SlideSpec;
  index: number;
  total: number;
  disabled: boolean;
  onChange: (key: string, patch: Partial<SlideSpec>) => void;
  onRemove: (key: string) => void;
  onMove: (key: string, direction: 'up' | 'down') => void;
}

const SlideCard: React.FC<SlideCardProps> = ({
  spec,
  index,
  total,
  disabled,
  onChange,
  onRemove,
  onMove,
}) => {
  const hasPanel = !!spec.panel;
  return (
    <div className={moduleStyles.slideCard}>
      <div className={moduleStyles.slideCardHeader}>
        <h3>
          Slide {index + 1}
          {hasPanel && (
            <span
              className={moduleStyles.tagPanel}
              title="A panel has already been generated for this slide"
            >
              ready
            </span>
          )}
        </h3>
        <button
          type="button"
          className={moduleStyles.iconButton}
          onClick={() => onMove(spec.key, 'up')}
          disabled={disabled || index === 0}
          aria-label="Move up"
          title="Move up"
        >
          <FontAwesomeV6Icon iconName="arrow-up" />
        </button>
        <button
          type="button"
          className={moduleStyles.iconButton}
          onClick={() => onMove(spec.key, 'down')}
          disabled={disabled || index === total - 1}
          aria-label="Move down"
          title="Move down"
        >
          <FontAwesomeV6Icon iconName="arrow-down" />
        </button>
        <button
          type="button"
          className={moduleStyles.deleteButton}
          onClick={() => onRemove(spec.key)}
          disabled={disabled}
          aria-label="Remove slide"
          title="Remove slide"
        >
          <FontAwesomeV6Icon iconName="trash" />
        </button>
      </div>
      <div className={moduleStyles.cardBody}>
        <div className={moduleStyles.cardSidebar}>
          <label className={moduleStyles.skipLabel}>
            <input
              type="checkbox"
              checked={spec.generate}
              onChange={e => onChange(spec.key, {generate: e.target.checked})}
              disabled={disabled}
            />
            Generate
          </label>
          {hasPanel && spec.panel?.imageUrl && (
            <img
              src={spec.panel.imageUrl}
              alt=""
              className={moduleStyles.thumb}
            />
          )}
        </div>
        <div className={moduleStyles.cardMain}>
          <label htmlFor={`desc-${spec.key}`}>Description</label>
          <textarea
            id={`desc-${spec.key}`}
            value={spec.description}
            onChange={e => onChange(spec.key, {description: e.target.value})}
            placeholder="What this slide should show — topic, mood, what concept it sets up. The AI will turn this into a single panel (one image + short overlay text)."
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
};

export default SlideCard;
