import Button from '@code-dot-org/component-library/button';
import React, {useEffect, useState} from 'react';

import {
  AIResponse,
  StudentAnswer,
  StudentWorkEvaluation,
  evaluateStudentWork,
  summarizeEvaluations,
} from '@cdo/apps/aiEvaluation/evaluationApi';
import CollapsibleSection from '@cdo/apps/templates/CollapsibleSection';

import style from '@cdo/apps/levelbuilder/ai-iteration-tools/ai-tutor/ai-tutor-tester.module.scss';

interface LevelData {
  levelId: number;
  unitId: number;
}

interface FreeResponseAIEvaluationProps {
  responses: StudentAnswer[];
  levelData: LevelData;
}

const FreeResponseAIEvaluation: React.FunctionComponent<
  FreeResponseAIEvaluationProps
> = ({responses, levelData}) => {
  const [evaluationsPending, setEvaluationsPending] = useState<boolean>(false);
  const [evaluations, setEvaluations] = useState<StudentWorkEvaluation[]>([]);
  const [evaluationCount, setEvaluationCount] = useState<number>(0);
  const [aiSummary, setAiSummary] = useState<AIResponse>();
  const evaluationComplete =
    evaluationCount > 0 && responses.length === evaluationCount;

  const getAIEvaluations = async () => {
    setEvaluationsPending(true);
    const responsePromises = responses.map(async studentResponse => {
      return evaluateStudentResponse(studentResponse);
    });

    await Promise.allSettled(responsePromises).then(() =>
      summarizeStudentEvaluations(evaluations)
    );
  };

  const evaluateStudentResponse = async (studentAnswer: StudentAnswer) => {
    const aiResponse = await evaluateStudentWork(
      studentAnswer,
      levelData.levelId,
      levelData.unitId
    );
    const evaluation = {
      ...studentAnswer,
      aiEvaluation: aiResponse.aiEvaluation,
      aiReasoning: aiResponse.aiReasoning,
    };
    setEvaluations(prevEvaluations => [...prevEvaluations, evaluation]);
    setEvaluationCount(prevCount => prevCount + 1);
  };

  const summarizeStudentEvaluations = async (
    evaluations: StudentWorkEvaluation[]
  ) => {
    const aiSummary = await summarizeEvaluations(
      evaluations,
      levelData.levelId,
      levelData.unitId
    );
    const summary = aiSummary;
    if (summary) {
      setAiSummary(summary);
    } else {
      setAiSummary({
        aiEvaluation: 'Uh oh!',
        aiReasoning: 'Something went wrong',
      });
    }
  };

  useEffect(() => {
    if (evaluationComplete) {
      setEvaluationsPending(false);
    }
  }, [evaluationComplete]);

  return (
    <div>
      <h2>AI Analysis (prototype)</h2>
      <Button
        text="Evaluate student responses"
        onClick={getAIEvaluations}
        disabled={!responses.length || evaluationsPending}
        isPending={evaluationsPending}
      />
      {evaluationComplete && aiSummary && (
        <div>
          <br />
          <h3>Reccommendation: {aiSummary.aiEvaluation}</h3>
          <h4>Reasoning: {aiSummary.aiReasoning}</h4>
          <CollapsibleSection
            headerContent={
              <h3>AI Evaluations of Individual Student Responses</h3>
            }
          >
            <table>
              <thead>
                {evaluations.map(evaluation => (
                  <tr key={evaluation.studentId} className={style.row}>
                    <td className={style.cell}>
                      <div>{evaluation.studentDisplayName}</div>
                    </td>
                    <td className={style.cell}>
                      <div>{evaluation.studentWork}</div>
                    </td>
                    <td className={style.cell}>
                      <div>{evaluation.aiEvaluation}</div>
                      <div>{evaluation.aiReasoning}</div>
                    </td>
                  </tr>
                ))}
              </thead>
            </table>
          </CollapsibleSection>
        </div>
      )}
    </div>
  );
};

export default FreeResponseAIEvaluation;
