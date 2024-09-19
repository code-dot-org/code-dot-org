import PropTypes from 'prop-types';
import React, {useState, useEffect} from 'react';
import {Provider} from 'react-redux';

import InstructorsOnly from '@cdo/apps/code-studio/components/InstructorsOnly';
import SubLevelDropdown from '@cdo/apps/templates/levelSummary/SubLevelDropdown';
import SummaryResponses from '@cdo/apps/templates/levelSummary/SummaryResponses';
import SummaryTeacherInstructions from '@cdo/apps/templates/levelSummary/SummaryTeacherInstructions';

const SummaryContainer = ({store, scriptData, isLevelGroup}) => {
  const [updatedScriptData, setUpdatedScriptData] = useState({
    ...scriptData,
    responses: scriptData.responses[0],
  });
  const [subLevelNum, setSubLevelNum] = useState(0);

  useEffect(() => {
    const levelData = scriptData.levels[subLevelNum];
    const levelResponses = scriptData.responses[subLevelNum];

    setUpdatedScriptData({
      ...scriptData,
      viewing_level_data: levelData,
      responses: levelResponses,
    });
  }, [subLevelNum, scriptData]);

  const updateSubLevel = event => {
    setSubLevelNum(event.target.value);
  };

  return (
    <Provider store={store}>
      {isLevelGroup && (
        <SubLevelDropdown
          subLevels={scriptData.levels}
          handleChange={updateSubLevel}
        />
      )}
      <InstructorsOnly>
        <SummaryResponses scriptData={updatedScriptData} />
        <SummaryTeacherInstructions scriptData={updatedScriptData} />
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
