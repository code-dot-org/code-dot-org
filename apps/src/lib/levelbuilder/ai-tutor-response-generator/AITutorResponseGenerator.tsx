import React from 'react';

/**
 * Renders 
 */

const AITutorResponseGenerator: React.FC = () => {
  return (
    <div>
      AI Response Generator goes here. 
      Upload CSV 
      Sanity check for the right columns 
      Format message to send, system prompt + student input 
      Send message to AI Tutor 
      Get the AI Tutor's response, add it to the correct column 
      Once the columns are all filled, write to the csv 
      Download the csv 

      Nice to have: 
        some indication of how far through the process we are
        AI model selection, indication of some kind
    </div>
  );
};

export default AITutorResponseGenerator;
