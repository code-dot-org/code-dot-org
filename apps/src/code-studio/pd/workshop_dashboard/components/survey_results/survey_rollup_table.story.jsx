import React from 'react';
import SurveyRollupTable from '../../components/survey_results/survey_rollup_table';
import reactBootstrapStoryDecorator from '../../../reactBootstrapStoryDecorator';

const facilitator_rollups = {
  facilitators: {
    '1124': 'Facilitator Person 1',
    '1125': 'Facilitator Person 2'
  },
  questions: {
    facilitator_effectiveness_1494688268261028618:
      'During my workshop, {facilitatorName} did the following: -> Demonstrated knowledge of the curriculum.',
    facilitator_effectiveness_9145365597108923713:
      'During my workshop, {facilitatorName} did the following: -> Built and sustained an equitable learning environment in our workshop.',
    facilitator_effectiveness_6627891197594983630:
      'During my workshop, {facilitatorName} did the following: -> Kept the workshop and participants on track.',
    facilitator_effectiveness_10623511283632440781:
      'During my workshop, {facilitatorName} did the following: -> Supported productive workshop discussions.',
    facilitator_effectiveness_8015784983354522873:
      'During my workshop, {facilitatorName} did the following: -> Helped me see ways to create and support an equitable learning environment for my students.',
    facilitator_effectiveness_16129913079128962044:
      'During my workshop, {facilitatorName} did the following: -> Demonstrated a healthy working relationship with their co-facilitator (if applicable).'
  },
  rollups: {
    facilitator_1124_single_ws: {
      facilitator_id: 1124,
      workshop_id: 347,
      response_count: 1,
      averages: {
        facilitator_effectiveness_1494688268261028618: 1.0,
        facilitator_effectiveness_6627891197594983630: 4.0,
        facilitator_effectiveness_8015784983354522873: 3.0,
        facilitator_effectiveness_16129913079128962044: 1.0,
        facilitator_effectiveness: 2.25
      }
    },
    facilitator_1124_all_ws: {
      facilitator_id: 1124,
      all_workshop_ids: [347],
      response_count: 1,
      averages: {
        facilitator_effectiveness_1494688268261028618: 1.0,
        facilitator_effectiveness_6627891197594983630: 4.0,
        facilitator_effectiveness_8015784983354522873: 3.0,
        facilitator_effectiveness_16129913079128962044: 1.0,
        facilitator_effectiveness: 2.25
      }
    },
    facilitator_1125_single_ws: {
      facilitator_id: 1125,
      workshop_id: 347,
      response_count: 1,
      averages: {
        facilitator_effectiveness_1494688268261028618: 1.0,
        facilitator_effectiveness_6627891197594983630: 4.0,
        facilitator_effectiveness_8015784983354522873: 3.0,
        facilitator_effectiveness_16129913079128962044: 1.0,
        facilitator_effectiveness: 2.25
      }
    },
    facilitator_1125_all_ws: {
      facilitator_id: 1125,
      all_workshop_ids: [347],
      response_count: 1,
      averages: {
        facilitator_effectiveness_1494688268261028618: 1.0,
        facilitator_effectiveness_6627891197594983630: 4.0,
        facilitator_effectiveness_8015784983354522873: 3.0,
        facilitator_effectiveness_16129913079128962044: 1.0,
        facilitator_effectiveness: 2.25
      }
    }
  }
};

const workshop_rollups = {
  facilitators: {
    '1124': 'Facilitator Person 1',
    '1125': 'Facilitator Person 2'
  },
  questions: {
    overall_success_2136245491560413670:
      'How much do you agree or disagree with the following statements about the workshop overall? -\u003e I feel more prepared to teach the material covered in this workshop than before I came.',
    overall_success_9121793211174253549:
      'How much do you agree or disagree with the following statements about the workshop overall? -\u003e I know where to go if I need help preparing to teach this material.',
    overall_success_5502876428019550646:
      'How much do you agree or disagree with the following statements about the workshop overall? -\u003e This professional development was suitable for my level of experience with teaching CS.',
    overall_success_3964718812856239438:
      'How much do you agree or disagree with the following statements about the workshop overall? -\u003e I feel connected to a community of computer science teachers.',
    overall_success_6174705123632039779:
      'How much do you agree or disagree with the following statements about the workshop overall? -\u003e I would recommend this professional development to others',
    teacher_engagement_8809902359007963123:
      'How much do you agree or disagree with the following statements about your level of engagement in the workshop? -\u003e I found the activities we did in this workshop interesting and engaging.',
    teacher_engagement_12316562461560038168:
      'How much do you agree or disagree with the following statements about your level of engagement in the workshop? -\u003e I was highly active and participated a lot in the workshop activities.',
    teacher_engagement_8566597854585674670:
      "How much do you agree or disagree with the following statements about your level of engagement in the workshop? -\u003e When I'm not in Code.org workshops, I frequently talk about ideas or content from the workshop with others.",
    teacher_engagement_12383077849665641424:
      'How much do you agree or disagree with the following statements about your level of engagement in the workshop? -\u003e I am definitely planning to make use of ideas and content covered in this workshop in my classroom.'
  },
  rollups: {
    this_ws: {
      workshop_id: 347,
      response_count: 1,
      averages: {
        overall_success_2136245491560413670: 6.0,
        overall_success_9121793211174253549: 7.0,
        overall_success_5502876428019550646: 6.0,
        overall_success_3964718812856239438: 6.0,
        overall_success_6174705123632039779: 7.0,
        teacher_engagement_8809902359007963123: 7.0,
        teacher_engagement_12316562461560038168: 6.0,
        teacher_engagement_8566597854585674670: 6.0,
        teacher_engagement_12383077849665641424: 7.0,
        overall_success: 6.4,
        teacher_engagement: 6.5
      }
    },
    facilitator_1124_all_ws: {
      facilitator_id: 1124,
      all_workshop_ids: [347],
      response_count: 1,
      averages: {
        overall_success_2136245491560413670: 6.0,
        overall_success_9121793211174253549: 7.0,
        overall_success_5502876428019550646: 6.0,
        overall_success_3964718812856239438: 6.0,
        overall_success_6174705123632039779: 7.0,
        teacher_engagement_8809902359007963123: 7.0,
        teacher_engagement_12316562461560038168: 6.0,
        teacher_engagement_8566597854585674670: 6.0,
        teacher_engagement_12383077849665641424: 7.0,
        overall_success: 6.4,
        teacher_engagement: 6.5
      }
    },
    facilitator_1125_all_ws: {
      facilitator_id: 1125,
      all_workshop_ids: [347],
      response_count: 1,
      averages: {
        overall_success_2136245491560413670: 6.0,
        overall_success_9121793211174253549: 7.0,
        overall_success_5502876428019550646: 6.0,
        overall_success_3964718812856239438: 6.0,
        overall_success_6174705123632039779: 7.0,
        teacher_engagement_8809902359007963123: 7.0,
        teacher_engagement_12316562461560038168: 6.0,
        teacher_engagement_8566597854585674670: 6.0,
        teacher_engagement_12383077849665641424: 7.0,
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
            rollups={facilitator_rollups.rollups}
            questions={facilitator_rollups.questions}
            facilitators={facilitator_rollups.facilitators}
          />
        )
      }
    ])
    .addStoryTable([
      {
        name: 'Workshop Rollup Table',
        story: () => (
          <SurveyRollupTable
            rollups={workshop_rollups.rollups}
            questions={workshop_rollups.questions}
            facilitators={workshop_rollups.facilitators}
          />
        )
      }
    ]);
};
