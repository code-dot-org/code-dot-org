import Button from '@code-dot-org/component-library/button';
import TextField from '@code-dot-org/component-library/textField';
import Papa from 'papaparse';
import React, {useState} from 'react';

import {evaluateFreeResponse} from '@cdo/apps/aiEvaluation/aiEvaluationApi';

import {fetchFreeResponseAnswers} from './StudentWorkSamplesApi';

interface StudentFreeResponseAnswer {
  studentId: number;
  studentDisplayName: string;
  sectionId: number;
  studentWork: string;
}

interface StudentFreeResponseEvaluation extends StudentFreeResponseAnswer {
  aiEvaluation: string;
  aiReasoning: string;
  evaluationCriteria: string;
}

const FreeResponseDatasetMaker: React.FC = () => {
  const [datasetName, setDatasetName] = useState<string>('');
  const [levelId, setLevelId] = useState<string>('');
  const [unitId, setUnitId] = useState<string>('');
  const [numSamples, setNumSamples] = useState<string>('25');
  const [fetchPending, setFetchPending] = useState<boolean>(false);
  const [fetchedSamples, setFetchedSamples] = useState<
    StudentFreeResponseAnswer[]
  >([]);
  const [evaluationPending, setEvaluationPending] = useState<boolean>(false);
  const [evaluatedSamples, setEvaluatedSamples] = useState<
    StudentFreeResponseEvaluation[]
  >([]);

  const downloadCSV = () => {
    const csv = Papa.unparse(evaluatedSamples);
    const csvData = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
    const csvURL = window.URL.createObjectURL(csvData);
    const tempLink = document.createElement('a');
    tempLink.href = csvURL;
    tempLink.setAttribute('download', datasetName);
    tempLink.click();
  };

  const getStudentFreeResponseAnswers = async () => {
    setFetchPending(true);
    const studentWorkRequest = {
      numSamples: Number(numSamples),
      unitId: Number(unitId),
      levelId: Number(levelId),
    };
    const studentAnswers = await fetchFreeResponseAnswers(studentWorkRequest);
    setFetchedSamples(studentAnswers as unknown as StudentFreeResponseAnswer[]);
    setFetchPending(false);
  };

  const getAIEvaluations = async () => {
    setEvaluationPending(true);
    const responsePromises = fetchedSamples.map(async studentResponse => {
      return evaluateStudentResponse(studentResponse);
    });
    await Promise.allSettled(responsePromises);
    setEvaluationPending(false);
  };

  const evaluateStudentResponse = async (
    studentAnswer: StudentFreeResponseAnswer
  ) => {
    const aiResponse = await evaluateFreeResponse(
      studentAnswer,
      parseInt(levelId),
      parseInt(unitId)
    );
    const evaluation = {
      ...studentAnswer,
      aiEvaluation: aiResponse.aiEvaluation,
      aiReasoning: aiResponse.aiReasoning,
      evaluationCriteria: aiResponse.evaluationCriteria,
    };
    setEvaluatedSamples(prevSamples => [...prevSamples, evaluation]);
  };

  return (
    <div>
      <h2>Generate Free Response Datasets</h2>
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
          helperMessage=" If the dataset is for Measures of Learning,
          the dataset should be named with the course, unit, lesson and level.
          For example: CSP_U4_L6_L3, for CSP Unit 4, Lesson 6, Level 3."
          onChange={e => setDatasetName(e.target.value)}
          value={datasetName}
        />
        <br />
        <br />
        <div>
          <Button
            text="Fetch Free Responses"
            onClick={getStudentFreeResponseAnswers}
            disabled={fetchPending}
            isPending={fetchPending}
          />
        </div>
        <br />
        <div>
          <Button
            text="Evaluate Free Responses"
            onClick={getAIEvaluations}
            disabled={fetchedSamples.length === 0}
            isPending={evaluationPending}
          />
        </div>
        <br />
        <div>
          <Button
            text="Download CSV"
            onClick={downloadCSV}
            disabled={evaluatedSamples.length === 0}
          />
        </div>
      </div>
    </div>
  );
};

export default FreeResponseDatasetMaker;
