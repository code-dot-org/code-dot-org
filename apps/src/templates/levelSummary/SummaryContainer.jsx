import PropTypes from 'prop-types';
import React, {useState} from 'react';
import {Provider} from 'react-redux';

import InstructorsOnly from '@cdo/apps/code-studio/components/InstructorsOnly';
import QuestionRenderer from '@cdo/apps/templates/levelSummary/QuestionRenderer';
import SubLevelDropdown from '@cdo/apps/templates/levelSummary/SubLevelDropdown';
import SummaryResponses from '@cdo/apps/templates/levelSummary/SummaryResponses';
import SummaryTeacherInstructions from '@cdo/apps/templates/levelSummary/SummaryTeacherInstructions';

import styles from './summary.module.scss';

const SummaryContainer = ({store, scriptData, isLevelGroup}) => {
  const [subLevelNum, setSubLevelNum] = useState(0);

  const updateSubLevel = event => {
    setSubLevelNum(Number(event.target.value));
  };

  return (
    <Provider store={store}>
      {isLevelGroup && (
        <div className={styles.subLevelDropdownContainer}>
          <SubLevelDropdown
            subLevels={scriptData.levels}
            handleChange={updateSubLevel}
          />
        </div>
      )}
      <QuestionRenderer viewingLevelData={scriptData.levels[subLevelNum]} />
      <InstructorsOnly>
        <div>
          <SummaryResponses scriptData={scriptData} levelNumber={subLevelNum} />
          <SummaryTeacherInstructions scriptData={scriptData} />
        </div>
      </InstructorsOnly>
    </Provider>
  );
};

SummaryContainer.propTypes = {
  store: PropTypes.object,
  scriptData: PropTypes.object,
  isLevelGroup: PropTypes.bool,
};

export default SummaryContainer;
