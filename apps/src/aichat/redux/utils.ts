import moment from 'moment';

// This variable keeps track of the most recent remove event ID so that we can
// assign a unique remove event ID in increasing sequence to a new event.
// This ID is specifically used to look up and remove events from the chat workspace
// (e.g. model updates and notification events).
let latestRemoveId = 0;
export const getNewRemoveId = () => {
  latestRemoveId += 1;
  return latestRemoveId;
};

export const timestampToDateTime = (timestamp: number) =>
  moment(timestamp).format('YYYY-MM-DD HH:mm');
export const timestampToLocalTime = (timestamp: number) =>
  moment(timestamp).format('LT');
