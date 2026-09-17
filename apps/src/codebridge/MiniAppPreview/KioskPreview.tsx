import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import CodebridgeRegistry from '@codebridge/CodebridgeRegistry';
import React, {useCallback, useEffect, useState} from 'react';

import Kiosk from '@cdo/apps/miniApps/kiosk/Kiosk';
import KioskVisualization from '@cdo/apps/miniApps/kiosk/KioskVisualization';
import {KioskEvent, KioskScene} from '@cdo/apps/miniApps/kiosk/types';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import MiniAppEmptyState from './MiniAppEmptyState';

import moduleStyles from './mini-app-preview.module.scss';

// Preview panel for the kiosk mini app. Unlike the other mini apps this one
// talks back: a press is delivered to the waiting program as console input,
// which is the round trip that already carries input().
const KioskPreview: React.FunctionComponent = () => {
  const {sendConsoleInput} = useCodebridgeContext();
  const [scene, setScene] = useState<KioskScene | null>(null);
  const isRunning = useAppSelector(state => state.lab2System.isRunning);

  useEffect(() => {
    const kiosk = new Kiosk(setScene);
    CodebridgeRegistry.getInstance().setKiosk(kiosk);

    // Drop the registry's reference on unmount, so a later stop cannot reach
    // this kiosk after its DOM is gone.
    return () => {
      kiosk.reset();
      CodebridgeRegistry.getInstance().setKiosk(null);
    };
  }, []);

  const onElementEvent = useCallback(
    (event: KioskEvent) => {
      // Nothing is waiting for an event once the program has ended, and sending
      // then would be reported as an error the student cannot act on.
      if (!isRunning) {
        return;
      }
      sendConsoleInput?.(JSON.stringify(event));
    },
    [isRunning, sendConsoleInput]
  );

  return (
    <div className={moduleStyles.miniAppContainer}>
      {scene ? (
        <KioskVisualization scene={scene} onElementEvent={onElementEvent} />
      ) : (
        <MiniAppEmptyState
          iconName="display"
          title="Nothing on screen yet"
          description="Press Run to see your code in action."
        />
      )}
    </div>
  );
};

export default KioskPreview;
