import React from 'react';
import {shallow} from 'enzyme';
import {assert} from 'chai';
import {SummaryTable} from '../../../../../src/code-studio/pd/application_dashboard/summary_table';
import {getApplicationStatuses} from '@cdo/apps/code-studio/pd/application_dashboard/constants';

describe('SummaryTable', () => {
  it('computes total applications', () => {
    const wrapper = customShallow(<SummaryTable {...DEFAULT_PROPS} />);

    assert(
      wrapper.containsMatchingElement(
        <tr>
          <td>{getApplicationStatuses().unreviewed}</td>
          <td>{10}</td>
        </tr>
      ),
      'Unreviewed row matches data'
    );

    assert(
      wrapper.containsMatchingElement(
        <tr>
          <td>{getApplicationStatuses().accepted}</td>
          <td>{9}</td>
        </tr>
      ),
      'Accepted row matches data'
    );

    assert(
      wrapper.containsMatchingElement(
        <tr>
          <td>Total</td>
          <td>{19}</td>
        </tr>
      ),
      'Totals row computes correct sum'
    );
  });
});

const DEFAULT_PROPS = {
  caption: 'Test summary table',
  path: 'foo',
  data: {
    unreviewed: {
      total: 10
    },
    accepted: {
      total: 9
    }
  }
};

/** Shallow-render the component and stub react-router. */
function customShallow(component) {
  return shallow(component, {
    context: {router: {createHref: () => {}}}
  });
}
