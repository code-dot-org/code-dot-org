import React from 'react';

import AITutorTester from './ai-tutor/AITutorTester';
import StudentCodeDatasetMaker from './StudentCodeDatasetMaker';

import styles from './ai-tutor/ai-tutor-tester.module.scss';

interface AIIterationToolsProps {
  allowed: boolean;
}

const AIIterationTools: React.FC<AIIterationToolsProps> = ({allowed}) => {
  return (
    <div>
      <h1>AI Iteration Tools</h1>
      <p>
        A small suite of tools for developing and iterating on our AI products.
      </p>
      {!allowed && (
        <h3 className={styles.denied}>
          You need to be a Levelbuilder with AI Tutor Access to use these tools.
        </h3>
      )}
      {allowed && (
        <div>
          <StudentCodeDatasetMaker />
          <br />
          <hr />
          <br />
          <AITutorTester />
        </div>
      )}
    </div>
  );
};

export default AIIterationTools;
