import React from 'react';
import FacilitatorAveragesTable from './facilitator_averages_table';
import reactBootstrapStoryDecorator from '../../../reactBootstrapStoryDecorator';

export default storybook => {
  storybook
    .storiesOf('FacilitatorAveragesTable', module)
    .addDecorator(reactBootstrapStoryDecorator)
    .addStoryTable([
      {
        name: 'Facilitator Averages Table',
        story: () => (
          <FacilitatorAveragesTable
            facilitatorAverages={{
              overallHow: {
                this_workshop: 4.0,
                all_my_workshops: 4.5
              },
              duringYour: {
                this_workshop: 4.0,
                all_my_workshops: 4.5
              },
              forThis54: {
                this_workshop: 4.0,
                all_my_workshops: 4.5
              },
              howInteresting55: {
                this_workshop: 4.0,
                all_my_workshops: 4.5
              },
              howOften56: {
                this_workshop: 4.0,
                all_my_workshops: 4.5
              },
              howComfortable: {
                this_workshop: 4.0,
                all_my_workshops: 4.5
              },
              howOften: {
                this_workshop: 4.0,
                all_my_workshops: 4.5
              },
              pleaseRate120_0: {
                this_workshop: 4.0,
                all_my_workshops: 4.5
              },
              pleaseRate120_1: {
                this_workshop: 4.0,
                all_my_workshops: 4.5
              },
              pleaseRate120_2: {
                this_workshop: 4.0,
                all_my_workshops: 4.5
              },
              iFeel133: {
                this_workshop: 4.0,
                all_my_workshops: 4.5
              },
              regardingThe_2: {
                this_workshop: 4.0,
                all_my_workshops: 4.5
              },
              pleaseRate_2: {
                this_workshop: 4.0,
                all_my_workshops: 4.5
              },
              iWould: {
                this_workshop: 4.0,
                all_my_workshops: 4.5
              },
              pleaseRate_3: {
                this_workshop: 4.0,
                all_my_workshops: 4.5
              },
              facilitator_effectiveness: {
                this_workshop: 4.0,
                all_my_workshops: 4.5
              },
              teacher_engagement: {
                this_workshop: 4.2,
                all_my_workshops: 4.8
              },
              overall_success: {
                this_workshop: 5.5,
                all_my_workshops: 5.2
              }
            }}
            facilitatorName="Josh Allen"
            questions={{
              overallHow: "Overall, how good was your workshop?",
              duringYour: "During your workshop, how motivating were the activities that this program had you do?",
              forThis54: "For this workshop, how clearly did {facilitatorName} present the information that you needed to learn?",
              howInteresting55: "How interesting did {facilitatorName} make what you learned in the workshop?",
              howOften56: "How often did {facilitatorName} give you feedback that helped you learn?",
              howComfortable: "How comfortable were you asking {facilitatorName} questions about what you were learning in this workshop?",
              howOften: "How often did {facilitatorName} teach you things that you didn't know before taking this workshop?",
              pleaseRate120_0: "Please rate the how much you agree with the following statements. I found the activities we did in this workshop interesting and engaging.",
              pleaseRate120_1: "Please rate the how much you agree with the following statements. I was highly active and participated a lot in the workshop activities.",
              pleaseRate120_2: "Please rate the how much you agree with the following statements. When I'm not in Code.org workshops, I frequently talk about ideas or content from the workshop with others.",
              iFeel133: "Please rate the how much you agree with the following statements. I feel more prepared to teach the material covered in this workshop than before I came.",
              regardingThe_2: "Please rate the how much you agree with the following statements. I know where to go if I need help preparing to teach this material.",
              pleaseRate_2: "Please rate the how much you agree with the following statements. This professional development was suitable for my level of experience with teaching CS.",
              iWould: "Please rate the how much you agree with the following statements. I would recommend this professional development to others.",
              pleaseRate_3: "Please rate the how much you agree with the following statements. I feel like I am a part of a community of teachers."
            }}
            courseName="CS Discoveries"
            facilitatorResponseCounts={{
              this_workshop: {1: 40},
              all_my_workshops: {1: 200}
            }}
            facilitatorId={1}
          />
        )
      }
    ]);
};
