import React, {useState, useEffect} from 'react';

import PanelsView from '@cdo/apps/panels/PanelsView';
import {Panel} from '@cdo/apps/panels/types';

interface SlidesViewerProps {
  panels: Panel[];
  // Where to navigate when the user clicks past the final slide. Set
  // to the lesson's show URL by the page entry; null disables the
  // continue navigation.
  continueUrl?: string;
}

// Minimal panels viewer that mounts PanelsView (the lab2-free renderer)
// without lab2's progress, dialog, or analytics machinery. The slides
// JSON has no level/script context to feed those layers anyway.
const SlidesViewer: React.FC<SlidesViewerProps> = ({panels, continueUrl}) => {
  // PanelsView reads window size in its parent (useWindowSize is in
  // PanelsLabView). We replicate the minimum needed here.
  const [size, setSize] = useState<[number, number]>([
    window.innerWidth,
    window.innerHeight,
  ]);
  useEffect(() => {
    const handler = () => setSize([window.innerWidth, window.innerHeight]);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  if (!panels.length) {
    return (
      <div style={{padding: '40px', textAlign: 'center', color: '#555'}}>
        No slides have been generated for this lesson yet.
      </div>
    );
  }

  return (
    <PanelsView
      panels={panels}
      onContinue={() => {
        if (continueUrl) {
          window.location.href = continueUrl;
        }
      }}
      targetWidth={size[0]}
      targetHeight={size[1]}
      offerBrowserTts={false}
      levelId={null}
    />
  );
};

export default SlidesViewer;
