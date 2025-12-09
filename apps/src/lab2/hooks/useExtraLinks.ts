import {useState, useEffect} from 'react';

import {getCurrentScriptLevelId} from '@cdo/apps/code-studio/progressReduxSelectors';
import HttpClient from '@cdo/apps/util/HttpClient';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {PERMISSIONS} from '../constants';
import {ExtraLinksLevelData, ExtraLinksProjectData} from '../types';

interface ExtraLinksData {
  levelLinkData?: ExtraLinksLevelData;
  projectLinkData?: ExtraLinksProjectData;
}

async function fetchExtraLinksData(
  permissions: string[],
  levelId: number,
  scriptLevelId?: string,
  channelId?: string
): Promise<ExtraLinksData> {
  // Fetch level link data.
  let levelLinkData: ExtraLinksLevelData | undefined;
  if (
    permissions.includes(PERMISSIONS.LEVELBUILDER) ||
    permissions.includes(PERMISSIONS.PROJECT_VALIDATOR)
  ) {
    let url = `/levels/${levelId}/extra_links`;
    if (scriptLevelId) {
      url += `?scriptLevelId=${scriptLevelId}`;
    }

    const levelLinkDataResponse =
      await HttpClient.fetchJson<ExtraLinksLevelData>(url);
    levelLinkData = levelLinkDataResponse.value;
  }

  // Fetch project link data.
  let projectLinkData: ExtraLinksProjectData | undefined;
  if (permissions.includes(PERMISSIONS.PROJECT_VALIDATOR)) {
    const levelProjectDataResponse =
      await HttpClient.fetchJson<ExtraLinksProjectData>(
        `/projects/${channelId}/extra_links`
      );
    projectLinkData = levelProjectDataResponse.value;
  }

  // Return fetched link data.
  return {
    levelLinkData,
    projectLinkData,
  };
}

export const useExtraLinks = (levelId: number) => {
  const [isExtraLinksLoading, setIsLoading] = useState(false);
  const [extraLinksData, setExtraLinksData] = useState<ExtraLinksData | null>(
    null
  );

  const scriptLevelId = useAppSelector(getCurrentScriptLevelId);

  const channelId = useAppSelector(
    state => state.lab.channel && state.lab.channel.id
  );

  const permissions = useAppSelector(state => state.lab.permissions);

  useEffect(() => {
    setIsLoading(true);
    fetchExtraLinksData(permissions, levelId, scriptLevelId, channelId).then(
      data => {
        setExtraLinksData(data);
        setIsLoading(false);
      }
    );
  }, [permissions, levelId, scriptLevelId, channelId]);
  const {levelLinkData, projectLinkData} = extraLinksData || {};

  return {
    isExtraLinksLoading,
    levelLinkData,
    projectLinkData,
  };
};
