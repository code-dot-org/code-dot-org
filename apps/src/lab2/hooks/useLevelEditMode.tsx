import Alert from '@code-dot-org/component-library/alert';
import React, {useEffect, useMemo} from 'react';

import header from '@cdo/apps/code-studio/header';

import {
  START_SOURCES,
  TOOLBOX_BLOCKS,
  WARNING_BANNER_MESSAGES,
} from '../constants';
import {
  getAppOptionsEditBlocks,
  getAppOptionsEditingExemplar,
} from '../projects/utils';
import {LevelProperties} from '../types';

const isStartMode = getAppOptionsEditBlocks() === START_SOURCES;
const isToolboxMode = getAppOptionsEditBlocks() === TOOLBOX_BLOCKS;
const isEditingExemplar = getAppOptionsEditingExemplar();

export type GetUpdatedProperties = (mode: 'start' | 'exemplar' | 'toolbox') => {
  [key in keyof LevelProperties]?: LevelProperties[keyof LevelProperties];
};

/**
 * Hook that displays the save button for levelbuilder workspaces editing and
 * returns a workspace alert if a workspace edit mode is active.
 */
export default function (
  levelId: number,
  isProjectTemplateLevel: boolean,
  getUpdatedProperties: GetUpdatedProperties
) {
  useEffect(() => {
    if (isStartMode) {
      header.showLevelBuilderSaveButton(() => getUpdatedProperties('start'));
    } else if (isEditingExemplar) {
      header.showLevelBuilderSaveButton(
        () => getUpdatedProperties('exemplar'),
        'Levelbuilder: Edit Exemplar',
        `/levels/${levelId}/update_exemplar_code`
      );
    } else if (isToolboxMode) {
      header.showLevelBuilderSaveButton(
        () => getUpdatedProperties('toolbox'),
        'Levelbuilder: Edit toolbox blocks'
      );
    }
  }, [getUpdatedProperties, levelId]);

  const WorkspaceAlert = useMemo(() => {
    const text = isEditingExemplar
      ? WARNING_BANNER_MESSAGES.EXEMPLAR_MODE
      : isToolboxMode
      ? WARNING_BANNER_MESSAGES.TOOLBOX_MODE
      : isStartMode
      ? isProjectTemplateLevel
        ? WARNING_BANNER_MESSAGES.TEMPLATE
        : WARNING_BANNER_MESSAGES.STANDARD
      : null;
    if (text) {
      return <Alert size="s" text={text} type="warning" />;
    }
  }, [isProjectTemplateLevel]);

  return WorkspaceAlert;
}
