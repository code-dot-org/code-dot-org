import {useState} from 'react';
import _ from 'lodash';

export function useGroups(initialGroups) {
  const [groups, setGroupsState] = useState(initialGroups);

  const getGroup = droppableId =>
    _.find(groups, group => group.droppableId === droppableId);

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

  // Used to decide what state update to make
  // after a drag action has completed.
  // The result object is something that is custom to React Beautiful DnD,
  // and contains information about what was dragged from where (source) to where (destination)
  function setGroups(result) {
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
      setGroupsState(updatedGroups);
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

      setGroupsState(updatedGroups);
    }
  }
  return [groups, getGroup, setGroups];
}

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
