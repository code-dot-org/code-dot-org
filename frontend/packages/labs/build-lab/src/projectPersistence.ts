import {useEffect, useRef, useState} from 'react';

import {DashboardApiClient} from '@code-dot-org/core/api';
import type {MultiFileSource} from '@code-dot-org/core/api';

import {
  cloneBuildLabProject,
  DEFAULT_PROJECT,
  migrateBuildLabProject,
  parseBuildLabProject,
  serializeBuildLabProject,
} from './project';
import type {BuildLabProject} from './project';

const LOCAL_STORAGE_KEY = 'code-dot-org:build-lab:standalone';

export type ProjectSaveStatus =
  | 'loading'
  | 'saved'
  | 'saving'
  | 'unsaved'
  | 'error';

interface UseBuildLabPersistenceOptions {
  channelId?: string;
  onLoad: (project: BuildLabProject) => void;
  project: BuildLabProject;
  readOnly?: boolean;
}

function sourceText(source: string | MultiFileSource): string | null {
  if (typeof source === 'string') {
    return source;
  }

  const mainFile = Object.values(source.files).find(
    file => file.name === 'main.json',
  );
  return mainFile?.contents ?? null;
}

interface LoadedProject {
  project: BuildLabProject;
  versionId?: string;
}

export function usableVersionId(versionId?: string): string | undefined {
  return versionId && versionId !== 'unknown' ? versionId : undefined;
}

async function loadProject(channelId?: string): Promise<LoadedProject> {
  if (!channelId) {
    const saved = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    return {
      project: migrateBuildLabProject(
        parseBuildLabProject(saved ?? '') ??
          cloneBuildLabProject(DEFAULT_PROJECT),
      ),
    };
  }

  const response = await DashboardApiClient.sources.get({channelId});
  const saved = sourceText(response.sources.source);
  return {
    project: migrateBuildLabProject(
      parseBuildLabProject(saved ?? '') ??
        cloneBuildLabProject(DEFAULT_PROJECT),
    ),
    versionId: usableVersionId(response.versionId),
  };
}

async function saveProject(
  channelId: string | undefined,
  project: BuildLabProject,
  versionId?: string,
): Promise<string | undefined> {
  const serializedProject = serializeBuildLabProject(project);

  if (!channelId) {
    window.localStorage.setItem(LOCAL_STORAGE_KEY, serializedProject);
    return undefined;
  }

  const response = await DashboardApiClient.sources.update({
    channelId,
    options: {
      ...(versionId ? {currentVersion: versionId, replace: true} : {}),
      projectType: 'build-lab',
    },
    sources: {source: serializedProject},
  });
  return usableVersionId(response.versionId);
}

export function useBuildLabPersistence({
  channelId,
  onLoad,
  project,
  readOnly = false,
}: UseBuildLabPersistenceOptions): ProjectSaveStatus {
  const [status, setStatus] = useState<ProjectSaveStatus>('loading');
  const [isHydrated, setIsHydrated] = useState(false);
  const onLoadRef = useRef(onLoad);
  const versionIdRef = useRef<string | undefined>(undefined);
  const saveQueueRef = useRef(Promise.resolve());
  const latestSaveRef = useRef(0);
  onLoadRef.current = onLoad;

  useEffect(() => {
    let cancelled = false;

    latestSaveRef.current += 1;
    setStatus('loading');
    setIsHydrated(false);
    loadProject(channelId)
      .then(({project: loadedProject, versionId}) => {
        if (cancelled) {
          return;
        }
        versionIdRef.current = versionId;
        onLoadRef.current(loadedProject);
        setIsHydrated(true);
        setStatus('saved');
      })
      .catch(() => {
        if (cancelled) {
          return;
        }
        versionIdRef.current = undefined;
        onLoadRef.current(cloneBuildLabProject(DEFAULT_PROJECT));
        setIsHydrated(true);
        setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [channelId]);

  useEffect(() => {
    if (!isHydrated || readOnly) {
      return;
    }

    setStatus(currentStatus =>
      currentStatus === 'error' ? currentStatus : 'unsaved',
    );
    const timeout = window.setTimeout(() => {
      setStatus('saving');
      const saveId = latestSaveRef.current + 1;
      latestSaveRef.current = saveId;
      const saveChannelId = channelId;
      const saveVersionId = versionIdRef.current;
      const save = saveQueueRef.current.then(async () => {
        const nextVersionId = await saveProject(
          saveChannelId,
          project,
          saveVersionId,
        );
        if (saveId === latestSaveRef.current) {
          versionIdRef.current = nextVersionId;
          setStatus('saved');
        }
      });
      saveQueueRef.current = save.catch(() => undefined);
      save.catch(() => {
        if (saveId === latestSaveRef.current) {
          setStatus('error');
        }
      });
    }, 700);

    return () => window.clearTimeout(timeout);
  }, [channelId, isHydrated, project, readOnly]);

  return status;
}
