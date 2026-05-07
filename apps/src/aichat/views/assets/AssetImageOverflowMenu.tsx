import {PopUpButton} from '@codebridge/PopUpButton/PopUpButton';
import {PopUpButtonOption} from '@codebridge/PopUpButton/PopUpButtonOption';
import React, {useCallback} from 'react';

import {addChatEvent} from '@cdo/apps/aichat/redux';
import {getNewRemoveId} from '@cdo/apps/aichat/redux/utils';
import {useBackpackAPIContext} from '@cdo/apps/sharedComponents/backpack/BackpackAPIContext';
import BackpackClientApi from '@cdo/apps/sharedComponents/backpack/BackpackClientApi';
import HttpClient from '@cdo/apps/util/HttpClient';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';

import styles from './asset-image-overflow-menu.module.scss';

interface AssetImageOverflowMenuProps {
  url: string;
  filename: string;
  /** Stable ID for the trigger button. Must be unique on the page. */
  id: string;
}

const DEFAULT_EXT = 'png';

const MONTH_ABBR = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const extFromFilename = (filename: string): string => {
  const dot = filename.lastIndexOf('.');
  return dot > 0 ? filename.slice(dot + 1).toLowerCase() : '';
};

const extFromUrl = (url: string): string => {
  const path = url.split('?')[0];
  const dot = path.lastIndexOf('.');
  return dot >= 0 ? path.slice(dot + 1).toLowerCase() : '';
};

// Creates a filename like "May-6-0930am"
const dateTimeName = (now: Date = new Date()): string => {
  const month = MONTH_ABBR[now.getMonth()];
  const day = now.getDate();
  const rawHour = now.getHours();
  const ampm = rawHour < 12 ? 'am' : 'pm';
  const hour12 = rawHour % 12 || 12;
  const hh = String(hour12).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  return `${month}-${day}-${hh}_${mm}${ampm}`;
};

// TODO: replace with a shared util.
const downloadToBlob = (blob: Blob, filename: string): void => {
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(objectUrl);
};

// Returns "<base>.<ext>", or "<base>-2.<ext>", "<base>-3.<ext>", ... when the
// initial name collides with an existing file.
const dedupedName = (base: string, ext: string, existing: string[]): string => {
  const taken = new Set(existing);
  let candidate = `${base}.${ext}`;
  let i = 2;
  while (taken.has(candidate)) {
    candidate = `${base}-${i}.${ext}`;
    i += 1;
  }
  return candidate;
};

const AssetImageOverflowMenu: React.FC<AssetImageOverflowMenuProps> = ({
  url,
  filename,
  id,
}) => {
  const backpackContext = useBackpackAPIContext();
  const backpackApi = backpackContext?.primaryApi;
  const dispatch = useAppDispatch();

  const ext = extFromFilename(filename) || extFromUrl(url) || DEFAULT_EXT;

  const showBackpackError = useCallback(() => {
    dispatch(
      addChatEvent({
        removeId: getNewRemoveId(),
        text: "Couldn't save image to your Backpack. Please try again.",
        notificationType: 'error',
        timestamp: Date.now(),
      })
    );
  }, [dispatch]);

  const onCopy = useCallback(async () => {
    try {
      const response = await HttpClient.get(url);
      const blob = await response.blob();
      await navigator.clipboard.write([new ClipboardItem({[blob.type]: blob})]);
    } catch {
      try {
        // On failure, fall back to copying the URL itself.
        await navigator.clipboard.writeText(url);
      } catch {
        // nothing else to try
      }
    }
  }, [url]);

  const onDownload = useCallback(async () => {
    const downloadName = `${dateTimeName()}.${ext}`;
    try {
      const response = await HttpClient.get(url);
      const blob = await response.blob();
      downloadToBlob(blob, downloadName);
    } catch {
      // Fall back to a direct link.
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }, [url, ext]);

  const onSaveToBackpack = useCallback(
    async (backpackApi: BackpackClientApi) => {
      try {
        const files = await backpackApi.getFileList();
        const targetName = dedupedName(dateTimeName(), ext, files);
        await backpackApi.saveCodebridgeFileFromUrl(targetName, url);
      } catch {
        showBackpackError();
      }
    },
    [url, ext, showBackpackError]
  );

  return (
    <div
      className={styles.container}
      // Stop clicks from bubbling to the parent <button>.
      onClick={e => e.stopPropagation()}
    >
      <PopUpButton
        iconName="ellipsis-vertical"
        alignment="right"
        id={id}
        ariaLabel="Image options"
        className={styles.menuButton}
      >
        <PopUpButtonOption
          iconName="copy"
          labelText="Copy"
          clickHandler={onCopy}
        />
        <PopUpButtonOption
          iconName="download"
          labelText="Download"
          clickHandler={onDownload}
        />
        {backpackApi && (
          <PopUpButtonOption
            iconName="backpack"
            labelText="Save to Backpack"
            clickHandler={() => onSaveToBackpack(backpackApi)}
          />
        )}
      </PopUpButton>
    </div>
  );
};

export default AssetImageOverflowMenu;
