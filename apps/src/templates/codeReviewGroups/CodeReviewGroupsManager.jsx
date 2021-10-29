import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {DragDropContext} from 'react-beautiful-dnd';
import _ from 'lodash';
import color from '@cdo/apps/util/color';
import Button from '../Button';
import StudentGroup from './StudentGroup';

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

      // Remove any blank groups, but always keep around unassigned group.
      setGroups(
        updatedGroups.filter(
          group =>
            group.members.length ||
            group.droppableId === DROPPABLE_ID_UNASSIGNED
        )
      );
    }
  }

  return (
    <div>
      <DragDropContext onDragEnd={onDragEnd}>
        <div style={styles.dragAndDropContainer}>
          <div style={styles.unassignedStudentsPanel}>
            <div style={styles.header}>
              <span>Unassigned Students</span>
              <Button
                onClick={() => {}}
                icon={'times'}
                text={'Unassign All'}
                color={'gray'}
              />
            </div>
            <div style={styles.groupsContainer}>
              <StudentGroup
                droppableId={getUnassignedGroup().droppableId}
                members={getUnassignedGroup().members}
              />
            </div>
          </div>
          <div style={styles.groupsPanel}>
            <div style={styles.header}>
              <span>Groups</span>
              <Button
                onClick={() => {
                  setGroups([generateNewGroup(), ...groups]);
                }}
                icon={'plus'}
                text={'Create Group'}
                color={'gray'}
              />
            </div>
            <div style={styles.groupsContainer}>
              {getAssignedGroups().map(group => {
                return (
                  <StudentGroup
                    droppableId={group.droppableId}
                    members={group.members}
                    key={group.droppableId}
                  />
                );
              })}
            </div>
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
    flexDirection: 'column',
    height: 355,
    overflow: 'scroll',
    border: `1px solid ${color.lightest_gray}`
  },
  groupsPanel: {
    width: 500
  },
  unassignedStudentsPanel: {
    width: 400
  },
  header: {
    height: 54,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 5px',
    border: `1px solid ${color.lightest_gray}`,
    background: color.light_gray
  },
  groupsHeader: {
    justifyContent: 'flex-end'
  }
};
