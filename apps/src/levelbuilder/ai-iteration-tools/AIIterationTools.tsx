import React from 'react';

import AITutorTester from './ai-tutor/AITutorTester';
import FreeResponseDatasetMaker from './FreeResponseDatasetMaker';
import StudentCodeDatasetMaker from './StudentCodeDatasetMaker';

import styles from './ai-tutor/ai-tutor-tester.module.scss';

interface AIIterationToolsProps {
  aiTutorAccess: boolean;
  studentWorkAccess: boolean;
}

const AIIterationTools: React.FC<AIIterationToolsProps> = ({
  aiTutorAccess,
  studentWorkAccess,
}) => {
  const allowed = aiTutorAccess || studentWorkAccess;
  return (
    <div>
      <h1>AI Iteration Tools</h1>
      <p>
        A small suite of tools for developing and iterating on our AI products.
      </p>
      {!allowed && (
        <h3 className={styles.denied}>
          You don't have the permissions needed to use these tools.
        </h3>
      )}
      <div>
        {studentWorkAccess && (
          <div>
            <StudentCodeDatasetMaker />
            <br />
            <hr />
            <br />
            <FreeResponseDatasetMaker />
          </div>
        )}
        <hr />
        <br />
        {aiTutorAccess && <AITutorTester />}
      </div>
    </div>
  );
};

export default AIIterationTools;
