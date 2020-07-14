import React from 'react';
import {expect} from 'chai';
import SurveyRollupTableFoorm from '@cdo/apps/code-studio/pd/workshop_dashboard/components/survey_results/survey_rollup_table_foorm';
import mount from 'enzyme/build/mount';

describe('Survey Rollup Table Foorm', () => {
  const sampleRollupAverages1 = {
    response_count: 13,
    averages: {
      overall_success: {
        average: 5.33,
        rows: {
          best_pd: 6.22,
          feel_community: 5.11,
          more_prepared: 4.33
        }
      }
    }
  };
  const sampleRollupAverages2 = {
    response_count: 10,
    averages: {
      overall_success: {
        average: 4.2,
        rows: {
          best_pd: 1.23,
          feel_community: 3.72,
          more_prepared: 4.32
        }
      }
    }
  };

  const sampleFacilitatorRollup = {
    '1': sampleRollupAverages1,
    '2': sampleRollupAverages2
  };

  const sampleQuestions = {
    overall_success: {
      column_count: 7,
      form_keys: ['surveys/pd/workshop_csf_intro_post.0'],
      header: 'Overall Success',
      rows: {
        best_pd:
          'This was the absolute best professional development I’ve ever participated in.',
        feel_community:
          'I feel connected to a community of computer science teachers.',
        more_prepared:
          'I feel more prepared to teach the material covered in this workshop than before I came.',
        suitable_my_level:
          'This professional development was suitable for my level of experience with teaching CS.'
      },
      title: 'sample title',
      type: 'matrix'
    }
  };

  const sampleRollup = {
    overall: sampleRollupAverages1,
    overall_facilitator: sampleFacilitatorRollup,
    single_workshop: sampleRollupAverages2,
    questions: sampleQuestions
  };

  const sampleFacilitators = {'1': 'Facilitator 1', '2': 'Facilitator 2'};

  it('renders rows and columns correctly', () => {
    const rollupTable = mount(
      <SurveyRollupTableFoorm
        courseName="CS Fundamentals"
        facilitators={sampleFacilitators}
        isPerFacilitator={false}
        workshopRollups={sampleRollup}
      />
    );

    // check headers are generated correctly
    const headerCells = rollupTable.find('HeaderRow').find('th');
    expect(headerCells.at(1).text()).to.equal('Average for this workshop');
    expect(headerCells.at(2).text()).to.equal(
      "Average across all of Facilitator 1's CS Fundamentals workshops"
    );
    // 5 expected columns: Question, Average for this workshop,
    // Average for facilitator 1, Average for facilitator 1,
    // Average for this course
    expect(headerCells).to.have.length(4);

    // 7 rows are total response count, average for the matrix,
    // question header and averages for all 4 sub-questions
    const bodyRows = rollupTable.find('BodyRow');
    expect(bodyRows).to.have.length(7);

    const totalResponsesForThisWorkshop = bodyRows
      .first()
      .find('td')
      .at(1);
    expect(totalResponsesForThisWorkshop.text()).to.equal('10');

    const perFacilitatorAverage = bodyRows
      .at(1)
      .find('td')
      .at(3);
    expect(perFacilitatorAverage.text()).to.equal('4.2 / 7');
  });
});
