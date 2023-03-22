import React, {useEffect, useState} from 'react';
// import PropTypes from 'prop-types';
import {openaiCompletion} from '@cdo/apps/util/openai';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';

export const AiTab = props => {
  // const {
  //   teacherOnly,
  // } = props;

  const [result, setResult] = useState(null);

  const currentCode = window.currentCode;

  useEffect(() => {
    const prompt = `Please evaluate and briefly summarize whether each of the
    following statements are true or false with respect to the code for my
    program which follows. Please give your response formatted as a markdown
    table with the following columns: "Statement", "True/False", and "Reason". 
    please use backticks to escape any code in your reason.

    statements:
    
    ${exampleStatements}
    
    code:
    
    ${currentCode}`;

    openaiCompletion(prompt).then(setResult);
  }, [currentCode]);

  return (
    <div>
      {!result && <div>loading...</div>}
      {result && (
        <div>
          <SafeMarkdown markdown={result} />
        </div>
      )}
    </div>
  );
};

const exampleStatements = `
1. You used multiple sprites
2. Your program uses at least one random number
3. Your program uses multiple conditionals inside the draw loop 
4. At least one variable or property uses the counter pattern
`;
