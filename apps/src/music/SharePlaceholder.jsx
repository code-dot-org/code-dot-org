import React, {useContext, useState} from 'react';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import {AnalyticsContext} from './context';

const SharePlaceholder = () => {
  const [shareShowing, setShareShowing] = useState(false);
  const analyticsReporter = useContext(AnalyticsContext);

  const shareClicked = () => {
    if (!shareShowing) {
      analyticsReporter.onButtonClicked('share');
    }
    setShareShowing(true);
  };

  return (
    <div
      id="share-placeholder"
      onClick={shareClicked}
      style={{
        backgroundColor: '#222',
        width: 140,
        borderRadius: 4,
        padding: 10,
        boxSizing: 'border-box',
        position: 'relative',
        textAlign: 'center',
        cursor: shareShowing ? 'auto' : 'pointer'
      }}
    >
      {!shareShowing && (
        <div>
          <FontAwesome icon={'share-square-o'} />
          &nbsp; Share
        </div>
      )}
      {shareShowing && (
        <div>
          <FontAwesome icon={'clock-o'} />
          &nbsp; Sharing is under construction. Check back soon.
        </div>
      )}
    </div>
  );
};

export default SharePlaceholder;
