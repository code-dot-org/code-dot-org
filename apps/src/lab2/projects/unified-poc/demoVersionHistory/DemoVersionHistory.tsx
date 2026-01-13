import {Button} from '@code-dot-org/component-library/button';
import React, {useState} from 'react';

import {ProjectVersion} from '../../../types';

import styles from './styles.module.scss';

interface Props {
  isLoading: boolean;
  isEditable: boolean;
  versionList: ProjectVersion[];
  currentVersion: string | undefined;
  previewVersion: (version: string) => void;
  restoreVersion: (version: string) => void;
  createCommit: (description: string) => void;
}

/** Low-fidelity version history to demonstrate usage of useSources hook. NOT meant to replace VersionHistoryPanel.tsx */
const DemoVersionHistory: React.FC<Props> = ({
  isLoading,
  isEditable,
  versionList,
  currentVersion,
  previewVersion,
  restoreVersion,
  createCommit,
}) => {
  const [commitMessage, setCommitMessage] = useState('');
  return (
    <div className={styles.container}>
      <h3>Demo Version History</h3>
      <p>
        using <code>useSources</code> hook
      </p>
      <div className={styles.row}>
        Loading:{' '}
        <p className={isLoading ? styles.green : styles.red}>
          {isLoading ? 'true' : 'false'}
        </p>
      </div>
      <div className={styles.row}>
        Editable:{' '}
        <p className={isEditable ? styles.green : styles.red}>
          {isEditable ? 'true' : 'false'}
        </p>
      </div>
      {versionList.map(({versionId, isLatest, comment, lastModified}) => {
        const isCurrent = currentVersion === versionId;
        return (
          <div className={styles.version} key={versionId}>
            {lastModified && <p>{new Date(lastModified).toLocaleString()}</p>}
            {isLatest && <p className={styles.green}>Latest</p>}
            {isCurrent && <p className={styles.green}>Current</p>}
            {comment && <p>{comment}</p>}
            <div className={styles.row}>
              <Button
                size="xs"
                onClick={() => previewVersion(versionId)}
                text={isCurrent ? 'Viewing' : 'View'}
                iconLeft={{iconName: isCurrent ? 'check' : 'eye'}}
                type="secondary"
                disabled={isLoading || isCurrent}
              />
              {isCurrent && !isLatest && (
                <Button
                  size="xs"
                  onClick={() => restoreVersion(versionId)}
                  text={'Restore'}
                  iconLeft={{iconName: 'arrow-rotate-left'}}
                  disabled={isLoading}
                />
              )}
            </div>
            {isLatest && isCurrent && !comment && (
              <>
                <textarea
                  placeholder="Enter commit message"
                  value={commitMessage}
                  onChange={e => setCommitMessage(e.target.value)}
                  disabled={isLoading}
                />
                <Button
                  size="xs"
                  onClick={() => {
                    createCommit(commitMessage);
                    setCommitMessage('');
                  }}
                  text={'Commit'}
                  iconLeft={{iconName: 'file'}}
                  disabled={isLoading || !commitMessage}
                />
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default DemoVersionHistory;
