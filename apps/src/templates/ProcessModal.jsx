import PropTypes from 'prop-types';
import React, {useEffect, useState} from 'react';

import {fetchStudentCodeSamples} from '@cdo/apps/levelbuilder/ai-iteration-tools/StudentWorkSamplesApi';

import {sources as sourcesApi, files as filesApi} from '../clientApi';

const ProcessModal = ({useFilesApi}) => {
  const [pending, setPending] = useState(false);
  const [versions, setVersions] = useState([]);
  const [codeByVersion, setCodeByVersion] = useState({});

  // Called if the server responds with an error when loading an API request.
  const onAjaxFailure = () => {
    console.log('Error loading version history.');
  };

  // Fetch all code versions for a given list of versions
  const fetchAllCodeVersions = async versionsList => {
    setPending(true);
    const codeMap = {};
    await Promise.all(
      versionsList.map(async version => {
        const studentWorkRequest = {
          studentIds: ['1'], // Example student ID as string, replace with actual
          unitId: 569,
          levelId: 31724, // Example levelId, replace with actual
          codeVersion: version.versionId,
        };
        const codeSamples = await fetchStudentCodeSamples(studentWorkRequest);
        if (
          codeSamples &&
          Array.isArray(codeSamples) &&
          codeSamples.length > 0
        ) {
          const sample = codeSamples[0];
          codeMap[version.versionId] = sample.studentWork;
        } else {
          codeMap[version.versionId] = 'No code found.';
        }
      })
    );
    setCodeByVersion(codeMap);
    setPending(false);
  };

  useEffect(() => {
    const fetchAllVersions = async () => {
      let fetchedVersions = [];
      if (useFilesApi) {
        fetchedVersions = await new Promise(resolve => {
          filesApi.getVersionHistory(
            xhr => resolve(JSON.parse(xhr.responseText)),
            onAjaxFailure
          );
        });
      } else {
        fetchedVersions = await new Promise(resolve => {
          sourcesApi.ajax(
            'GET',
            'main.json/versions',
            xhr => resolve(JSON.parse(xhr.responseText)),
            onAjaxFailure
          );
        });
      }
      setVersions(fetchedVersions);
      fetchAllCodeVersions(fetchedVersions);
    };
    fetchAllVersions();
  }, [useFilesApi]);

  return (
    <div className="version-history-details">
      <h3>Code Changes</h3>
      {versions.length === 0 && <p>No versions available.</p>}
      {versions.length > 0 && (
        <ul>
          {versions.map(version => (
            <li key={version.versionId}>
              <strong>Version ID:</strong> {version.versionId}{' '}
              <strong>Last Modified:</strong>{' '}
              {version.lastModified instanceof Date
                ? version.lastModified.toLocaleString()
                : new Date(version.lastModified).toLocaleString()}
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
ProcessModal.propTypes = {
  useFilesApi: PropTypes.bool.isRequired,
};

export default ProcessModal;
