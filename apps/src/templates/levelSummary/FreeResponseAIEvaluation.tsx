import Button from '@code-dot-org/component-library/button';
import React, {useEffect, useState} from 'react';

import {getChatCompletionMessage} from '@cdo/apps/aiTutor/chatApi';
import CollapsibleSection from '@cdo/apps/templates/CollapsibleSection';

import SafeMarkdown from '../SafeMarkdown';

import style from '@cdo/apps/levelbuilder/ai-iteration-tools/ai-tutor/ai-tutor-tester.module.scss';

interface StudentResponse {
  user_id: number;
  text: string;
  student_display_name: string;
  aiEvaluation: string;
}

interface FreeResponseAIEvaluationProps {
  responses: StudentResponse[];
  levelInstructions: string;
}
const FreeResponseAIEvaluation: React.FunctionComponent<
  FreeResponseAIEvaluationProps
> = ({responses, levelInstructions}) => {
  const [evaluationsPending, setEvaluationsPending] = useState<boolean>(false);
  const [evaluations, setEvaluations] = useState<StudentResponse[]>([]);
  const [evaluationCount, setEvaluationCount] = useState<number>(0);
  const [aiSummary, setAiSummary] = useState<string>('');
  const evaluationComplete = responses.length === evaluationCount;

  useEffect(() => {
    if (evaluationComplete) {
      setEvaluationsPending(false);
      summarizeStudentEvaluations(evaluations);
    }
  }, [evaluations, evaluationComplete]);

  const basePrompt =
    'You are a teaching assistant for a high school AP Computer Science class where the students are learning JavaScript.';

  const getAIEvaluations = async () => {
    setEvaluationsPending(true);
    const responsePromises = responses.map(async studentResponse => {
      return evaluateStudentResponse(studentResponse);
    });

    await Promise.allSettled(responsePromises);
  };

  const evaluateStudentResponse = async (studentResponse: StudentResponse) => {
    const studentPrompt = `${basePrompt} Please review the student's responses and indicate whether the response is "great", "ok", or "needs revision". Provide one sentence with your reasoning. The student's instructions are: ${levelInstructions}.`;
    const studentResponseString = `${studentResponse.student_display_name} replied ${studentResponse.text}`;
    const chatApiResponse = await getChatCompletionMessage(
      studentResponseString,
      [],
      studentPrompt
    );
    const aiEvaluation = chatApiResponse.assistantResponse;
    if (aiEvaluation) {
      const evaluation = {
        ...studentResponse,
        aiEvaluation: aiEvaluation,
      };
      setEvaluations(prevEvaluations => [...prevEvaluations, evaluation]);
      setEvaluationCount(prevCount => prevCount + 1);
    }
  };

  const summarizeStudentEvaluations = async (
    evaluations: StudentResponse[]
  ) => {
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
