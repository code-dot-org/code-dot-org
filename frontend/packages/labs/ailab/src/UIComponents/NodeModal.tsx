import {Button, Typography} from '@mui/material';
import {useId, useState} from 'react';

import {MuiCustomDialog} from '@code-dot-org/component-library/dialog';
import Tabs from '@code-dot-org/component-library/tabs';

import {getDisplayTreePath, type DisplayTreeNode} from '../helpers/displayTree';
import {displayNodeLabel} from '../helpers/displayTreeNodeContent';
import {useAppSelector} from '../hooks';
import {useProject} from '../ProjectContext';
import {getDisplayTreeRows} from '../selectors/visualizationSelectors';
import {useTrainingData} from '../TrainingDataContext';

import AccuracyCheckRowsPanel from './AccuracyCheckRowsPanel';
import NodePath from './NodePath';
import RowsPanel from './RowsPanel';

import appStyles from '../app.module.scss';
import styles from './nodeModal.module.scss';

interface NodeModalProps {
  tree: DisplayTreeNode;
  nodeId: string;
  onClose: () => void;
}

const NodeModal = ({tree, nodeId, onClose}: NodeModalProps) => {
  const titleId = useId();
  const {project} = useProject();
  const {trainedModel} = useTrainingData();
  const datasetId = useAppSelector(state => state.metadata?.name || 'unknown');
  const rows = useAppSelector(state =>
    getDisplayTreeRows(state, project, trainedModel),
  )(nodeId);
  const [showAllColumns, setShowAllColumns] = useState(false);

  const path = getDisplayTreePath(tree, nodeId);
  const {node} = path[path.length - 1];
  const nodeLabel = displayNodeLabel(node, datasetId);
  const isAnswer = node.type === 'answer';
  const columnProps = {
    emphasizedColumn: isAnswer ? project.labelColumn : node.column,
    showAllColumns,
    onToggleColumns: () => setShowAllColumns(shown => !shown),
  };

  return (
    <MuiCustomDialog
      aria-labelledby={titleId}
      closeLabel="Close node details"
      className={styles.dialog}
      onClose={onClose}
    >
      <div className={styles.titleRow}>
        <Typography id={titleId} variant="h3" component="h2">
          {isAnswer ? `AI predicts ${nodeLabel}` : nodeLabel}
        </Typography>
      </div>
      <p id="dsco-dialog-description" className={appStyles.visuallyHidden}>
        The rows that reached this node of your model&apos;s decision tree.
      </p>
      {path.length > 1 && (
        <NodePath path={path} nodeLabel={nodeLabel} datasetId={datasetId} />
      )}
      <div className={styles.content}>
        <div className={styles.rowsTabs}>
          <Tabs
            name="ailab-node-rows"
            size="s"
            defaultSelectedTabValue="accuracyCheck"
            onChange={() => {}}
            tabsContainerClassName={styles.tabRow}
            tabPanelsContainerClassName={styles.panels}
            tabs={[
              {
                value: 'accuracyCheck',
                text: 'Test rows',
                tabContent: (
                  <AccuracyCheckRowsPanel
                    rows={rows}
                    splitByGrade={isAnswer}
                    {...columnProps}
                  />
                ),
              },
              {
                value: 'training',
                text: 'Training rows',
                tabContent: (
                  <RowsPanel
                    description={
                      <>
                        These are the rows AI <strong>trained on</strong> that
                        reached this step.
                      </>
                    }
                    rowIndices={rows.trained}
                    {...columnProps}
                  />
                ),
              },
            ]}
          />
        </div>
      </div>
      <div className={styles.actionRow}>
        <Button variant="contained" color="primary" onClick={onClose}>
          Back to Testing
        </Button>
      </div>
    </MuiCustomDialog>
  );
};

export default NodeModal;
