import React from 'react';
import {expect} from 'chai';
import {mount} from 'enzyme';
import {Factory} from 'rosie';
import CensusInaccuracyReviewTable from '@cdo/apps/templates/census2017/CensusInaccuracyReviewTable';

Factory.define('InaccuracyReport')
  .sequence('id')
  .attr('school', 'North Humboldt Middle')
  .attr('current_summary', 'Teaches keyboarding')
  .attr('inaccuracy_comment', 'We teach more than that');

describe('CensusInaccuracyReviewTable', () => {
  it('hides the review buttons when props are updated', () => {
    const reportsToReview = Factory.buildList('InaccuracyReport', 3);

    const wrapper = mount(
      <CensusInaccuracyReviewTable
        reportsToReview={reportsToReview.map(JSON.stringify)}
        resolvedReports={[reportsToReview[0].id]}
        onStartReview={() => {}}
      />
    );

    // Should see two review buttons, since one report is resolved
    expect(wrapper.find('Button').length).to.equal(2);

    // Via a props update, resolve another report
    wrapper.setProps({
      resolvedReports: [reportsToReview[0].id, reportsToReview[1].id]
    });

    // Should see one review button, since two reports are resolved
    expect(wrapper.find('Button').length).to.equal(1);

    // Via a props update, resolve all reports
    wrapper.setProps({
      resolvedReports: reportsToReview.map(row => row.id)
    });

    // Should see no buttons, and a message that all reviews are done
    expect(wrapper.find('Button').length).to.equal(0);
    expect(wrapper.text()).to.include('0 reports remaining to review');
  });
});
