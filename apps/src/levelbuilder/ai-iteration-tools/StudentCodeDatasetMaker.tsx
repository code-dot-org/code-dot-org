import Button from '@code-dot-org/component-library/button';
import Checkbox from '@code-dot-org/component-library/checkbox';
import TextField from '@code-dot-org/component-library/textField';
import Papa from 'papaparse';
import React, {useState} from 'react';

import {
  AIResponse,
  evaluateStudentWorkOverall,
  evaluateStudentWorkSkills,
  StudentAnswer,
} from '@cdo/apps/aiEvaluation/aiEvaluationApi';

import {fetchStudentCodeSamples} from './StudentWorkSamplesApi';

type EvaluatedCodeSample =
  | OverallEvaluatedCodeSample
  | SkillsEvaluatedCodeSample;

type OverallEvaluatedCodeSample = StudentAnswer & AIResponse;

type SkillsEvaluatedCodeSample = StudentAnswer & {
  [key in `skill-${string}${
    | 'evaluationCriteria'
    | 'aiEvaluation'
    | 'aiReasoning'}`]?: string;
};

const StudentCodeDatasetMaker: React.FC = () => {
  const [datasetName, setDatasetName] = useState<string>('');
  const [levelId, setLevelId] = useState<string>('');
  const [unitId, setUnitId] = useState<string>('');
  const [evaluateSkills, setEvaluateSkills] = useState<boolean>(false);
  const [studentIds, setStudentIds] = useState<string>('');
  const [pending, setPending] = useState<boolean>(false);
  const [fetchedSamples, setFetchedSamples] = useState<StudentAnswer[]>([]);
  const [evaluationPending, setEvaluationPending] = useState<boolean>(false);
  const [evaluatedSamples, setEvaluatedSamples] = useState<
    EvaluatedCodeSample[]
  >([]);

  const downloadCSV = () => {
    const processedSamples = evaluatedSamples.map(sample => {
      let studentWorkString = sample.studentWork;
      if (
        typeof sample.studentWork === 'object' &&
        sample.studentWork !== null
      ) {
        studentWorkString = Object.entries(sample.studentWork)
          .map(([filename, contents]) => `${filename}:\n${contents}`)
          .join('\n\n');
      }
      return {
        ...sample,
        studentWork: studentWorkString,
      };
    });
    const csv = Papa.unparse(processedSamples);
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
      studentIds: studentIds.split(','),
      unitId: Number(unitId),
      levelId: Number(levelId),
    };
    const codeSamples = await fetchStudentCodeSamples(studentWorkRequest);
    if (codeSamples?.length === 0) {
      alert('No samples found for the given parameters.');
    } else {
      const fetchedCodeSamples = codeSamples as unknown as StudentAnswer[];
      const filteredCodeSamples = fetchedCodeSamples.filter(
        item => item !== null
      );
      setFetchedSamples(filteredCodeSamples);
    }
    setPending(false);
  };

  const getAIEvaluations = async () => {
    setEvaluationPending(true);
    const responsePromises = fetchedSamples.map(async studentResponse => {
      const studentWorkToEvaluate = {
        studentId: studentResponse.studentId,
        studentDisplayName: studentResponse.studentDisplayName,
        studentWork: studentResponse.studentWork,
      };
      return evaluateStudentCode(studentWorkToEvaluate as StudentAnswer);
    });
    await Promise.allSettled(responsePromises);
    setEvaluationPending(false);
  };

  const evaluateStudentCode = async (studentAnswer: StudentAnswer) => {
    let aiResponse;
    if (evaluateSkills) {
      aiResponse = await evaluateStudentWorkSkills(
        studentAnswer,
        parseInt(levelId),
        parseInt(unitId)
      );
    } else {
      aiResponse = await evaluateStudentWorkOverall(
        studentAnswer,
        parseInt(levelId),
        parseInt(unitId)
      );
    }

    let evaluation: EvaluatedCodeSample;

    if (aiResponse.skillEvaluations) {
      evaluation = {
        ...studentAnswer,
      };
      for (let i = 0; i < aiResponse.skillEvaluations.length; i++) {
        const skillEvaluation = aiResponse.skillEvaluations[i];
        const skillKey = skillEvaluation.skillKey;
        evaluation[`skill-${skillKey}-evaluationCriteria`] =
          skillEvaluation.evaluationCriteria;
        evaluation[`skill-${skillKey}-aiEvaluation`] =
          skillEvaluation.aiEvaluation;
        evaluation[`skill-${skillKey}-aiReasoning`] =
          skillEvaluation.aiReasoning;
      }
    } else {
      evaluation = {
        ...studentAnswer,
        evaluationCriteria: aiResponse.evaluationCriteria,
        aiEvaluation: aiResponse.aiEvaluation,
        aiReasoning: aiResponse.aiReasoning,
      };
    }
    setEvaluatedSamples(prevSamples => [...prevSamples, evaluation]);
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
        <TextField
          name="Student Ids"
          label="Student Ids (comma separated)"
          onChange={e => setStudentIds(e.target.value)}
          value={studentIds}
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
        <Checkbox
          label={'Evaluate skills (if any) associated with the level'}
          name={'evaluateSkills'}
          checked={evaluateSkills}
          size="s"
          onChange={e => setEvaluateSkills(e.target.checked)}
        />
        <br />
        <br />
        <div>
          <Button
            text="Evaluate Student Code Samples"
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

export default StudentCodeDatasetMaker;
