import {useToast} from '@code-dot-org/component-library/toast';
import {PopUpButton} from '@codebridge/PopUpButton/PopUpButton';
import {PopUpButtonOption} from '@codebridge/PopUpButton/PopUpButtonOption';
import React, {useCallback, useMemo} from 'react';

import {addChatEvent} from '@cdo/apps/aichat/redux';
import {getNewRemoveId} from '@cdo/apps/aichat/redux/utils';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {SaveToBackpackApi} from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel/Backpack/saveToBackpackHelper';
import {useBackpackAPIContext} from '@cdo/apps/sharedComponents/backpack/BackpackAPIContext';
import experiments from '@cdo/apps/util/experiments';
import HttpClient from '@cdo/apps/util/HttpClient';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import {saveImageToBackpack} from './saveImageToBackpack';

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
  return `${month}-${day}-${hh}${mm}${ampm}`;
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

const AssetImageOverflowMenu: React.FC<AssetImageOverflowMenuProps> = ({
  url,
  filename,
  id,
}) => {
  const legacyBackpackApi = useBackpackAPIContext()?.primaryApi;
  const currentUserId = useAppSelector(state => state.currentUser.userId);
  const showToast = useToast();
  const dispatch = useAppDispatch();

  const backpackApi = useMemo(() => {
    if (
      experiments.isEnabledAllowingQueryString(experiments.UNIFIED_BACKPACK)
    ) {
      // The backpack api redirects signed-out users to sign-in, so we only offer the
      // save when we have a user.
      return currentUserId
        ? Lab2Registry.getInstance().getUnifiedBackpackApi()
        : undefined;
    }
    return legacyBackpackApi;
  }, [currentUserId, legacyBackpackApi]);

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
    (api: SaveToBackpackApi) =>
      saveImageToBackpack({
        backpackApi: api,
        url,
        fileName: `${dateTimeName()}.${ext}`,
        showToast,
        onLegacyError: showBackpackError,
      }),
    [url, ext, showToast, showBackpackError]
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
