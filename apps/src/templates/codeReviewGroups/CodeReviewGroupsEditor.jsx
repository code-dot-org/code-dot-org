import React, {useState} from 'react';
import {DragDropContext, Droppable, Draggable} from 'react-beautiful-dnd';

const names = [
  'Sanchit',
  'Mike',
  'Mark',
  'Molly',
  'Ben',
  'Jessie',
  'Jamila',
  'Hannah'
];
// fake data generator
const getItems = (count, offset = 0) =>
  Array.from({length: count}, (v, k) => k).map(k => ({
    id: `item-${names[k + offset]}-${new Date().getTime()}`,
    content: names[k + offset]
  }));

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

/**
 * Moves an item from one list to another list.
 */
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
const grid = 8;

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
const getListStyle = isDraggingOver => ({
  background: isDraggingOver ? 'lightblue' : 'lightgrey',
  padding: grid,
  margin: grid,
  width: 400,
  border: '1px solid'
});

function CodeReviewGroupsEditor() {
  const [state, setState] = useState([getItems(4), getItems(4, 4)]);

  function onDragEnd(result) {
    console.log(result);
    console.log(
      `[ON DRAG END] Moved item ${result.draggableId} from container ${
        result.source.droppableId
      } to ${result.destination ? result.destination.droppableId : 'outside'}`
    );
    const {source, destination} = result;
    const sInd = +source.droppableId;

    // dropped outside the list
    if (!destination) {
      // const newState = [...state];
      // const items = reorder(state[sInd], source.index, newState[sInd].length - 1);
      // newState[sInd] = items;
      // setState(newState);
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
      <p>
        Try using a keyboard! Press tab / shift+tab to navigate items, spacebar
        to pick up / drop, and arrow keys to move.
      </p>
      <button
        type="button"
        onClick={() => {
          setState([...state, []]);
        }}
      >
        Add new group
      </button>
      <button
        type="button"
        onClick={() => {
          setState([...state, getItems(1)]);
        }}
      >
        Add new item
      </button>
      <div style={{display: 'flex'}}>
        <DragDropContext onDragEnd={onDragEnd}>
          {state.map((el, ind) => (
            <Droppable key={ind} droppableId={`${ind}`}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  style={getListStyle(snapshot.isDraggingOver)}
                  {...provided.droppableProps}
                >
                  {el.map((item, index) => (
                    <Draggable
                      key={item.id}
                      draggableId={item.id}
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
                            {item.content}
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </DragDropContext>
      </div>
    </div>
  );
}

export default CodeReviewGroupsEditor;
