import React, {useEffect, useState} from 'react';

import {getManifest} from '@cdo/apps/assetManagement/animationLibraryApi';
import {PICKER_TYPE} from '@cdo/apps/p5lab/AnimationPicker/AnimationPicker';
import AnimationTab from '@cdo/apps/p5lab/AnimationTab/AnimationTab';
import {P5LabInterfaceMode, P5LabType} from '@cdo/apps/p5lab/constants';
import ErrorDialogStack from '@cdo/apps/p5lab/ErrorDialogStack';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import moduleStyles from './sprite-lab2-view.module.scss';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const AnimationTabAny = AnimationTab as any;

/**
 * The Items tab. For now this embeds the classic Sprite Lab animation editor
 * (AnimationTab: animation list + Piskel pixel editor + library/upload picker),
 * which reads from the same animationList redux slice the runtime preloads. The
 * Game2-style AI image generator lands in a later phase alongside this editor.
 */
const ItemsTab: React.FunctionComponent = () => {
  const channelId = useAppSelector(state => state.lab.channel?.id);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [libraryManifest, setLibraryManifest] = useState<any>({});

  useEffect(() => {
    const locale =
      (window.appOptions as {locale?: string} | undefined)?.locale || 'en_us';
    getManifest('spritelab', locale).then(setLibraryManifest);
  }, []);

  return (
    <div className={moduleStyles.itemsTab}>
      <AnimationTabAny
        channelId={channelId}
        defaultQuery={{categoryQuery: '', searchQuery: ''}}
        libraryManifest={libraryManifest}
        shouldWarnOnAnimationUpload={true}
        hideAnimationNames={false}
        hideBackgrounds={false}
        hideCostumes={false}
        labType={P5LabType.SPRITELAB}
        pickerType={PICKER_TYPE.spritelab}
        interfaceMode={P5LabInterfaceMode.ANIMATION}
        uploadsEnabled={true}
      />
      <ErrorDialogStack />
    </div>
  );
};

export default ItemsTab;
