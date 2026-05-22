import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import classNames from 'classnames';
import React, {useState} from 'react';

import getScriptData, {hasScriptData} from '@cdo/apps/util/getScriptData';

import ScrapbookEntryDialog from './ScrapbookEntryDialog';

import moduleStyles from './ScrapbookButton.module.scss';

interface ScrapbookData {
  scriptId: number;
  levelId: number;
  isSignedIn: boolean;
}

function readScrapbookData(): ScrapbookData | null {
  if (!hasScriptData('script[data-scrapbookdata]')) return null;
  return getScriptData('scrapbookdata') as ScrapbookData;
}

export default function ScrapbookButton() {
  const [dialogOpen, setDialogOpen] = useState(false);

  const data = readScrapbookData();
  if (!data || !data.isSignedIn) return null;

  return (
    <>
      <button
        type="button"
        className={classNames(
          'header_button',
          'header_button_light',
          'no-mc',
          moduleStyles.button
        )}
        onClick={() => setDialogOpen(true)}
      >
        <FontAwesomeV6Icon iconName="lightbulb" />
      </button>
      <ScrapbookEntryDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        scriptId={data.scriptId}
        levelId={data.levelId}
      />
    </>
  );
}
