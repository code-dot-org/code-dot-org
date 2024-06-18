import React, {useEffect, useState} from 'react';
import {Heading3, StrongText} from '@cdo/apps/componentLibrary/typography';
import AccessibleDialog from '@cdo/apps/templates/AccessibleDialog';
import Button from '@cdo/apps/templates/Button';
import HttpClient, {NetworkError} from '@cdo/apps/util/HttpClient';
import {
  ExtraLinksLevelbuilderData,
  ExtraLinksProjectValidatorData,
} from '../types';
import moduleStyles from './extra-links.module.scss';

// Extra Links modal. This is used to display helpful links for levelbuilders, and should
// be extended to also include links for project validators as well. It replaces the haml
// version of extra links, which doesn't work on lab2 after a level change.
interface ExtraLinksModalProps {
  levelbuilderLinkData: ExtraLinksLevelbuilderData;
  projectValidatorLinkData: ExtraLinksProjectValidatorData | null;
  isOpen: boolean;
  closeModal: () => void;
  levelId: number;
}

const ExtraLinksModal: React.FunctionComponent<ExtraLinksModalProps> = ({
  levelbuilderLinkData,
  projectValidatorLinkData,
  isOpen,
  closeModal,
  levelId,
}) => {
  const [showCloneField, setShowCloneField] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [clonedLevelName, setClonedLevelName] = useState('');
  const [cloneError, setCloneError] = useState('');
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    setClonedLevelName(levelbuilderLinkData.level_name);
  }, [levelbuilderLinkData]);

  const onClose = () => {
    closeModal();
    setShowCloneField(false);
    setShowDeleteConfirm(false);
    setCloneError('');
    setDeleteError('');
  };

  const handleClone = async () => {
    if (clonedLevelName) {
      try {
        const response = await HttpClient.post(
          `/levels/${levelId}/clone?name=${clonedLevelName}`,
          undefined,
          true,
          {contentType: 'application/json;charset=UTF-8'}
        );
        const result = await response.json();
        if (result.redirect) {
          window.location.href = result.redirect;
        }
      } catch (e) {
        if (e instanceof NetworkError) {
          const responseText = await e.response.text();
          setCloneError(responseText);
        } else {
          setCloneError((e as Error).message);
        }
      }
    }
  };

  const handleDelete = async () => {
    try {
      const response = await HttpClient.delete(`/levels/${levelId}`, true, {
        Accept: 'application/json',
      });
      const result = await response.json();
      if (result.redirect) {
        window.location.href = result.redirect;
      }
    } catch (e) {
      if (e instanceof NetworkError) {
        const responseText = await e.response.text();
        setDeleteError(responseText);
      } else {
        setDeleteError((e as Error).message);
      }
    }
  };

  const cloneLevelDisplay = (
    <div>
      <Button
        size={Button.ButtonSize.small}
        color={Button.ButtonColor.purple}
        onClick={() => setShowCloneField(!showCloneField)}
        text={showCloneField ? 'Cancel Clone' : 'Clone'}
      />
      {showCloneField && (
        <div>
          {'New level name: '}
          <input
            type="text"
            value={clonedLevelName}
            onChange={event => setClonedLevelName(event.target.value)}
          />
          <Button
            onClick={handleClone}
            text={'Clone'}
            size={Button.ButtonSize.small}
          />
          {cloneError && (
            <p className={moduleStyles.errorMessage}>{cloneError}</p>
          )}
        </div>
      )}
    </div>
  );

  const deleteLevelDisplay = (
    <div>
      <Button
        size={Button.ButtonSize.small}
        text={showDeleteConfirm ? 'Cancel Delete' : 'Delete'}
        color={Button.ButtonColor.red}
        onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
      />
      {showDeleteConfirm && (
        <div>
          {'Are you sure you want to delete this level? '}
          <Button
            onClick={handleDelete}
            text={'Confirm Delete'}
            size={Button.ButtonSize.small}
          />
          {deleteError && (
            <p className={moduleStyles.errorMessage}>{deleteError}</p>
          )}
        </div>
      )}
    </div>
  );

  const scriptLevelPathLinksDisplay = (
    <>
      <StrongText>
        This level is in{' '}
        {Object.entries(levelbuilderLinkData.script_level_path_links).length}{' '}
        scripts:
      </StrongText>
      <ul>
        {levelbuilderLinkData.script_level_path_links.map((link, index) => (
          <li key={index}>
            <a href={'/s/' + link.script}>{link.script}</a> as{' '}
            <a href={link.path}>{link.path}</a>
          </li>
        ))}
      </ul>
    </>
  );

  const projectValidatorDataDisplay = (
    projectValidatorLinkData: ExtraLinksProjectValidatorData
  ) => (
    <>
      <StrongText>Project Info</StrongText>
      <ul>
        <li>{`Project owner: ${projectValidatorLinkData.owner_info.name}`}</li>
        <li>
          {`Owner storage id: ${projectValidatorLinkData.owner_info.storage_id}`}
        </li>
        <li>{`Project id: ${projectValidatorLinkData.project_info.id}`}</li>
        <li>{`S3 links: sources`}</li>
        <li>{`Remix info`}</li>
        <li>{`Featured project info: ${projectValidatorLinkData.project_info.featured_status}`}</li>
      </ul>
    </>
  );

  return isOpen ? (
    <AccessibleDialog onClose={onClose}>
      <Heading3>Extra links</Heading3>

      <button
        type="button"
        onClick={onClose}
        className={moduleStyles.xCloseButton}
      >
        <i id="x-close" className="fa-solid fa-xmark" />
      </button>
      {Object.entries(levelbuilderLinkData.links).map(([listTitle, links]) => (
        // Levels can be part of level groups (sublevels) and/or can be a template level
        // so we list these here as well.
        <div key={`${listTitle}-div`}>
          <StrongText key={`${listTitle}-title`}>{listTitle}</StrongText>
          <ul key={`${listTitle}-list`}>
            {links.map((link, index) => (
              <li key={index}>
                {link.url ? (
                  // This menu is only used by internal users, who have explicitly requested access keys.
                  // eslint-disable-next-line jsx-a11y/no-access-key
                  <a href={link.url} accessKey={link.access_key}>
                    {link.text}
                  </a>
                ) : (
                  <p>{link.text}</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
      {levelbuilderLinkData.can_clone && cloneLevelDisplay}
      {levelbuilderLinkData.can_delete && deleteLevelDisplay}
      {levelbuilderLinkData.script_level_path_links &&
        scriptLevelPathLinksDisplay}
      {projectValidatorLinkData &&
        projectValidatorDataDisplay(projectValidatorLinkData)}
    </AccessibleDialog>
  ) : null;
};

export default ExtraLinksModal;
