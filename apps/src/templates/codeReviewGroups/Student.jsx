import PropTypes from 'prop-types';
import React from 'react';
import {Draggable} from 'react-beautiful-dnd';

import moduleStyles from './student.module.scss';

// A Student is a component that
// can be dragged between StudentGroups
// as teachers arrange students in their section into code review groups.
// These are called "Draggables" in the package we're using (React Beautiful DnD).
// More information on React Beautiful DnD can be found here:
// https://github.com/atlassian/react-beautiful-dnd
export default function Student({followerId, name, index}) {
  // TO DO: style and add drag handle.
  // https://codedotorg.atlassian.net/browse/CSA-1029
  return (
    <Draggable
      key={followerId}
      draggableId={followerId.toString()}
      index={index}
      tab-index={index}
    >
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={moduleStyles.studentRow}
          style={{
            ...provided.draggableProps.style,
            background: snapshot.isDragging
              ? 'var(--background-neutral-secondary)'
              : 'var(--background-neutral-primary)',
          }}
        >
          <div className={moduleStyles.studentRowInner}>
            <DragHandle {...provided.dragHandleProps} />
            <div>{name}</div>
          </div>
        </div>
      )}
    </Draggable>
  );
}

Student.propTypes = {
  followerId: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
};

/**
 * Custom drag handle icon: six dots in two columns
 */
function DragHandle(props) {
  return (
    <div {...props} className={moduleStyles.dragHandle}>
      <div className={moduleStyles.dotColumn}>
        <span className={moduleStyles.dot} />
        <span className={moduleStyles.dot} />
        <span className={moduleStyles.dot} />
      </div>
      <div className={moduleStyles.dotColumn}>
        <span className={moduleStyles.dot} />
        <span className={moduleStyles.dot} />
        <span className={moduleStyles.dot} />
      </div>
    </div>
  );
}
