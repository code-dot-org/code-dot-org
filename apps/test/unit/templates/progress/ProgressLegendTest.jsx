import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import BubbleBadge, {BadgeType} from '@cdo/apps/templates/progress/BubbleBadge';
import ProgressLegend from '@cdo/apps/templates/progress/ProgressLegend';

describe('ProgressLegend', () => {
  it('renders a single table without extra columns', () => {
    const wrapper = shallow(<ProgressLegend includeCsfColumn={false} />);
    expect(wrapper.find('table')).toHaveLength(1);
  });

  it('renders two tables with all columns', () => {
    const wrapper = shallow(
      <ProgressLegend
        includeCsfColumn
        includeProgressNotApplicable
        includeReviewStates
      />
    );
    expect(wrapper.find('table')).toHaveLength(2);
  });

  it('renders passed state for csf', () => {
    const wrapper = shallow(<ProgressLegend includeCsfColumn />);
    expect(wrapper.text()).toContain('(too many blocks)');
  });

  it('renders em dash for progress NA', () => {
    const wrapper = shallow(
      <ProgressLegend includeProgressNotApplicable includeCsfColumn />
    );
    expect(wrapper.text()).toContain('—');
  });

  it('renders badges for review states', () => {
    const wrapper = shallow(
      <ProgressLegend includeReviewStates includeCsfColumn />
    );

    const badge = wrapper.find(BubbleBadge);
    expect(badge).toHaveLength(2);
    expect(badge.at(0).props().badgeType).toBe(BadgeType.keepWorking);
  });
});
