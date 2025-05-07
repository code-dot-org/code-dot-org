import {redirect, useParams} from 'next/navigation';
import {useState} from 'react';

import Button from '@code-dot-org/component-library/button';
import {BodyTwoText} from '@code-dot-org/component-library/typography';

type ContentEditorToolsProps = {
  onChangeDraftToken: () => void;
  isDraftModeEnabled: boolean;
  previewLabel: string;
};

const ContentEditorTools = ({
  onChangeDraftToken,
  isDraftModeEnabled,
  previewLabel,
}: ContentEditorToolsProps) => {
  const pageParams = useParams();
  const [shareLinkButtonText, setShareableLinkButtonText] =
    useState('Get shareable link');

  const handleCopyShareableLinkClick = () => {
    const shareableLink = `${window.location.origin}${getEnableDraftModeUrl()}`;

    navigator.clipboard.writeText(shareableLink).then(() => {
      setShareableLinkButtonText('Copied!');
    });
  };

  const getEnableDraftModeUrl = () => {
    const draftModeToken = localStorage.getItem('draftToken');
    return `/api/draft?token=${draftModeToken}&slug=${pageParams.slug}&locale=${pageParams.locale}`;
  };
  const handleEnterDraftMode = () => {
    redirect(getEnableDraftModeUrl());
  };

  const handleExitDraftMode = async () => {
    try {
      const response = await fetch('/api/disable-draft', {
        method: 'POST',
      });

      if (response.ok) {
        window.location.reload();
      } else {
        console.error(
          'Failed to exit draft mode with status:',
          response.status,
        );
      }
    } catch (error) {
      console.error('Error exiting draft mode:', error);
    }
  };

  return (
    <>
      <BodyTwoText>
        <strong>Viewing {previewLabel}</strong>
      </BodyTwoText>

      <Button
        text={shareLinkButtonText}
        iconLeft={{iconName: 'copy'}}
        onClick={handleCopyShareableLinkClick}
        size={'s'}
      />

      {isDraftModeEnabled ? (
        <Button
          text={'Exit draft mode'}
          color={'destructive'}
          iconLeft={{iconName: 'right-to-bracket'}}
          onClick={handleExitDraftMode}
          size={'s'}
        />
      ) : (
        <Button
          text={'Enter draft mode'}
          color={'destructive'}
          iconLeft={{iconName: 'pencil'}}
          onClick={handleEnterDraftMode}
          size={'s'}
        />
      )}

      <Button
        text={'Change draft token'}
        iconLeft={{iconName: 'right-left'}}
        onClick={onChangeDraftToken}
        size={'s'}
      />
    </>
  );
};

export default ContentEditorTools;
