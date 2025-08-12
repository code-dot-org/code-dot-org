import Button from '@code-dot-org/component-library/button';
import Link from '@code-dot-org/component-library/link';
import Papa from 'papaparse';
import React, {useState} from 'react';
import './skills.css';

import {
  evaluationFromOpenAI,
  SkillBasedAIResponse,
} from '@cdo/apps/aiEvaluation/aiEvaluationApi';
import {
  AiEvaluationTypes,
  StudentWorkEvaluationStatus,
} from '@cdo/generated-scripts/sharedConstants';

import AccuracyDetails from './AccuracyDetails';

type AIEvaluation = {
  aiEvaluation: string;
  aiReasoning: string;
  evaluationCriteria: string;
  skillEvaluations?: [SkillBasedAIResponse];
};

type EvaluatedExample = ExampleAnswer &
  AIEvaluation & {
    [key in `${string}-${
      | 'evaluationCriteria'
      | 'aiEvaluation'
      | 'aiReasoning'}`]?: string;
  };

type ExampleAnswer = {
  studentWork: string;
  humanEvaluation?: string;
};

const AccuracyCheck: React.FC<{
  levelId: number;
}> = ({levelId}) => {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [studentAnswers, setStudentAnswers] = useState<ExampleAnswer[]>([]);
  const [evaluationPending, setEvaluationPending] = useState<boolean>(false);
  const [aiEvaluatedAnswers, setAiEvaluatedAnswers] = useState<
    EvaluatedExample[]
  >([]);
  const csvSelected = !!csvFile;
  const datasetName = csvFile
    ? `${csvFile.name}-ai-evaluations.csv`
    : 'ai-evaluations.csv';

  function renderStudentWorkEvaluationStatusCodes() {
    return (
      <span>
        {Object.values(StudentWorkEvaluationStatus).map((status, idx) => (
          <React.Fragment key={status}>
            <code>{status}</code>
            {idx < Object.values(StudentWorkEvaluationStatus).length - 1
              ? ', '
              : ''}
          </React.Fragment>
        ))}
      </span>
    );
  }

  const downloadCSV = () => {
    // Add humanEvaluation and evaluationsMatch to each row
    const csvRows = aiEvaluatedAnswers.map(row => {
      const humanEval = row.humanEvaluation || '';
      const aiEval = row.aiEvaluation || '';
      const evaluationsMatch =
        humanEval && aiEval ? String(humanEval === aiEval) : '';
      return {
        ...row,
        humanEvaluation: humanEval,
        evaluationsMatch: evaluationsMatch,
      };
    });
    const csv = Papa.unparse(csvRows);
    const csvData = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
    const csvURL = window.URL.createObjectURL(csvData);
    const tempLink = document.createElement('a');
    tempLink.href = csvURL;
    tempLink.setAttribute('download', datasetName);
    tempLink.click();
  };

  const getAIEvaluations = async () => {
    setEvaluationPending(true);
    const responsePromises = studentAnswers.map(async studentAnswer => {
      return evaluateStudentWork(studentAnswer);
    });
    await Promise.allSettled(responsePromises);
    setEvaluationPending(false);
  };

  // TODO: This function will need to updated to determine
  // whether we're asking for a skill-based evaluation or not.
  const evaluateStudentWork = async (example: ExampleAnswer) => {
    const aiResponse = await evaluationFromOpenAI(
      example.studentWork,
      levelId,
      AiEvaluationTypes.SINGLE_STUDENT
    );
    const parsedResponse = JSON.parse(aiResponse?.content || '{}');
    const evaluation: EvaluatedExample = {
      studentWork: example.studentWork,
      aiEvaluation: parsedResponse?.aiEvaluation,
      aiReasoning: parsedResponse?.aiReasoning,
      evaluationCriteria: parsedResponse?.evaluationCriteria,
      humanEvaluation: example.humanEvaluation,
    };
    if (parsedResponse?.skillEvaluations) {
      for (let i = 0; i < parsedResponse.skillEvaluations.length; i++) {
        const skillEvaluation = parsedResponse.skillEvaluations[i];
        const skillKey = skillEvaluation.skillKey;
        evaluation[`${skillKey}-evaluationCriteria`] =
          skillEvaluation.evaluationCriteria;
        evaluation[`${skillKey}-aiEvaluation`] = skillEvaluation.aiEvaluation;
        evaluation[`${skillKey}-aiReasoning`] = skillEvaluation.aiReasoning;
      }
    }
    setAiEvaluatedAnswers(prevSamples => [...prevSamples, evaluation]);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (file) {
      setCsvFile(file);
    }
  };

  const importCSV = () => {
    if (csvFile) {
      Papa.parse<ExampleAnswer>(csvFile, {
        complete: updateData,
        header: true,
      });
    }
  };

  const updateData = (result: {
    data: {studentWork: string; humanEvaluation?: string}[];
  }) => {
    if (result.data.length === 0) {
      alert('No data found in the CSV file.');
      return;
    }
    const validationErrors: string[] = [];
    result.data.forEach((row, index) => {
      if (!row.studentWork) {
        validationErrors.push(`Row ${index + 1} is missing student work.`);
      }
    });
    if (validationErrors.length > 0) {
      alert(
        `Please fix: \n${validationErrors.join(
          '\n'
        )} \nThen, try the upload again.`
      );
      return;
    } else {
      setStudentAnswers(result.data);
      getAIEvaluations();
    }
  };

  return (
    <div>
      <h2>Check AI Evaluations</h2>
      <p>
        Upload a CSV of sample student solutions. The CSV should have a column
        named <code>studentWork</code>. The AI will evaluate each student work
        sample, and then you can download the results as a CSV file. Review the
        evaluations and reasoning provided by the AI for each sample to see if
        they match your expectations.
        <br />
        <br />
        You can also add a column named <code>humanEvaluation</code> to provide
        evaluations for the student work samples. Please use the rating system
        that includes any of the following:{' '}
        {renderStudentWorkEvaluationStatusCodes()}. The AI's evaluation will be
        compared against the human evaluation, and you can see if they match in
        the downloaded CSV.{' '}
        <Link
          text="Use this template to get started."
          href="https://docs.google.com/spreadsheets/d/19UFD6mnsz_Lj7WcTgSzf5BEuDbIeo1qZvbzvADUlUbA/edit?usp=sharing"
          openInNewTab={true}
          size="s"
        />
      </p>
      <p>
        If you find discrepancies, you can iterate by: editing evaluation
        criteria for a mis-evaluated skill or adjusting the level's
        instructions. For more tips & tricks see this{' '}
        <Link
          text="resource"
          href="https://docs.google.com/document/d/143_guZFrAxY0fywoTvstJvD2V2_0E_0tvrvIJfLbru4/edit?tab=t.0"
          openInNewTab={true}
          size="s"
        />
      </p>
      <p>
        If you are noticing a widespread issue or a specific pattern in the AI's
        evaluations, contact an engineer to help troubleshoot.
      </p>
      <br />
      <div>
        <input
          className="csv-input"
          type="file"
          name="file"
          onChange={handleChange}
        />
      </div>
      <br />
      <div>
        <Button
          text="Upload Examples of Student Answers"
          onClick={importCSV}
          disabled={!csvSelected}
          isPending={evaluationPending}
        />
      </div>
      <br />
      <div>
        <Button
          text="Download CSV"
          onClick={downloadCSV}
          disabled={aiEvaluatedAnswers.length === 0 || evaluationPending}
        />
      </div>
      {aiEvaluatedAnswers.length > 0 && !evaluationPending && (
        <div className="evaluation-complete-notification">
          🎉 Evaluation complete
          <AccuracyDetails evaluations={aiEvaluatedAnswers} />
        </div>
      )}
    </div>
  );
};

export default AccuracyCheck;
