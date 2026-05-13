import {useMemo} from 'react';

import {ApiClientProvider, useApiClient} from '@code-dot-org/core/api';
import DatasciLab from '@code-dot-org/datasci-lab';

import {useRegisterLabContext} from '@/modules/ai-tutor-host/useRegisterLabContext';

import {createStubbedLabApiClient} from './stubApiClient';
import {useResetLabRedux} from './useResetLabRedux';

import styles from './guidedLesson.module.scss';

export interface DatasciStageConfig {
  /** Unique levelId; keys the React Query cache entry for this step. */
  levelId: number;
  /** Optional Blockly XML pre-populated in the workspace. */
  startBlocks?: string;
  /** Optional Blockly XML toolbox. Falls back to the lab's full toolbox. */
  toolboxBlocks?: string;
  instructions: string;
}

interface DatasciLabStageProps {
  config: DatasciStageConfig;
}

/**
 * Mounts the data science lab inside the guided lesson. Unlike the maze App,
 * the datasci App accepts `BlocklyLab` props directly — so we pass
 * `standaloneProjectType` and `levelId` straight through instead of doing a
 * URL-pathname swap.
 */
const DatasciLabStage = ({config}: DatasciLabStageProps) => {
  const realApi = useApiClient();

  const ready = useResetLabRedux({
    currentLevelId: config.levelId,
    standaloneProjectType: 'datasci',
  });

  useRegisterLabContext(() => ({
    labType: 'datasci',
    longInstructions: config.instructions,
  }));

  const stubbedApi = useMemo(() => {
    const levelProperties: Record<string, unknown> = {
      longInstructions: config.instructions,
      shortInstructions: config.instructions,
    };
    if (config.startBlocks) levelProperties.startBlocks = config.startBlocks;
    if (config.toolboxBlocks) {
      levelProperties.toolboxBlocks = config.toolboxBlocks;
    }
    return createStubbedLabApiClient(realApi, {
      kind: 'datasci',
      levelId: config.levelId,
      levelProperties,
    });
  }, [realApi, config]);

  return (
    <div className={styles.musicLabHost}>
      <ApiClientProvider client={stubbedApi}>
        {ready && (
          <DatasciLab
            isLoading={false}
            standaloneProjectType="datasci"
            levelId={String(config.levelId)}
          />
        )}
      </ApiClientProvider>
    </div>
  );
};

export default DatasciLabStage;
