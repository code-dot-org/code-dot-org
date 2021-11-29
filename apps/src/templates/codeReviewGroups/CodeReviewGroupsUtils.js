export const DROPPABLE_ID_PREFIX = 'groupId';
export const DROPPABLE_ID_UNASSIGNED = 'unassigned';

export const getAssignedGroupDroppableId = id => DROPPABLE_ID_PREFIX + id;

// We need to generate a unique identifier for each group that is generated on the client
// before we save it -- use a timestamp for this unique identifier.
export const generateNewGroup = () => {
  return {
    droppableId: `${DROPPABLE_ID_PREFIX}${new Date().getTime()}`,
    name: '',
    members: []
  };
};
