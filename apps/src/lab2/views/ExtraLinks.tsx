import Button from '@cdo/apps/templates/Button';
import {useFetch} from '@cdo/apps/util/useFetch';
import React, {useState} from 'react';
import moduleStyles from './extra-links.module.scss';
import ExtraLinksModal from './ExtraLinksModal';

interface ExtraLinksProps {
  levelId: number;
}

interface ExtraLinksResponse {
  links: {[key: string]: {text: string; url: string; access_key?: string}[]};
  can_clone: boolean;
  can_delete: boolean;
  level_name: string;
}

// Fetch extra links for the level, then display a modal with the link data.
const ExtraLinks: React.FunctionComponent<ExtraLinksProps> = ({
  levelId,
}: ExtraLinksProps) => {
  const {loading, data, status} = useFetch(`/levels/${levelId}/extra_links`);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (loading || status !== 200) {
    return <></>;
  }

  const linkData = data as ExtraLinksResponse;

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        text={'Extra Links'}
        className={moduleStyles.extraLinksButton}
      />
      <ExtraLinksModal
        linkData={linkData}
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        levelId={levelId}
      />
    </>
  );
};

export default ExtraLinks;
