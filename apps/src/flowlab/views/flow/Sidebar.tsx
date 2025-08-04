import React from 'react';

import {useDnD} from './DnDContext';

export default () => {
  const [, setType] = useDnD();

  const onDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    nodeType: string
  ) => {
    if (setType) {
      setType(nodeType);
    }
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
    }
  };

  return (
    <aside>
      <div
        className="dndnode"
        onDragStart={event => onDragStart(event, 'text')}
        draggable
      >
        Text
      </div>
      <div
        className="dndnode"
        onDragStart={event => onDragStart(event, 'ai')}
        draggable
      >
        AI
      </div>
      <div
        className="condition"
        onDragStart={event => onDragStart(event, 'condition')}
        draggable
      >
        Condition
      </div>
      <div
        className="dndnode"
        onDragStart={event => onDragStart(event, 'web')}
        draggable
      >
        Web
      </div>
      <div
        className="dndnode"
        onDragStart={event => onDragStart(event, 'result')}
        draggable
      >
        Result
      </div>
    </aside>
  );
};
