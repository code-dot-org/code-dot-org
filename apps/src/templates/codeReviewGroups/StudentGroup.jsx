import PropTypes from 'prop-types';
import React from 'react';
import {Droppable} from 'react-beautiful-dnd';

import Student from './Student';

import moduleStyles from './studentGroup.module.scss';

// A StudentGroup is a component that
// Students can be dragged between as teachers are arranging students
// in their sections into code review groups.
// These are called "Droppables" in the package we're using (React Beautiful DnD).
// More information on React Beautiful DnD can be found here:
// https://github.com/atlassian/react-beautiful-dnd
export default function StudentGroup({
  droppableId,
  members,
  dropAreaStyle,
  showEmptyGroupPlaceholder,
}) {
  // TO DO: add header with group name and trash icon to remove a group.
  // https://codedotorg.atlassian.net/browse/CSA-1027
  // This component is also used to render unassigned students (which don't need a header),
  // so header should be added conditionally or another component added to wrap this one.
  return (
    <Droppable key={droppableId} droppableId={droppableId}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          style={{...getListStyle(snapshot.isDraggingOver), ...dropAreaStyle}}
          {...provided.droppableProps}
        >
          {members && members.length > 0 ? (
            <div className={moduleStyles.studentList}>
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
          ) : (
            showEmptyGroupPlaceholder && (
              <div className={moduleStyles.emptyGroup} />
            )
          )}
        </div>
      )}
    </Droppable>
  );
}

// Each group needs a unique droppableId (rather than a database-provided group ID)
// so that we can create new groups on the fly without any interaction with our backend.
StudentGroup.propTypes = {
  droppableId: PropTypes.string.isRequired,
  members: PropTypes.array.isRequired,
  dropAreaStyle: PropTypes.object,
  showEmptyGroupPlaceholder: PropTypes.bool.isRequired,
};

const getListStyle = isDraggingOver => ({
  background: isDraggingOver
    ? 'var(--background-neutral-tertiary)'
    : 'var(--background-neutral-primary)',
});
