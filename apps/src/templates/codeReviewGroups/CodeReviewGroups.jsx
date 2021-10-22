import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {DragDropContext} from 'react-beautiful-dnd';
import _ from 'lodash';
import CodeReviewGroup from './CodeReviewGroup';

const DROPPABLE_ID_PREFIX = 'groupId';

// Provides "drag and drop context" that allows us to drag
// code review group members between groups as teachers arrange their students into code review groups.
// More information on the package we're using here (React Beautiful DnD)
// can be found here:
// https://github.com/atlassian/react-beautiful-dnd
export default function CodeReviewGroups({initialGroups}) {
  const [groups, setGroups] = useState(
    initialGroups.map(group => addDroppableIdToGroup(group))
  );

  const getGroup = droppableId =>
    _.find(groups, group => group.droppableId === droppableId);

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

      const newGroups = [...groups];
      updateGroups(newGroups, result);
      setGroups(newGroups);
    } else {
      // If a member was dropped in a different group.
      const result = move(
        getGroup(sourceId),
        getGroup(destinationId),
        source.index,
        destination.index
      );

      const newGroups = [...groups];
      updateGroups(newGroups, result.updatedSource);
      updateGroups(newGroups, result.updatedDest);

      // Remove any blank groups
      setGroups(newGroups.filter(group => group.members.length));
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          setGroups([generateNewGroup(), ...groups]);
        }}
      >
        Add new group
      </button>
      <div style={styles.groupsContainer}>
        <DragDropContext onDragEnd={onDragEnd}>
          {groups.map((group, index) => {
            return <CodeReviewGroup key={group.droppableId} group={group} />;
          })}
        </DragDropContext>
      </div>
    </div>
  );
}

CodeReviewGroups.propTypes = {initialGroups: PropTypes.array.isRequired};

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

// Replaces one element in an existing list of groups
// with an updated version of the group (ie, with more, less, or reordered members).
const updateGroups = (existingGroups, newGroup) => {
  const updatedGroupIndex = existingGroups.findIndex(
    group => group.droppableId === newGroup.droppableId
  );
  existingGroups[updatedGroupIndex] = newGroup;
};

const addDroppableIdToGroup = group => {
  group.droppableId = `${DROPPABLE_ID_PREFIX}${group.id}`;
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
  groupsContainer: {
    display: 'flex',
    flexDirection: 'column'
  }
};
