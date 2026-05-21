import React from 'react';

import ReorderableCard from '../../curriculum-generator/components/ReorderableCard';
import {SlideSpec} from '../types';

import sharedStyles from '../../curriculum-generator/curriculum-generator.module.scss';
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
    <ReorderableCard
      title={
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
      }
      canMoveUp={index > 0}
      canMoveDown={index < total - 1}
      onMoveUp={() => onMove(spec.key, 'up')}
      onMoveDown={() => onMove(spec.key, 'down')}
      onRemove={() => onRemove(spec.key)}
      removeAriaLabel="Remove slide"
      removeTitle="Remove slide"
      disabled={disabled}
    >
      <div className={sharedStyles.cardBody}>
        <div className={sharedStyles.cardSidebar}>
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
        <div className={sharedStyles.cardMain}>
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
    </ReorderableCard>
  );
};

export default SlideCard;
