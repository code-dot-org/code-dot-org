import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {DragDropContext} from 'react-beautiful-dnd';
import CodeReviewGroup from './CodeReviewGroup';

export default function CodeReviewGroups({groups}) {
  const [state, setState] = useState(groups);

  function onDragEnd(result) {
    const {source, destination} = result;
    const sInd = +source.droppableId;

    // dropped outside the group
    if (!destination) {
      return;
    }

    const dInd = +destination.droppableId;

    if (sInd === dInd) {
      const items = reorder(state[sInd], source.index, destination.index);
      const newState = [...state];
      newState[sInd] = items;
      setState(newState);
    } else {
      const result = move(state[sInd], state[dInd], source, destination);
      const newState = [...state];
      newState[sInd] = result[sInd];
      newState[dInd] = result[dInd];

      setState(newState.filter(group => group.length));
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          setState([[], ...state]);
        }}
      >
        Add new group
      </button>
      <div style={styles.groupsContainer}>
        <DragDropContext onDragEnd={onDragEnd}>
          {state.map((groupMembers, groupIndex) => (
            <CodeReviewGroup
              key={groupIndex}
              members={groupMembers}
              index={groupIndex}
            />
          ))}
        </DragDropContext>
      </div>
    </div>
  );
}

CodeReviewGroups.propTypes = {groups: PropTypes.array.isRequired};

// Reorders items in a group if item dragged elsewhere in the same group.
const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

// Moves an item from one group to another group.
const move = (source, destination, droppableSource, droppableDestination) => {
  const sourceClone = Array.from(source);
  const destClone = Array.from(destination);
  const [removed] = sourceClone.splice(droppableSource.index, 1);

  destClone.splice(droppableDestination.index, 0, removed);

  const result = {};
  result[droppableSource.droppableId] = sourceClone;
  result[droppableDestination.droppableId] = destClone;

  return result;
};

const styles = {
  groupsContainer: {
    display: 'flex',
    flexDirection: 'column'
  }
};
