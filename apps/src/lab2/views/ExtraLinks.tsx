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

// Extra Links modal. This is used to display helpful links for levelbuilders, and should
// be extended to also include links for project validators as well. It replaces the haml
// version of extra links, which doesn't work on lab2 after a level change.
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
