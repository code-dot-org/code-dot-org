import React from 'react';
import SurveyRollupTable from '../../components/survey_results/survey_rollup_table';
import reactBootstrapStoryDecorator from '../../../reactBootstrapStoryDecorator';
import {COURSE_CSF} from '../../workshopConstants';

const facilitator_rollups = {
  facilitators: {
    '1': 'Facilitator Person 1',
    '2': 'Facilitator Person 2'
  },
  questions: {
    facilitator_effectiveness_0: 'Demonstrated knowledge of the curriculum.',
    facilitator_effectiveness_1:
      'Built and sustained an equitable learning environment in our workshop.',
    facilitator_effectiveness_2: 'Kept the workshop and participants on track.',
    facilitator_effectiveness_3: 'Supported productive workshop discussions.',
    facilitator_effectiveness_4:
      'Helped me see ways to create and support an equitable learning environment for my students.',
    facilitator_effectiveness_5:
      'Demonstrated a healthy working relationship with their co-facilitator (if applicable).'
  },
  rollups: {
    facilitator_1_single_ws: {
      facilitator_id: 1,
      workshop_id: 1,
      response_count: 1,
      averages: {
        facilitator_effectiveness_0: 1.0,
        facilitator_effectiveness_2: 4.0,
        facilitator_effectiveness_4: 3.0,
        facilitator_effectiveness_5: 1.0,
        facilitator_effectiveness: 2.25
      }
    },
    facilitator_1_all_ws: {
      facilitator_id: 1,
      all_workshop_ids: [1],
      course_name: 'CS Principles',
      response_count: 1,
      averages: {
        facilitator_effectiveness_0: 1.0,
        facilitator_effectiveness_2: 4.0,
        facilitator_effectiveness_4: 3.0,
        facilitator_effectiveness_5: 1.0,
        facilitator_effectiveness: 2.25
      }
    },
    facilitator_2_single_ws: {
      facilitator_id: 2,
      workshop_id: 1,
      response_count: 1,
      averages: {
        facilitator_effectiveness_0: 1.0,
        facilitator_effectiveness_2: 4.0,
        facilitator_effectiveness_4: 3.0,
        facilitator_effectiveness_5: 1.0,
        facilitator_effectiveness: 2.25
      }
    },
    facilitator_2_all_ws: {
      facilitator_id: 2,
      all_workshop_ids: [1],
      course_name: 'CS Principles',
      response_count: 1,
      averages: {
        facilitator_effectiveness_0: 1.0,
        facilitator_effectiveness_2: 4.0,
        facilitator_effectiveness_4: 3.0,
        facilitator_effectiveness_5: 1.0,
        facilitator_effectiveness: 2.25
      }
    }
  }
};

const workshop_rollups = {
  facilitators: {
    '1': 'Facilitator Person 1',
    '2': 'Facilitator Person 2'
  },
  questions: {
    overall_success_0:
      'I feel more prepared to teach the material covered in this workshop than before I came.',
    overall_success_1:
      'I know where to go if I need help preparing to teach this material.',
    overall_success_2:
      'This professional development was suitable for my level of experience with teaching CS.',
    overall_success_3:
      'I feel connected to a community of computer science teachers.',
    overall_success_4:
      'I would recommend this professional development to others',
    teacher_engagement_0:
      'I found the activities we did in this workshop interesting and engaging.',
    teacher_engagement_1:
      'I was highly active and participated a lot in the workshop activities.',
    teacher_engagement_2:
      'I frequently talk about ideas or content from the workshop with others.',
    teacher_engagement_3:
      'I am planning to make use of ideas and content covered in this workshop in my classroom.'
  },
  rollups: {
    this_ws: {
      workshop_id: 1,
      response_count: 1,
      averages: {
        overall_success_0: 6.0,
        overall_success_1: 7.0,
        overall_success_2: 6.0,
        overall_success_3: 6.0,
        overall_success_4: 7.0,
        teacher_engagement_0: 7.0,
        teacher_engagement_1: 6.0,
        teacher_engagement_2: 6.0,
        teacher_engagement_3: 7.0,
        overall_success: 6.4,
        teacher_engagement: 6.5
      }
    },
    facilitator_1_all_ws: {
      facilitator_id: 1,
      all_workshop_ids: [1],
      course_name: 'CS Principles',
      response_count: 1,
      averages: {
        overall_success_0: 6.0,
        overall_success_1: 7.0,
        overall_success_2: 6.0,
        overall_success_3: 6.0,
        overall_success_4: 7.0,
        teacher_engagement_0: 7.0,
        teacher_engagement_1: 6.0,
        teacher_engagement_2: 6.0,
        teacher_engagement_3: 7.0,
        overall_success: 6.4,
        teacher_engagement: 6.5
      }
    },
    facilitator_2_all_ws: {
      facilitator_id: 2,
      all_workshop_ids: [1],
      course_name: 'CS Principles',
      response_count: 1,
      averages: {
        overall_success_0: 6.0,
        overall_success_1: 7.0,
        overall_success_2: 6.0,
        overall_success_3: 6.0,
        overall_success_4: 7.0,
        teacher_engagement_0: 7.0,
        teacher_engagement_1: 6.0,
        teacher_engagement_2: 6.0,
        teacher_engagement_3: 7.0,
        overall_success: 6.4,
        teacher_engagement: 6.5
      }
    }
  }
};

export default storybook => {
  storybook
    .storiesOf('SurveyRollupTable', module)
    .addDecorator(reactBootstrapStoryDecorator)
    .addStoryTable([
      {
        name: 'Facilitator Rollup Table',
        story: () => (
          <SurveyRollupTable
            courseName="CS Principles"
            rollups={facilitator_rollups.rollups}
            questions={facilitator_rollups.questions}
            facilitators={facilitator_rollups.facilitators}
          />
        )
      },
      {
        name: 'Workshop Rollup Table',
        story: () => (
          <SurveyRollupTable
            courseName={COURSE_CSF}
            rollups={workshop_rollups.rollups}
            questions={workshop_rollups.questions}
            facilitators={workshop_rollups.facilitators}
          />
        )
      }
    ]);
};
