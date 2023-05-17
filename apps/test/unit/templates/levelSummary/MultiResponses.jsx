import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import MultiResponses, {
  exportedForTesting,
} from '@cdo/apps/templates/levelSummary/MultiResponses';
import color from '@cdo/apps/util/color';
const {multiAnswerCounts, multiChartData} = exportedForTesting;

const JS_DATA = {
  level: {
    properties: {
      answers: [{}],
    },
  },
  responses: [{user_id: 0, text: '1'}],
};

describe('MultiResponses', () => {
  it('renders chart', () => {
    const wrapper = shallow(<MultiResponses scriptData={JS_DATA} />);

    expect(wrapper.find('Chart').length).to.eq(1);
    expect(wrapper.find('Chart').prop('data')).to.eql([
      ['Answer', 'Count', {role: 'annotation'}, {role: 'style'}],
      ['A', 0, '0', null],
      ['B', 1, '1', null],
    ]);
  });
});

describe('multiAnswerCounts', () => {
  it('defaults to zero with 4 answers', () => {
    const data = multiAnswerCounts([], 4);
    expect(data).to.eql({
      A: 0,
      B: 0,
      C: 0,
      D: 0,
    });
  });

  it('defaults to zero with more than 4 answers', () => {
    const data = multiAnswerCounts([], 6);
    expect(data).to.eql({
      A: 0,
      B: 0,
      C: 0,
      D: 0,
      E: 0,
      F: 0,
    });
  });

  it('generates correct counts for each answer', () => {
    const data = multiAnswerCounts(
      [
        {text: '0'},
        {text: '0'},
        {text: '0'},
        {text: '0'},
        {text: '0'},
        {text: '2'},
        {text: '3'},
        {text: '3'},
      ],
      4
    );
    expect(data).to.eql({
      A: 5,
      B: 0,
      C: 1,
      D: 2,
    });
  });

  it('generates correct counts with multiple answers selected', () => {
    const data = multiAnswerCounts(
      [
        {text: '0,2'},
        {text: '0'},
        {text: '0,3,2'},
        {text: '0,3'},
        {text: '0'},
        {text: '2,3'},
        {text: '3,0'},
        {text: '3'},
      ],
      4
    );
    expect(data).to.eql({
      A: 6,
      B: 0,
      C: 3,
      D: 5,
    });
  });
});

describe('multiChartData', () => {
  it('outputs only heading data when empty', () => {
    const data = multiChartData({});
    expect(data).to.eql([
      ['Answer', 'Count', {role: 'annotation'}, {role: 'style'}],
    ]);
  });

  it('outputs correct data with no highlighting', () => {
    const data = multiChartData({
      A: 1,
      B: 60,
      C: 7,
      D: 12,
    });
    expect(data).to.eql([
      ['Answer', 'Count', {role: 'annotation'}, {role: 'style'}],
      ['A', 1, '1', null],
      ['B', 60, '60', null],
      ['C', 7, '7', null],
      ['D', 12, '12', null],
    ]);
  });

  it('outputs correct data with highlighting', () => {
    const data = multiChartData(
      {
        A: 101,
        B: 0,
        C: 37,
        D: 8,
        E: 0,
      },
      ['A', 'B']
    );
    expect(data).to.eql([
      ['Answer', 'Count', {role: 'annotation'}, {role: 'style'}],
      ['A', 101, '101✔️', color.brand_primary_default],
      ['B', 0, '0✔️', color.brand_primary_default],
      ['C', 37, '37', color.brand_primary_light],
      ['D', 8, '8', color.brand_primary_light],
      ['E', 0, '0', color.brand_primary_light],
    ]);
  });
});
