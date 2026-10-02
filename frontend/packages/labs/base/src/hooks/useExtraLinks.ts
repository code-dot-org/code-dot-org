import {
  useApiClient,
  useExtraLinksLevelData,
  useExtraLinksProjectData,
} from '@code-dot-org/core/api';
import {progressActions} from '@code-dot-org/progress/redux';

import {PERMISSIONS} from '../constants';
import {useAppSelector} from '../redux/store';

const {getCurrentScriptLevelId} = progressActions;

export const useExtraLinks = (levelId: number) => {
  const scriptLevelId = useAppSelector(getCurrentScriptLevelId);

  const channelId = useAppSelector(
    state => state.lab.channel && state.lab.channel.id,
  );

  const permissions = useAppSelector(state => state.lab.permissions);

  const api = useApiClient();

  const {data: levelLinkData, isLoading: levelLinksLoading} =
    useExtraLinksLevelData(
      api,
      {
        levelId,
        scriptLevelId: scriptLevelId || undefined,
      },
      {
        enabled:
          permissions.includes(PERMISSIONS.LEVELBUILDER) ||
          permissions.includes(PERMISSIONS.PROJECT_VALIDATOR),
      },
    );

  const {data: projectLinkData, isLoading: projectLinksLoading} =
    useExtraLinksProjectData(
      api,
      {
        channelId: channelId?.toString() || '',
      },
      {
        enabled:
          !!channelId && permissions.includes(PERMISSIONS.PROJECT_VALIDATOR),
      },
    );

  const isExtraLinksLoading = levelLinksLoading || projectLinksLoading;

  return {
    isExtraLinksLoading,
    levelLinkData,
    projectLinkData,
  };
};
