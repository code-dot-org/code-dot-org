import React, {useEffect, useState} from 'react';
import {ExtraLinksData} from '../types';
import {Heading3, StrongText} from '@cdo/apps/componentLibrary/typography';
import AccessibleDialog from '@cdo/apps/templates/AccessibleDialog';
import moduleStyles from './extra-links.module.scss';
import Button from '@cdo/apps/templates/Button';
import {getAuthenticityToken} from '@cdo/apps/util/AuthenticityTokenStore';

// Extra Links modal. This is used to display helpful links for levelbuilders, and should
// be extended to also include links for project validators as well. It replaces the haml
// version of extra links, which doesn't work on lab2 after a level change.
interface ExtraLinksModalProps {
  linkData: ExtraLinksData;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  levelId: number;
}

const ExtraLinksModal: React.FunctionComponent<ExtraLinksModalProps> = ({
  linkData,
  isOpen,
  setIsOpen,
  levelId,
}) => {
  const [showCloneField, setShowCloneField] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [clonedLevelName, setClonedLevelName] = useState('');
  const [cloneError, setCloneError] = useState('');
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    if (linkData) {
      setClonedLevelName(linkData.level_name);
    }
  }, [linkData]);

  const onClose = () => {
    setIsOpen(false);
    setShowCloneField(false);
    setShowDeleteConfirm(false);
    setCloneError('');
    setDeleteError('');
  };

  const handleClone = async () => {
    if (clonedLevelName) {
      const response = await fetch(
        `/levels/${levelId}/clone?name=${clonedLevelName}`,
        {
          method: 'POST',
          headers: {
            contentType: 'application/json;charset=UTF-8',
            'X-CSRF-Token': await getAuthenticityToken(),
          },
        }
      );
      if (response.ok) {
        const result = await response.json();
        if (result.redirect) {
          window.location.href = result.redirect;
        }
      } else {
        const responseText = await response.text();
        setCloneError(responseText);
      }
    }
  };

  const handleDelete = async () => {
    const response = await fetch(`/levels/${levelId}`, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        'X-CSRF-Token': await getAuthenticityToken(),
      },
    });
    if (response.ok) {
      const result = await response.json();
      if (result.redirect) {
        window.location.href = result.redirect;
      }
    } else {
      const responseText = await response.text();
      setDeleteError(responseText);
    }
  };

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
      {Object.entries(linkData.links).map(([listTitle, links]) => (
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
      {linkData.can_clone && (
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
      )}
      {linkData.can_delete && (
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
      )}
    </AccessibleDialog>
  ) : null;
};

export default ExtraLinksModal;
