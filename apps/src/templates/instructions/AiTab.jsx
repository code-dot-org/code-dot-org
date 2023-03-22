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
    following statements are true or false with respect to the javascript code for my
    program which follows. Please give your response formatted as a markdown
    table with the following columns: "Statement", "True/False", and "Reason". 
    please use backticks to escape any code in your reason. the statement column
    should contain the entire original statement. please be sure to ignore any
    commented-out code when deciding what the program does or does not do.

    statements:
    
    ${exampleStatements}
    
    code:
    
    ${currentCode}`;

    console.log(prompt);

    openaiCompletion(prompt).then(setResult);
  }, [currentCode]);

  return (
    <div>
      {!result && <div>loading...</div>}
      {result && (
        <div className="ai-tab">
          <SafeMarkdown markdown={result} />
        </div>
      )}
    </div>
  );
};

const exampleStatements = `
1. You used multiple sprites
2. Your program uses at least one random number to set the value of a property on a sprite or other object.
3. Your program uses multiple conditionals inside the draw loop 
4. At least one variable or property uses the counter pattern
`;
