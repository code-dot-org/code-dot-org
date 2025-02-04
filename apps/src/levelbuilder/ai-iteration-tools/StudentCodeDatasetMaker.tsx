import Papa from 'papaparse';
import React, {useState} from 'react';

import Button from '@cdo/apps/componentLibrary/button/Button';
import TextField from '@cdo/apps/componentLibrary/textField';

import {fetchStudentCodeSamples} from './StudentCodeSamplesApi';

interface StudentCodeSample {
  projectId: string;
  studentCode: string | undefined;
  userId: number | undefined;
}

const StudentCodeDatasetMaker: React.FC = () => {
  const [datasetName, setDatasetName] = useState<string>('');
  const [levelId, setLevelId] = useState<string>('');
  const [scriptId, setScriptId] = useState<string>('');
  const [numSamples, setNumSamples] = useState<string>('25');
  const [pending, setPending] = useState<boolean>(false);
  const [fetchedSamples, setFetchedSamples] = useState<StudentCodeSample[]>([]);

  const downloadCSV = () => {
    const csv = Papa.unparse(fetchedSamples);
    const csvData = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
    const csvURL = window.URL.createObjectURL(csvData);
    const tempLink = document.createElement('a');
    tempLink.href = csvURL;
    tempLink.setAttribute('download', datasetName);
    tempLink.click();
  };

  const getStudentCodeSamples = async () => {
    setPending(true);
    const codeSamples = await fetchStudentCodeSamples(
      Number(numSamples),
      Number(scriptId),
      Number(levelId)
    );
    setFetchedSamples(codeSamples as unknown as StudentCodeSample[]);
    setPending(false);
  };

  return (
    <div>
      <h2>Generate Student Code Datasets</h2>
      <br />
      <div>
        <TextField
          name="Level Id"
          label="Level Id"
          onChange={e => setLevelId(e.target.value)}
          value={levelId}
        />
        <TextField
          name="Script Id"
          label="Script Id"
          onChange={e => setScriptId(e.target.value)}
          value={scriptId}
        />
        <br />
        <br />
        <TextField
          name="Number of Samples"
          label="How many samples of student work do you want?"
          onChange={e => setNumSamples(e.target.value)}
          value={numSamples}
        />
        <br />
        <br />
        <TextField
          name="Dataset Name"
          label="What do you want to name this dataset?"
          helperMessage=" If the dataset is for Meaures of Learning,
          the dataset should be named with the course, unit, lesson and level.
          For example: CSP_U4_L6_L3, for CSP Unit 4, Lesson 6, Level 3."
          onChange={e => setDatasetName(e.target.value)}
          value={datasetName}
        />
        <br />
        <br />
        <div>
          <Button
            text="Fetch Student Code Samples"
            onClick={getStudentCodeSamples}
            disabled={pending}
            isPending={pending}
          />
        </div>
        <br />
        <div>
          <Button
            text="Download CSV"
            onClick={downloadCSV}
            disabled={fetchedSamples.length === 0}
          />
        </div>
      </div>
    </div>
  );
};

export default StudentCodeDatasetMaker;
