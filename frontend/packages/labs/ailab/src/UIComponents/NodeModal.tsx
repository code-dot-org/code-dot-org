import {Button, IconButton, Tooltip, Typography} from '@mui/material';
import {type ReactNode, useId, useState} from 'react';

import {MuiCustomDialog} from '@code-dot-org/component-library/dialog';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import Tabs from '@code-dot-org/component-library/tabs';

import {getDisplayTreePath, type DisplayTreeNode} from '../helpers/displayTree';
import {displayNodeLabel, type Grade} from '../helpers/displayTreeNodeContent';
import {useAppSelector} from '../hooks';
import {useProject} from '../ProjectContext';
import {getDisplayTreeRows} from '../selectors/visualizationSelectors';
import {useTrainingData} from '../TrainingDataContext';

import NodePath from './NodePath';
import NodeRowsTable from './NodeRowsTable';
import ResultsToggle from './ResultsToggle';

import appStyles from '../app.module.scss';
import styles from './nodeModal.module.scss';

const rowCountText = (count: number) =>
  `${count} ${count === 1 ? 'Row' : 'Rows'}`;

interface RowsPanelProps {
  description: ReactNode;
  rows: number[];
  emphasizedColumn?: string;
  // Replaces the row count, grouped with the columns button.
  aside?: ReactNode;
  allColumns: boolean;
  onToggleColumns: () => void;
  emptyText?: string;
}

const RowsPanel = ({
  description,
  rows,
  emphasizedColumn,
  aside,
  allColumns,
  onToggleColumns,
  emptyText = 'No rows reached this step',
}: RowsPanelProps) => {
  const columnsLabel = allColumns
    ? 'Show only features and label'
    : 'Show all columns';
  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <Typography variant="body3" component="p" className={styles.panelText}>
          {description}
        </Typography>
        <div className={styles.panelActions}>
          {!aside && (
            <>
              <Typography variant="body3" component="span">
                <strong>{rowCountText(rows.length)}</strong>
              </Typography>
              <span className={styles.divider} />
            </>
          )}
          <div className={styles.actionGroup}>
            {aside}
            <Tooltip title={columnsLabel}>
              <IconButton
                aria-label={columnsLabel}
                onClick={onToggleColumns}
                size="extraSmall"
                color="tertiary"
                variant="outlined"
              >
                <FontAwesomeV6Icon
                  iconName="arrows-left-right-to-line"
                  aria-hidden="true"
                />
              </IconButton>
            </Tooltip>
          </div>
        </div>
      </div>
      <NodeRowsTable
        rows={rows}
        emphasizedColumn={emphasizedColumn}
        allColumns={allColumns}
        emptyText={emptyText}
      />
    </div>
  );
};

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
  const [grade, setGrade] = useState<Grade>('correct');
  const [allColumns, setAllColumns] = useState(false);
  const columnsToggle = {
    allColumns,
    onToggleColumns: () => setAllColumns(shown => !shown),
  };

  const path = getDisplayTreePath(tree, nodeId);
  const {node} = path[path.length - 1];
  const nodeLabel = displayNodeLabel(node, datasetId);
  const isAnswer = node.type === 'answer';
  const emphasizedColumn = isAnswer ? project.labelColumn : node.column;
  const accuracyCheckRows = isAnswer
    ? rows[grade]
    : [...rows.correct, ...rows.incorrect].sort((a, b) => a - b);

  return (
    <MuiCustomDialog
      aria-labelledby={titleId}
      closeLabel="Close node details"
      className={styles.dialog}
      onClose={onClose}
    >
      <div className={styles.titleRow}>
        <Typography id={titleId} variant="h3" component="h2">
          {isAnswer ? `Predicts ${nodeLabel}` : nodeLabel}
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
                  <RowsPanel
                    description={
                      <>
                        These are the rows AI <strong>tested</strong> on that
                        reached this step.
                      </>
                    }
                    rows={accuracyCheckRows}
                    emphasizedColumn={emphasizedColumn}
                    {...columnsToggle}
                    emptyText={
                      isAnswer ? 'No rows matched this filter' : undefined
                    }
                    aside={
                      isAnswer ? (
                        <ResultsToggle
                          grade={grade}
                          onChange={value => setGrade(value as Grade)}
                          counts={{
                            correct: rows.correct.length,
                            incorrect: rows.incorrect.length,
                          }}
                        />
                      ) : undefined
                    }
                  />
                ),
              },
              {
                value: 'trained',
                text: 'Trained rows',
                tabContent: (
                  <RowsPanel
                    description={
                      <>
                        These are the rows AI <strong>learned from</strong> that
                        reached this step.
                      </>
                    }
                    rows={rows.trained}
                    emphasizedColumn={emphasizedColumn}
                    {...columnsToggle}
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
