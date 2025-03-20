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
  levelInstructions: string;
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

  const basePrompt =
    'You are a teaching assistant for a high school AP Computer Science class where the students are learning JavaScript.';

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
    const systemPrompt = `${basePrompt} Please review the student's work. Respond in correctly formatted JSON.
    evaluationCriteria should just be a copy of ${levelData.levelInstructions}.
    aiEvaluation should be your assessment of the student's work. Respond with "great", "ok", or "needs revision".
    aiReasoning should be one sentence with your reasoning.`;
    const aiResponse = await evaluateStudentWork(
      studentAnswer,
      levelData.levelId,
      levelData.unitId,
      systemPrompt
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
    const sectionPrompt = `${basePrompt} Please review the evaluations of the student responses. Respond in correctly formatted JSON.
    evaluationCriteria should just be a copy of "Summarize".
    aiEvaluation should be your assessment of the class's overall work. Respond with "review the concept" or "move on to the next lesson".
    aiReasoning should be one sentence with your reasoning including the names of any students who need more help.`;
    const aiSummary = await summarizeEvaluations(
      evaluations,
      levelData.levelId,
      levelData.unitId,
      sectionPrompt
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
