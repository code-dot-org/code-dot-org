import React from 'react';

const PublishNotes = () => {
  return (
    <>
      <label htmlFor="intended-uses">Intended Uses</label>
      <textarea id="intended-uses" />
      <label htmlFor="limitations-and-warnings">Limitations and Warnings</label>
      <textarea id="limitations-and-warnings" />
      <label htmlFor="testing-and-evaluation">Testing and Evaluation</label>
      <textarea id="testing-and-evaluation" />
    </>
  );
};

export default PublishNotes;
