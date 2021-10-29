import React from 'react';
import PropTypes from 'prop-types';
import {Droppable} from 'react-beautiful-dnd';
import color from '@cdo/apps/util/color';
import Student from './Student';

// A CodeReviewGroup is a component that
// CodeReviewGroupMembers can be dragged between as teachers are arranging students
// in their sections into groups.
// These are called "Droppables" in the package we're using (React Beautiful DnD).
// More information on React Beautiful DnD can be found here:
// https://github.com/atlassian/react-beautiful-dnd
export default function StudentGroup({droppableId, members}) {
  return (
    <Droppable key={droppableId} droppableId={droppableId}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          style={getListStyle(snapshot.isDraggingOver)}
          {...provided.droppableProps}
        >
          {members.map((member, index) => (
            <Student
              followerId={member.followerId}
              name={member.name}
              index={index}
              key={member.followerId}
            />
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
}

// Each group needs a unique droppableId (rather than a database-provided group ID)
// so that we can create new groups on the fly without any interaction with our backend.
StudentGroup.propTypes = {
  droppableId: PropTypes.string.isRequired,
  members: PropTypes.array.isRequired
};

const getListStyle = isDraggingOver => ({
  background: isDraggingOver ? 'lightblue' : 'white',
  margin: grid,
  border: `1px solid ${color.lightest_gray}`
});

export const grid = 8;
