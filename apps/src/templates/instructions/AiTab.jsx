import React, {useEffect, useState} from 'react';
// import PropTypes from 'prop-types';
import {openaiCompletion} from '@cdo/apps/util/openai';

export const AiTab = props => {
  // const {
  //   teacherOnly,
  // } = props;

  const [result, setResult] = useState(null);

  useEffect(() => {
    const prompt =
      'in two sentences, tell my student they did great on their coding assigment.';
    openaiCompletion(prompt).then(setResult);
  }, []);

  return (
    <div>
      {!result && <div>loading...</div>}
      {result && <div>{result}</div>}
    </div>
  );
};
