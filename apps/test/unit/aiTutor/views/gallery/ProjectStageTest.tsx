import {ChallengeResponseDetail} from '@code-dot-org/lesson-deep-dive';
import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import ProjectStage from '@cdo/apps/aiTutor/views/gallery/ProjectStage';

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
  viewer_role: 'peer',
  question: 'Draw a network.',
  evaluated_at: null,
  evaluation_result: null,
  rubric: [],
};

describe('ProjectStage', () => {
  it('shows a whiteboard image with its audio narration and explanation', () => {
    render(
      <ProjectStage
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
      />
    );

    expect(
      screen.getByAltText("Grace Hopper's whiteboard project")
    ).toHaveAttribute('src', 'https://s3.example/board.png');
    expect(screen.getByLabelText('Audio narration')).toHaveAttribute(
      'src',
      'https://s3.example/narration'
    );
    expect(screen.getByText('Text Explanation')).toBeInTheDocument();
    expect(screen.getByText('My drawing shows a network.')).toBeInTheDocument();
  });

  it('shows a story video without the explanation panel', () => {
    render(
      <ProjectStage
        detail={{
          ...baseDetail,
          student_text: 'A transcript-like text.',
          assets: [
            {
              id: 1,
              asset_type: 'video',
              download_url: 'https://s3.example/video',
            },
          ],
        }}
      />
    );

    expect(screen.getByLabelText("Grace Hopper's video story")).toHaveAttribute(
      'src',
      'https://s3.example/video'
    );
    expect(screen.queryByText('Text Explanation')).not.toBeInTheDocument();
  });

  it('skips assets whose bytes were never uploaded', () => {
    render(
      <ProjectStage
        detail={{
          ...baseDetail,
          assets: [{id: 3, asset_type: 'whiteboard_image', download_url: null}],
        }}
      />
    );

    expect(
      screen.queryByAltText("Grace Hopper's whiteboard project")
    ).not.toBeInTheDocument();
  });
});
