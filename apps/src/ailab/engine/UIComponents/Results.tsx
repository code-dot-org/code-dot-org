import React from 'react';

import {RIGHT_PANEL_WIDTH} from '../constants';
import {useAppSelector} from '../hooks';
import {useProject} from '../ProjectContext';
import {getDisplayTree} from '../selectors/visualizationSelectors';
import {useTrainingData} from '../TrainingDataContext';

import DecisionTree from './DecisionTree';
import ResultsBar from './ResultsBar';
import type {SaveImageToBackpack} from './SaveTreeImageMenu';
import TestPanel from './TestPanel';

import styles from './results.module.scss';

interface ResultsProps {
  saveImageToBackpack?: SaveImageToBackpack;
}

const Results = ({saveImageToBackpack}: ResultsProps) => {
  const {project} = useProject();
  const {trainedModel} = useTrainingData();
  const hasTree = useAppSelector(
    state => !!getDisplayTree(state, project, trainedModel)
  );

  return (
    <div className={styles.container}>
      <div id="results" className={styles.results}>
        <ResultsBar />
        {hasTree ? (
          <DecisionTree
            overlay={<TestPanel />}
            saveImageToBackpack={saveImageToBackpack}
          />
        ) : (
          <div className={styles.emptyCanvas}>
            <div className={styles.overlay} style={{width: RIGHT_PANEL_WIDTH}}>
              <TestPanel />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Results;
