import classNames from 'classnames';
import React, {useLayoutEffect, useRef, useState} from 'react';

import moduleStyles from '../sprite-lab2-view.module.scss';

interface PlayBarGroupsProps {
  /** The game's buttons. */
  children: React.ReactNode;
  /** The share page's buttons, after the game's. */
  share?: React.ReactNode;
}

/**
 * The buttons of the bar under the game. On a share page the share buttons
 * follow the game's, with a line between the two groups while they are on
 * one row.
 */
const PlayBarGroups: React.FunctionComponent<PlayBarGroupsProps> = ({
  children,
  share,
}) => {
  const gameRef = useRef<HTMLDivElement>(null);
  const shareRef = useRef<HTMLDivElement>(null);
  const [divided, setDivided] = useState(false);
  const hasShare = !!share;
  useLayoutEffect(() => {
    const game = gameRef.current;
    const shareGroup = shareRef.current;
    if (!hasShare || !game || !shareGroup) {
      setDivided(false);
      return;
    }
    // CSS cannot tell when the share buttons have wrapped onto a row of
    // their own, so the two groups' positions are compared.
    const check = () => {
      const a = game.getBoundingClientRect();
      const b = shareGroup.getBoundingClientRect();
      setDivided(
        game.childElementCount > 0 && a.top < b.bottom && b.top < a.bottom
      );
    };
    check();
    if (typeof ResizeObserver === 'undefined') {
      return;
    }
    const observer = new ResizeObserver(check);
    [game, shareGroup, game.parentElement].forEach(
      element => element && observer.observe(element)
    );
    return () => observer.disconnect();
  }, [hasShare]);

  return (
    <div className={moduleStyles.playBarButtons}>
      <div ref={gameRef} className={moduleStyles.playBarGroup}>
        {children}
      </div>
      {hasShare && (
        <div
          ref={shareRef}
          className={classNames(
            moduleStyles.playBarGroup,
            divided && moduleStyles.playBarGroupDivided
          )}
        >
          {share}
        </div>
      )}
    </div>
  );
};

export default PlayBarGroups;
