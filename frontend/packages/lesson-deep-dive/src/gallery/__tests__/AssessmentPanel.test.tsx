import {render, screen} from '@testing-library/react';

import AssessmentPanel from '../AssessmentPanel';
import {ChallengeResponseDetail} from '../types';

const baseDetail: ChallengeResponseDetail = {
  id: 8,
  challenge_id: 1,
  user_id: 99,
  user_name: 'Grace Hopper',
  unit_id: 100,
  lesson_position: 3,
  student_text: null,
  transcript: null,
  student_feedback: 'Great explanation of the network!',
  evaluation_status: 'success',
  is_final: true,
  created_at: '2026-08-10T12:00:00Z',
  assets: [],
  viewer_role: 'owner',
  question: 'Draw a network.',
  evaluated_at: '2026-08-11T15:30:00Z',
  evaluation_result: null,
  rubric: [],
};

const teacherDetail: ChallengeResponseDetail = {
  ...baseDetail,
  viewer_role: 'teacher',
  evaluation_result: {
    level: 2,
    reasoning: 'Solid work.',
    evidence: 'The drawing labels each node.',
    student_feedback: 'Great explanation of the network!',
  },
  rubric: [
    {level: 0, description: 'No answer is present'},
    {level: 1, description: 'Answer is partially correct'},
    {level: 2, description: 'Answer is correct'},
    {level: 3, description: 'Answer is correct and clearly explained'},
  ],
};

describe('AssessmentPanel', () => {
  it('shows the owner their feedback without the rubric', () => {
    render(<AssessmentPanel detail={baseDetail} />);

    expect(screen.getByText('Feedback')).toBeInTheDocument();
    expect(
      screen.getByText('Great explanation of the network!'),
    ).toBeInTheDocument();
    expect(screen.queryByText('Rubric')).not.toBeInTheDocument();
    expect(screen.queryByText('AI Assigned Score')).not.toBeInTheDocument();
  });

  it('shows a placeholder while the feedback is pending', () => {
    render(
      <AssessmentPanel detail={{...baseDetail, student_feedback: null}} />,
    );

    expect(screen.getByText('Feedback isn’t ready yet.')).toBeInTheDocument();
  });

  it('shows the teacher the assessment with the AI-assigned level highlighted', () => {
    render(<AssessmentPanel detail={teacherDetail} />);

    expect(screen.getByText('AI Assessment')).toBeInTheDocument();
    expect(screen.getByText('Shown to Grace')).toBeInTheDocument();
    expect(screen.getByText('Not shown to Grace')).toBeInTheDocument();

    // Levels are listed highest first, and only the assigned one is tagged.
    expect(
      screen.getAllByText(/^Level \d$/).map(node => node.textContent),
    ).toEqual(['Level 3', 'Level 2', 'Level 1', 'Level 0']);
    expect(screen.getByText('AI Assigned Score')).toBeInTheDocument();
    expect(screen.getByText('Answer is correct')).toBeInTheDocument();
  });
});
