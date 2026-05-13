import {useMemo} from 'react';

import AiTrainerLab from '@code-dot-org/ai-trainer-lab';
import {ApiClientProvider, useApiClient} from '@code-dot-org/core/api';

import {useRegisterLabContext} from '@/modules/ai-tutor-host/useRegisterLabContext';

import {createStubbedLabApiClient} from './stubApiClient';
import {useResetLabRedux} from './useResetLabRedux';

import styles from './guidedLesson.module.scss';

export interface AiTrainerStageConfig {
  levelId: number;
  /** Optional Blockly XML pre-populated in the workspace. */
  startBlocks?: string;
  /** Optional Blockly XML toolbox. Falls back to the lab's full toolbox. */
  toolboxBlocks?: string;
  instructions: string;
}

interface AiTrainerLabStageProps {
  config: AiTrainerStageConfig;
}

/**
 * Mounts the AI Trainer lab in the guided lesson. Same shape as
 * DatasciLabStage — the underlying App accepts `BlocklyLab` props directly,
 * so we wire `standaloneProjectType` + `levelId` straight through.
 */
const AiTrainerLabStage = ({config}: AiTrainerLabStageProps) => {
  const realApi = useApiClient();

  const ready = useResetLabRedux({
    currentLevelId: config.levelId,
    standaloneProjectType: 'ai_trainer',
  });

  useRegisterLabContext(() => ({
    labType: 'ai-trainer',
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
      kind: 'ai_trainer',
      levelId: config.levelId,
      levelProperties,
    });
  }, [realApi, config]);

  return (
    <div className={styles.musicLabHost}>
      <ApiClientProvider client={stubbedApi}>
        {ready && (
          <AiTrainerLab
            isLoading={false}
            standaloneProjectType="ai_trainer"
            levelId={String(config.levelId)}
          />
        )}
      </ApiClientProvider>
    </div>
  );
};

export default AiTrainerLabStage;
