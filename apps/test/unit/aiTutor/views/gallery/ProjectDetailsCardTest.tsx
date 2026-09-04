import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import ProjectDetailsCard from '@cdo/apps/aiTutor/views/gallery/ProjectDetailsCard';
import {ChallengeResponseDetail} from '@cdo/apps/aiTutor/views/gallery/types';

const baseDetail: ChallengeResponseDetail = {
  id: 8,
  challenge_id: 1,
  user_id: 99,
  user_name: 'Grace Hopper',
  unit_id: 100,
  lesson_position: 3,
  student_text: null,
  transcript: null,
  student_feedback: null,
  evaluation_status: null,
  is_final: true,
  created_at: '2026-08-10T12:00:00Z',
  assets: [],
  reactions: [],
  viewer_role: 'peer',
  question: 'Draw a network.',
  evaluated_at: null,
  evaluation_result: null,
  rubric: [],
};

describe('ProjectDetailsCard', () => {
  it('labels a whiteboard project with its unit, artifacts, author, and prompt', () => {
    render(
      <ProjectDetailsCard
        detail={{
          ...baseDetail,
          student_text: 'My drawing shows a network.',
          assets: [
            {
              id: 3,
              asset_type: 'whiteboard_image',
              download_url: 'https://s3.example/board.png',
            },
            {
              id: 4,
              asset_type: 'audio',
              download_url: 'https://s3.example/narration',
            },
          ],
        }}
        unitPosition={1}
      />
    );

    expect(screen.getByText('Unit 1, Lesson 3')).toBeInTheDocument();
    expect(
      ['Whiteboard', 'Audio', 'Text'].map(
        label => screen.getByText(label).textContent
      )
    ).toEqual(['Whiteboard', 'Audio', 'Text']);
    expect(screen.getByText('Grace Hopper')).toBeInTheDocument();
    expect(
      screen.getByText('Project Prompt: Draw a network.')
    ).toBeInTheDocument();
  });

  it('labels a video submission as a Video Story', () => {
    render(
      <ProjectDetailsCard
        detail={{
          ...baseDetail,
          assets: [
            {
              id: 1,
              asset_type: 'video',
              download_url: 'https://s3.example/video',
            },
          ],
        }}
        unitPosition={1}
      />
    );

    expect(screen.getByText('Video Story')).toBeInTheDocument();
    expect(screen.queryByText('Whiteboard')).not.toBeInTheDocument();
  });

  it('omits the unit label when the unit is unknown', () => {
    render(<ProjectDetailsCard detail={baseDetail} unitPosition={null} />);

    expect(screen.queryByText(/Unit \d/)).not.toBeInTheDocument();
    expect(screen.getByText('Grace Hopper')).toBeInTheDocument();
  });
});
