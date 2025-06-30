import React, {useEffect, useState} from 'react';

import {fetchStudentCodeSamples} from '@cdo/apps/levelbuilder/ai-iteration-tools/StudentWorkSamplesApi';

import {StudentAnswer} from '../aiEvaluation/aiEvaluationApi';

type CodeVersion = {
  versionId: string;
  lastModified: Date;
};

export interface VersionHistoryDetailsProps {
  versions: CodeVersion[];
}

const VersionHistoryDetails: React.FC<VersionHistoryDetailsProps> = ({
  versions,
}) => {
  const [pending, setPending] = useState<boolean>(false);
  const [codeByVersion, setCodeByVersion] = useState<{
    [versionId: string]: string;
  }>({});

  useEffect(() => {
    const fetchAllCodeVersions = async () => {
      setPending(true);
      const codeMap: {[versionId: string]: string} = {};
      await Promise.all(
        versions.map(async version => {
          const studentWorkRequest = {
            studentIds: ['1'], // Example student ID, replace with actual
            unitId: 569, // Example levelId, replace with actual
            levelId: 31724, // Example levelId, replace with actual
            codeVersion: version.versionId,
          };
          const codeSamples = await fetchStudentCodeSamples(studentWorkRequest);
          if (
            codeSamples &&
            Array.isArray(codeSamples) &&
            codeSamples.length > 0
          ) {
            const sample = codeSamples[0] as StudentAnswer;
            codeMap[version.versionId] = sample.studentWork;
          } else {
            codeMap[version.versionId] = 'No code found.';
          }
        })
      );
      setCodeByVersion(codeMap);
      setPending(false);
    };
    if (versions.length > 0) {
      fetchAllCodeVersions();
    }
  }, [versions]);

  return (
    <div className="version-history-details">
      <h3>Code Changes</h3>
      {versions.length === 0 && <p>No versions available.</p>}
      {versions.length > 0 && (
        <ul>
          {versions.map(version => (
            <li key={version.versionId}>
              <strong>Version ID:</strong> {version.versionId} -
              <strong>Last Modified:</strong>{' '}
              {version.lastModified.toLocaleString()}
              <br />
              <strong>Code:</strong>
              {pending ? (
                <span>Loading...</span>
              ) : (
                <span>{codeByVersion[version.versionId]}</span>
              )}
              <br />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default VersionHistoryDetails;
