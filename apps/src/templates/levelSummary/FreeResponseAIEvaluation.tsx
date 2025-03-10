import Button from '@code-dot-org/component-library/button';
import React, {useEffect, useState} from 'react';

import {
  StudentWorkEvaluation,
  StudentAnswer,
  evaluateStudentWork,
  summarizeSectionEvaluations,
} from '@cdo/apps/aiEvaluation/evaluationApi';
import CollapsibleSection from '@cdo/apps/templates/CollapsibleSection';

import SafeMarkdown from '../SafeMarkdown';

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
  const [aiSummary, setAiSummary] = useState<string>('');
  const evaluationComplete =
    evaluationCount > 0 && responses.length === evaluationCount;

  const getAIEvaluations = async () => {
    setEvaluationsPending(true);
    const responsePromises = responses.map(async studentResponse => {
      return evaluateStudentAnswer(studentResponse);
    });

    await Promise.allSettled(responsePromises);
  };

  const evaluateStudentAnswer = async (studentAnswer: StudentAnswer) => {
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

  const summarizeEvaluations = async (evaluations: StudentWorkEvaluation[]) => {
    console.log('summaryEvaluations was called');
    const basePrompt =
      'You are a teaching assistant for a high school AP Computer Science class where the students are learning JavaScript.';
    const sectionPrompt = `${basePrompt} Please review the evaluations of the student responses and based on the results indicate whether the teacher should "review the concept" or "move on to the next lesson". Provide one sentence with your reasoning.`;
    const aiResponse = await summarizeSectionEvaluations(
      evaluations,
      levelData.levelId,
      levelData.unitId,
      sectionPrompt
    );
    console.log('aiResponse in summarizeEvaluations', aiResponse);
    const summary = aiResponse.aiEvaluation;
    if (summary) {
      setAiSummary(summary);
    } else {
      setAiSummary('Uh oh!');
    }
  };

  useEffect(() => {
    if (evaluationComplete) {
      setEvaluationsPending(false);
      summarizeEvaluations(evaluations);
    }
  }, [evaluations, evaluationComplete, summarizeEvaluations]);

  console.log('evaluationCount', evaluationCount);
  console.log('evaluations', evaluations);

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
          <SafeMarkdown markdown={aiSummary} />
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
