import Button from '@code-dot-org/component-library/button';
import Checkbox from '@code-dot-org/component-library/checkbox';
import TextField from '@code-dot-org/component-library/textField';
import Papa from 'papaparse';
import React, {useState} from 'react';

import {fetchStudentCodeSamples} from './StudentCodeSamplesApi';

interface StudentCodeSample {
  projectId: string;
  studentCode: string | undefined;
  codeVersion?: string;
  userId: number | undefined;
  aiEvaluation?: string;
  aiReasoning?: string;
  evaluationCriteria?: string;
}

const StudentCodeDatasetMaker: React.FC = () => {
  const [datasetName, setDatasetName] = useState<string>('');
  const [levelId, setLevelId] = useState<string>('');
  const [unitId, setUnitId] = useState<string>('');
  const [numSamples, setNumSamples] = useState<string>('25');
  const [includeAiEvaluations, setIncludeAiEvaluations] =
    useState<boolean>(false);
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
    const studentWorkRequest = {
      includeAiEvaluations: includeAiEvaluations,
      numSamples: Number(numSamples),
      unitId: Number(unitId),
      levelId: Number(levelId),
    };
    const codeSamples = await fetchStudentCodeSamples(studentWorkRequest);
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
          name="Unit Id"
          label="Unit Id"
          onChange={e => setUnitId(e.target.value)}
          value={unitId}
        />
        <br />
        <br />
        <Checkbox
          name="include AI evaluations"
          label="Include AI evaluations"
          onChange={() => setIncludeAiEvaluations(!includeAiEvaluations)}
          checked={includeAiEvaluations}
        />
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
