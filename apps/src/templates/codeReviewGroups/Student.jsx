import PropTypes from 'prop-types';
import React from 'react';
import {Draggable} from 'react-beautiful-dnd';

import color from '@cdo/apps/util/color';

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
          style={getStudentStyle(
            snapshot.isDragging,
            provided.draggableProps.style
          )}
        >
          <div
            style={{
              display: 'flex',
            }}
          >
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
    <div {...props} style={handleStyles.container}>
      <div style={handleStyles.dotColumn}>
        <span style={handleStyles.dot} />
        <span style={handleStyles.dot} />
        <span style={handleStyles.dot} />
      </div>
      <div style={handleStyles.dotColumn}>
        <span style={handleStyles.dot} />
        <span style={handleStyles.dot} />
        <span style={handleStyles.dot} />
      </div>
    </div>
  );
}

const getStudentStyle = (isDragging, draggableStyle) => ({
  userSelect: 'none',
  padding: '16px 12px',
  color: color.dark_charcoal,
  width: 'auto',
  border: `1px solid ${color.lighter_gray}`,
  fontSize: 14,
  lineHeight: '21px',

  // change background colour if dragging
  background: isDragging ? color.background_gray : color.white,

  // styles we need to apply on draggables
  ...draggableStyle,
});

const handleStyles = {
  container: {
    marginRight: 12,
    display: 'flex',
    alignItems: 'center',
  },
  dotColumn: {
    display: 'flex',
    flexDirection: 'column',
  },
  dot: {
    width: 3,
    height: 3,
    backgroundColor: color.dark_charcoal,
    borderRadius: '50%',
    display: 'inline-block',
    margin: 1.5,
  },
};
