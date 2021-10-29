import React from 'react';
import PropTypes from 'prop-types';
import {DragDropContext} from 'react-beautiful-dnd';
import {useGroups} from './codeReviewGroupManagerHooks';
import UnassignedStudentsPanel from './UnassignedStudentsPanel';
import AssignedStudentsPanel from './AssignedStudentsPanel';

const DROPPABLE_ID_PREFIX = 'groupId';
const DROPPABLE_ID_UNASSIGNED = 'unassigned';

// Provides "drag and drop context" that allows us to drag
// code review group members between groups as teachers arrange their students into code review groups.
// More information on the package we're using here (React Beautiful DnD)
// can be found here:
// https://github.com/atlassian/react-beautiful-dnd
export default function CodeReviewGroupsManager({initialGroups}) {
  const [groups, getGroup, setGroups] = useGroups(
    initialGroups.map(group => addDroppableIdToGroup(group))
  );

  const getUnassignedGroup = () => getGroup(DROPPABLE_ID_UNASSIGNED);
  const getAssignedGroups = () =>
    groups.filter(group => group.droppableId !== DROPPABLE_ID_UNASSIGNED);

  // Creating groups no longer works (b/c we want to set groups here...)
  return (
    <DragDropContext onDragEnd={setGroups}>
      <div style={styles.dragAndDropContainer}>
        <UnassignedStudentsPanel unassignedGroup={getUnassignedGroup()} />
        <AssignedStudentsPanel
          groups={getAssignedGroups()}
          onCreateGroupClick={() => {
            setGroups([generateNewGroup(), ...groups]);
          }}
        />
      </div>
    </DragDropContext>
  );
}

CodeReviewGroupsManager.propTypes = {
  initialGroups: PropTypes.array.isRequired
};

const addDroppableIdToGroup = group => {
  if (group.unassigned) {
    group.droppableId = DROPPABLE_ID_UNASSIGNED;
  } else {
    group.droppableId = `${DROPPABLE_ID_PREFIX}${group.id}`;
  }
  return group;
};

// TO DO: present a modal that allows a user to select a group name before creating it.
// We need to generate a unique identifier for each group that is generated on the client
// before we save it -- use a timestamp for this unique identifier.
const generateNewGroup = () => {
  return {
    droppableId: `${DROPPABLE_ID_PREFIX}${new Date().getTime()}`,
    members: []
  };
};

const styles = {
  dragAndDropContainer: {
    display: 'flex'
  }
};
