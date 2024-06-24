import React from 'react';

export const DefaultEmptyEditor = React.memo(() => {
  return (
    <div>No files are open. Choose a file from the browser to the left.</div>
  );
});

export const BlankEmptyEditor = React.memo(() => {
  return <div />;
});
