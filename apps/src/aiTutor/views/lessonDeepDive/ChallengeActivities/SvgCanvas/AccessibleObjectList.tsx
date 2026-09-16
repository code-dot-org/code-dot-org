import React, {FC, KeyboardEvent, useRef} from 'react';

import {DrawingObjectRecord} from './types';

import styles from './svg-canvas.module.scss';

const KIND_LABELS: Record<DrawingObjectRecord['kind'], string> = {
  rectangle: 'Rectangle',
  circle: 'Circle',
  triangle: 'Triangle',
  text: 'Text',
  line: 'Line',
  path: 'Drawing',
  image: 'Image',
};

interface AccessibleObjectListProps {
  objects: DrawingObjectRecord[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

// Visually hidden list of all canvas objects. Screen reader users navigate it
// with arrow keys; selecting an item also selects the corresponding Fabric
// object on the canvas. Follows the ARIA listbox pattern.
const AccessibleObjectList: FC<AccessibleObjectListProps> = ({
  objects,
  selectedId,
  onSelect,
}) => {
  const listRef = useRef<HTMLUListElement>(null);

  const handleKeyDown = (e: KeyboardEvent<HTMLLIElement>, index: number) => {
    const items =
      listRef.current?.querySelectorAll<HTMLElement>('[role="option"]');
    if (!items) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      items[index + 1]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      items[index - 1]?.focus();
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(objects[index].id);
    }
  };

  if (objects.length === 0) return null;

  return (
    <ul
      ref={listRef}
      role="listbox"
      aria-label={`Canvas objects (${objects.length})`}
      className={styles.srOnly}
    >
      {objects.map((obj, index) => (
        <li
          key={obj.id}
          role="option"
          tabIndex={selectedId === obj.id ? 0 : -1}
          aria-selected={selectedId === obj.id}
          onFocus={() => onSelect(obj.id)}
          onKeyDown={e => handleKeyDown(e, index)}
        >
          {KIND_LABELS[obj.kind]}
          {obj.description ? `: ${obj.description}` : ', no description'}
        </li>
      ))}
    </ul>
  );
};

export default AccessibleObjectList;
