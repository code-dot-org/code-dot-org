import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {vi} from 'vitest';

import SkillsCheck, {type TutorFeedbackProps} from '../SkillsCheck';

const request = vi.hoisted(() => vi.fn());

vi.mock('@code-dot-org/core/api', () => {
  const client = {transport: {request}};
  return {useApiClient: () => client};
});

const serverProblem = {
  id: 4,
  key: 'mammals',
  problem_type: 'multiple_choice_single_select',
  active: true,
  problem_text: 'Which of these is a mammal?',
  solution: [
    {option: 'koala', correct: true},
    {option: 'frog', correct: false},
  ],
};

const TutorFeedback = ({systemPrompt, userMessage}: TutorFeedbackProps) => (
  <div>
    <p>system: {systemPrompt}</p>
    <p>user: {userMessage}</p>
  </div>
);

const renderSkillsCheck = (onComplete = vi.fn()) =>
  render(
    <SkillsCheck
      lessonId={42}
      lessonName="Animals"
      lessonSummary="Sorting animals"
      vocabulary={[]}
      objectives={[{id: 'a', description: 'Tell mammals apart'}]}
      reflectionData={null}
      onComplete={onComplete}
      TutorFeedback={TutorFeedback}
    />,
  );

const answerCorrectly = async () => {
  fireEvent.click(await screen.findByRole('button', {name: 'koala'}));
  fireEvent.click(screen.getByRole('button', {name: 'Submit'}));
};

describe('SkillsCheck', () => {
  beforeEach(() => {
    request.mockReset();
    request.mockImplementation(async ({method, url}) => {
      if (method === 'POST') return {id: 11};
      return url.startsWith('/practice_problems') ? [serverProblem] : [];
    });
  });

  it('should show the problems for the lesson objectives', async () => {
    renderSkillsCheck();

    expect(
      await screen.findByText('Which of these is a mammal?'),
    ).toBeInTheDocument();
    expect(request).toHaveBeenCalledWith({
      method: 'GET',
      url: '/practice_problems?objective_ids%5B%5D=a',
    });
  });

  it('should leave out problems the student already attempted', async () => {
    request.mockImplementation(async ({url}) =>
      url.startsWith('/practice_problems')
        ? [serverProblem, {...serverProblem, id: 5, problem_text: 'Second'}]
        : [{id: 1, practice_problem_id: 4}],
    );

    renderSkillsCheck();

    expect(await screen.findByText('Second')).toBeInTheDocument();
    expect(
      screen.queryByText('Which of these is a mammal?'),
    ).not.toBeInTheDocument();
  });

  it('should record the attempt when the student answers', async () => {
    renderSkillsCheck();

    await answerCorrectly();

    await waitFor(() =>
      expect(request).toHaveBeenCalledWith({
        method: 'POST',
        url: '/user_practice_problem_attempts/',
        body: {
          practice_problem_id: 4,
          correct: true,
          delivery_context_type: 'ai_tutor_lesson_deep_dive',
          attempt: {
            solution: [
              {option: 'koala', correct: true},
              {option: 'frog', correct: false},
            ],
          },
          delivery_context_metadata: {lesson_id: 42},
        },
      }),
    );
  });

  it('should ask the tutor for feedback on the answer', async () => {
    renderSkillsCheck();

    await answerCorrectly();

    expect(
      screen.getByText(/system: .*lesson titled "Animals"/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/user: The student got this practice problem RIGHT/),
    ).toBeInTheDocument();
  });

  it('should continue after the last problem', async () => {
    const onComplete = vi.fn();
    renderSkillsCheck(onComplete);

    await answerCorrectly();
    fireEvent.click(screen.getByRole('button', {name: 'Continue'}));

    expect(onComplete).toHaveBeenCalled();
  });
});
