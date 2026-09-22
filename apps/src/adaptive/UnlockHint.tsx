import React from 'react';

import {unlockingCheckpoint} from './progress';
import {Pathway} from './types';

import moduleStyles from './pathway.module.scss';

interface UnlockHintProps {
  pathway: Pathway;
  abilityId: string;
  /** Focuses the named checkpoint on the map. */
  onSelectCheckpoint: (id: string) => void;
}

/** "Requires <checkpoint>" with the checkpoint name as a link. */
const UnlockHint: React.FunctionComponent<UnlockHintProps> = ({
  pathway,
  abilityId,
  onSelectCheckpoint,
}) => {
  const by = unlockingCheckpoint(pathway, abilityId);
  if (!by) return <>Locked.</>;
  return (
    <>
      Requires{' '}
      <button
        type="button"
        className={moduleStyles.linkButton}
        onClick={() => onSelectCheckpoint(by.id)}
      >
        {by.title}
      </button>
    </>
  );
};

export default UnlockHint;
