import React from 'react';
import PropTypes from 'prop-types';
import {Draggable} from 'react-beautiful-dnd';
import color from '@cdo/apps/util/color';
import {grid} from './StudentGroup';

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
          {...provided.dragHandleProps}
          style={getStudentStyle(
            snapshot.isDragging,
            provided.draggableProps.style
          )}
        >
          <div
            style={{
              display: 'flex'
            }}
          >
            {name}
          </div>
        </div>
      )}
    </Draggable>
  );
}

Student.propTypes = {
  followerId: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired
};

const getStudentStyle = (isDragging, draggableStyle) => ({
  userSelect: 'none',
  padding: grid * 2,
  color: color.dark_charcoal,
  width: 'auto',
  height: '20px',
  border: `1px solid ${color.lighter_gray}`,

  // change background colour if dragging
  background: isDragging ? 'navy' : 'white',

  // styles we need to apply on draggables
  ...draggableStyle
});
