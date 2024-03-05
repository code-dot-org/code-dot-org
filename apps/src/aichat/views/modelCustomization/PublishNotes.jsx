import React from 'react';

const PublishNotes = () => {
  return (
    <>
      <label htmlFor="intended-uses">Intended Uses</label>
      <textarea
        id="intended-uses"
        style={{width: 'calc(100% - 20px)', resize: 'vertical'}}
      />
      <label htmlFor="limitations-and-warnings">Limitations and Warnings</label>
      <textarea
        id="limitations-and-warnings"
        style={{width: 'calc(100% - 20px)', resize: 'vertical'}}
      />
      <label htmlFor="testing-and-evaluation">Testing and Evaluation</label>
      <textarea
        id="testing-and-evaluation"
        style={{width: 'calc(100% - 20px)', resize: 'vertical'}}
      />
    </>
  );
};

export default PublishNotes;
