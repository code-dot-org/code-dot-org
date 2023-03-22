import React, {useEffect, useState} from 'react';
// import PropTypes from 'prop-types';
import {openaiCompletion} from '@cdo/apps/util/openai';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';

export const AiTab = props => {
  // const {
  //   teacherOnly,
  // } = props;

  const [result, setResult] = useState(null);

  useEffect(() => {
    const prompt =
      'give me a markdown table showing whether each number 1 through 10 is odd or even';
    openaiCompletion(prompt).then(setResult);
  }, []);

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
