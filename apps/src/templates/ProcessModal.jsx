import './applab-diff-view.css';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import PropTypes from 'prop-types';
import React, {useEffect, useState} from 'react';
import ReactDiffViewer, {DiffMethod} from 'react-diff-viewer';

import {getCodeDiffSummary} from '@cdo/apps/aiEvaluation/codeDiffApi';
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
  const fetchAllCodeSamples = async versionsList => {
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
      fetchAllCodeSamples(fetchedVersions);
    };
    fetchAllVersions();
  }, [useFilesApi]);

  const getDiffSummary = async (oldCode, newCode) => {
    const result = await getCodeDiffSummary(oldCode, newCode);
    const summary = JSON.parse(result['content'])['codeDiffSummary'];
    console.log('Diff Summary:', summary);
    return (
      <div className="applab-diff-summary">
        <strong>Diff Summary:</strong>{' '}
        {summary ? summary : 'No changes detected.'}
      </div>
    );
  };

  // Sort versions by lastModified (descending, newest first)
  const sortedVersions = [...versions].sort((a, b) => {
    const aTime = new Date(a.lastModified).getTime();
    const bTime = new Date(b.lastModified).getTime();
    return bTime - aTime;
  });

  return (
    <div className="version-history-details">
      <h3>Code Changes</h3>
      {versions.length === 0 && <p>No versions available.</p>}
      {versions.length > 0 && (
        <List style={{maxHeight: '400px', overflow: 'auto'}}>
          {sortedVersions.map((version, index) => (
            <ListItem key={version.versionId} alignItems="flex-start">
              <ListItemText
                primary={
                  <>
                    <strong>Version ID:</strong> {version.versionId}
                    <br />
                    <strong>Last Modified:</strong>{' '}
                    {version.lastModified instanceof Date
                      ? version.lastModified.toLocaleString()
                      : new Date(version.lastModified).toLocaleString()}
                    <br />
                    <strong>Code Changes:</strong>{' '}
                    {pending ? (
                      <span>Loading...</span>
                    ) : (
                      <span>{codeByVersion[version.versionId]}</span>
                    )}
                    {index < versions.length - 1 && (
                      <div className="applab-small-diff">
                        <ReactDiffViewer
                          oldValue={
                            codeByVersion[sortedVersions[index + 1].versionId]
                          }
                          newValue={
                            codeByVersion[sortedVersions[index].versionId]
                          }
                          splitView={true}
                          showDiffOnly={true}
                          extraLinesSurroundingDiff={0}
                          hideLineNumbers={false}
                          compareMethod={DiffMethod.WORDS}
                        />
                        <span>
                          {codeByVersion[sortedVersions[index + 1].versionId] &&
                            codeByVersion[sortedVersions[index].versionId] &&
                            getDiffSummary(
                              codeByVersion[
                                sortedVersions[index + 1].versionId
                              ],
                              codeByVersion[sortedVersions[index].versionId]
                            )}
                        </span>
                      </div>
                    )}
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      )}
    </div>
  );
};

ProcessModal.propTypes = {
  useFilesApi: PropTypes.bool.isRequired,
};

export default ProcessModal;
