import Button from '@code-dot-org/component-library/button';
import React, {useEffect, useState} from 'react';

import {ExtraLinksLevelData, ExtraLinksProjectData} from '@cdo/apps/lab2/types';
import HttpClient from '@cdo/apps/util/HttpClient';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {PERMISSIONS} from '../constants';

import ExtraLinksModal from './ExtraLinksModal';

import moduleStyles from './extra-links.module.scss';

interface ExtraLinksProps {
  levelId: number;
}

interface ExtraLinksData {
  levelLinkData?: ExtraLinksLevelData;
  projectLinkData?: ExtraLinksProjectData;
}

async function fetchExtraLinksData(
  permissions: string[],
  levelId: number,
  channelId?: string
): Promise<ExtraLinksData> {
  // Fetch level link data.
  let levelLinkData: ExtraLinksLevelData | undefined;
  if (
    permissions.includes(PERMISSIONS.LEVELBUILDER) ||
    permissions.includes(PERMISSIONS.PROJECT_VALIDATOR)
  ) {
    const levelLinkDataResponse =
      await HttpClient.fetchJson<ExtraLinksLevelData>(
        `/levels/${levelId}/extra_links`
      );
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

// If the user has permission to see extra links, fetch extra links for the level,
// then display a modal with the link data.
const ExtraLinks: React.FunctionComponent<ExtraLinksProps> = ({
  levelId,
}: ExtraLinksProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [extraLinksData, setExtraLinksData] = useState<ExtraLinksData | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const channelId = useAppSelector(
    state => state.lab.channel && state.lab.channel.id
  );

  const permissions = useAppSelector(state => state.lab.permissions);

  useEffect(() => {
    setIsLoading(true);
    fetchExtraLinksData(permissions, levelId, channelId).then(data => {
      setExtraLinksData(data);
      setIsLoading(false);
    });
  }, [permissions, levelId, channelId]);
  const {levelLinkData, projectLinkData} = extraLinksData || {};

  if (isLoading || (!levelLinkData && !projectLinkData)) {
    return null;
  }

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        text={'Extra Links'}
        className={moduleStyles.extraLinksButton}
        size={'s'}
        id={'uitest-extra-links-button'}
      />
      {levelLinkData && (
        <ExtraLinksModal
          levelLinkData={levelLinkData}
          projectLinkData={projectLinkData}
          isOpen={isModalOpen}
          closeModal={() => setIsModalOpen(false)}
          levelId={levelId}
        />
      )}
    </>
  );
};

export default ExtraLinks;
