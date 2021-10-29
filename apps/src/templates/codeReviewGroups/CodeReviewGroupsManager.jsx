import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {DragDropContext} from 'react-beautiful-dnd';
import _ from 'lodash';
import CodeReviewGroup from './CodeReviewGroup';

const DROPPABLE_ID_PREFIX = 'groupId';
const DROPPABLE_ID_UNASSIGNED = 'unassigned';

// Provides "drag and drop context" that allows us to drag
// code review group members between groups as teachers arrange their students into code review groups.
// More information on the package we're using here (React Beautiful DnD)
// can be found here:
// https://github.com/atlassian/react-beautiful-dnd
export default function CodeReviewGroupsManager({initialGroups}) {
  const [groups, setGroups] = useState(
    initialGroups.map(group => addDroppableIdToGroup(group))
  );

  const getGroup = droppableId =>
    _.find(groups, group => group.droppableId === droppableId);
  const getUnassignedGroup = () => getGroup(DROPPABLE_ID_UNASSIGNED);
  const getAssignedGroups = () =>
    groups.filter(group => group.droppableId !== DROPPABLE_ID_UNASSIGNED);

  function onDragEnd(result) {
    const {source, destination} = result;
    const sourceId = source.droppableId;

    // dropped outside the group
    if (!destination) {
      return;
    }

    const destinationId = destination.droppableId;

    if (sourceId === destinationId) {
      // If a member was dropped in its current group.
      const result = reorder(
        getGroup(sourceId),
        source.index,
        destination.index
      );

      const updatedGroups = updateGroups(groups, [result]);
      setGroups(updatedGroups);
    } else {
      // If a member was dropped in a different group.
      const result = move(
        getGroup(sourceId),
        getGroup(destinationId),
        source.index,
        destination.index
      );

      const updatedGroups = updateGroups(groups, [
        result.updatedSource,
        result.updatedDest
      ]);

      setGroups(updatedGroups);
    }
  }

  return (
    <div>
      <DragDropContext onDragEnd={onDragEnd}>
        <div style={styles.dragAndDropContainer}>
          <CodeReviewGroup
            droppableId={getUnassignedGroup().droppableId}
            members={getUnassignedGroup().members}
          />
          <div style={styles.groupsContainer}>
            {/* TO DO: https://codedotorg.atlassian.net/browse/CSA-1033
            use proper Button component, style, and translate string here */}
            <button
              type="button"
              onClick={() => {
                setGroups([generateNewGroup(), ...groups]);
              }}
            >
              Add new group
            </button>
            {getAssignedGroups().map(group => {
              return (
                <CodeReviewGroup
                  droppableId={group.droppableId}
                  members={group.members}
                  key={group.droppableId}
                />
              );
            })}
          </div>
        </div>
      </DragDropContext>
    </div>
  );
}

CodeReviewGroupsManager.propTypes = {
  initialGroups: PropTypes.array.isRequired
};

// Reorders members in a group if member dragged elsewhere in the same group.
// Returns a copied, updated group.
const reorder = (group, startIndex, endIndex) => {
  const result = {...group};
  const [removed] = result.members.splice(startIndex, 1);
  result.members.splice(endIndex, 0, removed);

  return result;
};

// Moves an member from one group to another group.
// Returns copies of both updated groups.
const move = (
  source,
  destination,
  droppableSourceIndex,
  droppableDestinationIndex
) => {
  const updatedSource = {...source};
  const updatedDest = {...destination};
  const [removed] = updatedSource.members.splice(droppableSourceIndex, 1);

  updatedDest.members.splice(droppableDestinationIndex, 0, removed);

  return {updatedSource, updatedDest};
};

// Returns a copied list of groups
// with updated versions of the provided changedGroups (ie, with more, less, or reordered members).
const updateGroups = (groups, changedGroups) => {
  const updatedGroups = [...groups];

  changedGroups.forEach(changedGroup => {
    const updatedGroupIndex = updatedGroups.findIndex(
      group => group.droppableId === changedGroup.droppableId
    );
    updatedGroups[updatedGroupIndex] = changedGroup;
  });

  return updatedGroups;
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
  },
  groupsContainer: {
    display: 'flex',
    flexDirection: 'column'
  }
};
