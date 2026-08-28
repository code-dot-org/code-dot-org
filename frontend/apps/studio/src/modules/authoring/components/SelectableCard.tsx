import classNames from 'classnames';
import type {ReactNode} from 'react';

import styles from './authoring.module.scss';

interface SelectableCardProps {
  authorMode: boolean;
  selected: boolean;
  onSelect: () => void;
  selectLabel: string;
  className?: string;
  children: ReactNode;
}

/**
 * Author Mode's browse-mode click target (Contentful model, REVISION 8/28):
 * in browse mode the card's own content is INERT (`pointer-events: none`)
 * and a full-region `<button>` overlay sits on top — clicking anywhere
 * selects the whole card, hovering outlines it. This replaces the earlier
 * per-region pencil button; the wrapping card (`className`) always renders,
 * in both audiences — only the inert wrapper and the overlay/outline are
 * author-mode-only, so the learner-facing render is untouched.
 */
export default function SelectableCard({
  authorMode,
  selected,
  onSelect,
  selectLabel,
  className,
  children,
}: SelectableCardProps) {
  return (
    <div
      className={classNames(
        className,
        authorMode && styles.selectableCardEditable,
        authorMode && selected && styles.selectableCardSelected,
      )}
    >
      <div className={authorMode ? styles.selectableCardInert : undefined}>
        {children}
      </div>
      {authorMode && (
        <button
          type="button"
          aria-label={selectLabel}
          aria-pressed={selected}
          className={styles.selectableCardOverlay}
          onClick={onSelect}
        />
      )}
    </div>
  );
}
