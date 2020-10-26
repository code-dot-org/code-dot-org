export const generateEventHandler = (id, eventType) => {
  return `onEvent("${id}", "${eventType}", function( ) {\n\n});`;
};
