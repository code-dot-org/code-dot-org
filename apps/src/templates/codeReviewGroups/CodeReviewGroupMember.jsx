import React from 'react';
import PropTypes from 'prop-types';
import {Draggable} from 'react-beautiful-dnd';
import {grid} from './CodeReviewGroup';

export default function CodeReviewGroupMember({member, index}) {
  return (
    <Draggable
      key={member.id}
      draggableId={member.id}
      index={index}
      tab-index={index}
    >
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={getItemStyle(
            snapshot.isDragging,
            provided.draggableProps.style
          )}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-around'
            }}
          >
            {member.content}
          </div>
        </div>
      )}
    </Draggable>
  );
}

// TO DO: should specify shape of member -- needs ID and content property that can be rendered.
CodeReviewGroupMember.propTypes = {
  member: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired
};

const getItemStyle = (isDragging, draggableStyle) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: 'none',
  padding: grid * 2,
  margin: grid,
  borderRadius: '30px',
  color: 'white',
  width: 'auto',
  height: '20px',

  // change background colour if dragging
  background: isDragging ? 'navy' : '#0094CA',

  // styles we need to apply on draggables
  ...draggableStyle
});
