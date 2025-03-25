import Button from '@code-dot-org/component-library/button';
import React from 'react';

import styles from './summary.module.scss';

type FreeResponseAiSummaryBoxProps = {
  aiEvaluationHandler: () => void;
  disabled: boolean;
  isPending: boolean;
};

const FreeResponseAiSummaryBox: React.FC<FreeResponseAiSummaryBoxProps> = ({
  aiEvaluationHandler,
  disabled,
  isPending,
}) => {
  return (
    <div className={styles.aiSummaryContainer}>
      <div className={styles.leftSide}>
        {/* <img
          src="https://via.placeholder.com/150"
          alt="Placeholder"
          className={styles.image}
        /> */}
        <Button
          text="Evaluate student responses"
          onClick={aiEvaluationHandler}
          size={'s'}
          color={'gray'}
          disabled={disabled}
          type="secondary"
          isPending={isPending}
        />
      </div>
      <div className={styles.rightSide}>
        <p>
          This is a paragraph of text on the right-hand side. It will wrap and
          fill the available space. You can replace this text with whatever you
          need.
        </p>
      </div>
    </div>
  );
};

export default FreeResponseAiSummaryBox;
