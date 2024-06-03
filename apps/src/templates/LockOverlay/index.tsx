import React from 'react';

import './style.scss';

interface LockOverlayProps {
  isLocked?: boolean | undefined;
  children: React.ReactNode;
}

const LockOverlay: React.FC<LockOverlayProps> = ({isLocked = true, children}) =>
  isLocked ? <div className="lock-overlay">{children}</div> : <>{children}</>;

export default LockOverlay;
