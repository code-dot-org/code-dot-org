import Button from '@code-dot-org/component-library/button';
import React, {useEffect, useState} from 'react';

import {getChatCompletionMessage} from '@cdo/apps/aiTutor/chatApi';
import CollapsibleSection from '@cdo/apps/templates/CollapsibleSection';

import SafeMarkdown from '../SafeMarkdown';

import style from '@cdo/apps/levelbuilder/ai-iteration-tools/ai-tutor/ai-tutor-tester.module.scss';
import {evaluateStudentWork} from '@cdo/apps/aiEvaluation/evaluationApi';

interface StudentAnswer {
  user_id: number;
  text: string;
  student_display_name: string;
  aiEvaluation: string;
  aiReasoning: string;
}

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
  const [evaluations, setEvaluations] = useState<StudentAnswer[]>([]);
  const [evaluationCount, setEvaluationCount] = useState<number>(0);
  const [aiSummary, setAiSummary] = useState<string>('');
  const evaluationComplete =
    evaluationCount > 0 && responses.length === evaluationCount;

  console.log('evlautionComplete', evaluationComplete);
  console.log('evaluationCount', evaluationCount);
  console.log('responses.length', responses.length);

  useEffect(() => {
    if (evaluationComplete) {
      setEvaluationsPending(false);
      summarizeStudentEvaluations(evaluations);
    }
  }, [evaluations, evaluationComplete]);

  const getAIEvaluations = async () => {
    setEvaluationsPending(true);
    const responsePromises = responses.map(async studentResponse => {
      return evaluateStudentResponse(studentResponse);
    });

    await Promise.allSettled(responsePromises);
  };

  const evaluateStudentResponse = async (studentAnswer: StudentAnswer) => {
    const studentWorkSample = {
      studentId: studentAnswer.user_id,
      studentDisplayName: studentAnswer.student_display_name,
      studentWork: studentAnswer.text,
      levelId: levelData.levelId,
      unitId: levelData.unitId,
    };
    const aiResponse = await evaluateStudentWork(studentWorkSample);
    const evaluation = {
      ...studentAnswer,
      aiEvaluation: aiResponse.ai_evaluation,
      aiReasoning: aiResponse.ai_reasoning,
    };
    setEvaluations(prevEvaluations => [...prevEvaluations, evaluation]);
    setEvaluationCount(prevCount => prevCount + 1);
  };

  const summarizeStudentEvaluations = async (evaluations: StudentAnswer[]) => {
    const basePrompt =
      'You are a teaching assistant for a high school AP Computer Science class where the students are learning JavaScript.';
    const sectionPrompt = `${basePrompt} Please review the evaluations of the student responses and based on the results indicate whether the teacher should "review the concept" or "move on to the next lesson". Provide one sentence with your reasoning.`;
    const chatApiResponse = await getChatCompletionMessage(
      evaluations.map(evaluation => evaluation.aiEvaluation).join(' '),
      [],
      sectionPrompt
    );
    const summary = chatApiResponse.assistantResponse;
    if (summary) {
      setAiSummary(summary);
    } else {
      setAiSummary('Uh oh!');
    }
  };

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
                  <tr key={evaluation.user_id} className={style.row}>
                    <td className={style.cell}>
                      <div>{evaluation.student_display_name}</div>
                    </td>
                    <td className={style.cell}>
                      <div>{evaluation.text}</div>
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
