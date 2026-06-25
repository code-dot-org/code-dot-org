import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {IconButton as MuiIconButton} from '@mui/material';
import classNames from 'classnames';
import React, {useState} from 'react';

import experiments from '@cdo/apps/util/experiments';
import getScriptData, {hasScriptData} from '@cdo/apps/util/getScriptData';

import ScrapbookEntryDialog from './ScrapbookEntryDialog';

import moduleStyles from './scrapbook-button.module.scss';

// An entry is keyed either by (scriptId, levelId) for in-curriculum levels,
// or by channelId for standalone projects.
interface ScrapbookData {
  scriptId?: number;
  levelId?: number;
  channelId?: string;
  isSignedIn: boolean;
}

function readScrapbookData(): ScrapbookData | null {
  if (!hasScriptData('script[data-scrapbookdata]')) return null;
  return getScriptData('scrapbookdata') as ScrapbookData;
}

export default function ScrapbookButton() {
  const [dialogOpen, setDialogOpen] = useState(false);

  if (
    !experiments.isEnabledAllowingQueryString(experiments.STUDENT_SCRAPBOOK)
  ) {
    return null;
  }
  const data = readScrapbookData();
  if (!data || !data.isSignedIn) return null;
  const hasKey = !!data.channelId || (!!data.scriptId && !!data.levelId);
  if (!hasKey) return null;

  return (
    <>
      <MuiIconButton
        className={classNames(
          'header_button',
          'header_button_light',
          'no-mc',
          moduleStyles.button
        )}
        onClick={() => setDialogOpen(true)}
        size="small"
        aria-label="Save to scrapbook"
        title="Save to scrapbook"
      >
        <FontAwesomeV6Icon iconName="thumbtack" />
      </MuiIconButton>
      <ScrapbookEntryDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        scriptId={data.scriptId}
        levelId={data.levelId}
        channelId={data.channelId}
      />
    </>
  );
}
