import {useEffect, useReducer} from 'react';

import {HttpClient} from '@code-dot-org/api';
import {progressActions} from '@code-dot-org/progress/redux';

import {PERMISSIONS} from '../constants';
import LabRegistry from '../LabRegistry';
import {useAppSelector} from '../redux/store';
import type {ExtraLinksLevelData, ExtraLinksProjectData} from '../types';

const {getCurrentScriptLevelId} = progressActions;

interface ExtraLinksData {
  levelLinkData?: ExtraLinksLevelData;
  projectLinkData?: ExtraLinksProjectData;
}

async function fetchExtraLinksData(
  permissions: string[],
  levelId: number,
  scriptLevelId?: string,
  channelId?: string,
  abortSignal?: AbortSignal,
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
        `/projects/${channelId}/extra_links`,
        {signal: abortSignal},
      );
    projectLinkData = levelProjectDataResponse.value;
  }

  // Return fetched link data.
  return {
    levelLinkData,
    projectLinkData,
  };
}

type FetchState = {
  isLoading: boolean;
  data: ExtraLinksData | null;
};

type FetchAction =
  | {type: 'fetch'}
  | {type: 'success'; data: ExtraLinksData}
  | {type: 'error'};

function fetchReducer(state: FetchState, action: FetchAction): FetchState {
  switch (action.type) {
    case 'fetch':
      return {...state, isLoading: true};
    case 'success':
      return {isLoading: false, data: action.data};
    case 'error':
      return {...state, isLoading: false};
  }
}

export const useExtraLinks = (levelId: number) => {
  const [{isLoading: isExtraLinksLoading, data: extraLinksData}, dispatch] =
    useReducer(fetchReducer, {isLoading: false, data: null});

  const scriptLevelId = useAppSelector(getCurrentScriptLevelId);

  const channelId = useAppSelector(
    state => state.lab.channel && state.lab.channel.id,
  );

  const permissions = useAppSelector(state => state.lab.permissions);

  useEffect(() => {
    dispatch({type: 'fetch'});

    const abortController = new AbortController();
    fetchExtraLinksData(
      permissions,
      levelId,
      scriptLevelId,
      channelId,
      abortController.signal,
    )
      .then(data => {
        if (!abortController.signal.aborted) {
          dispatch({type: 'success', data});
        }
      })
      .catch(e => {
        if (e.name === 'AbortError') {
          // Ignore abort errors
          return;
        }
        LabRegistry.metricsReporter.logError(
          'Error fetching extra links data',
          e as Error,
          {
            message: e.message,
          },
        );
        dispatch({type: 'error'});
      });

    return () => abortController.abort();
  }, [permissions, levelId, scriptLevelId, channelId]);
  const {levelLinkData, projectLinkData} = extraLinksData || {};

  return {
    isExtraLinksLoading,
    levelLinkData,
    projectLinkData,
  };
};
