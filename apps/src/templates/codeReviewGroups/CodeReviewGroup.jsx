import React from 'react';
import PropTypes from 'prop-types';
import {Droppable} from 'react-beautiful-dnd';
import CodeReviewGroupMember from './CodeReviewGroupMember';

export default function CodeReviewGroup({members, index}) {
  return (
    <Droppable key={index} droppableId={`${index}`}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          style={getListStyle(snapshot.isDraggingOver)}
          {...provided.droppableProps}
        >
          {members.map((member, index) => (
            <CodeReviewGroupMember member={member} index={index} />
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
}

// TO DO: specify shape of elements of array
CodeReviewGroup.propTypes = {
  members: PropTypes.array.isRequired,
  index: PropTypes.number.isRequired
};

const getListStyle = isDraggingOver => ({
  background: isDraggingOver ? 'lightblue' : 'lightgrey',
  padding: grid,
  margin: grid,
  width: 400,
  border: '1px solid'
});

export const grid = 8;
