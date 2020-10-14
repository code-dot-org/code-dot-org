import React from 'react';
import {shallow} from 'enzyme';
import {assert} from 'chai';
import {SummaryTable} from '../../../../../src/code-studio/pd/application_dashboard/summary_table';

describe('SummaryTable', () => {
  it('computes total applications', () => {
    const wrapper = customShallow(<SummaryTable {...DEFAULT_PROPS} />);

    assert(
      wrapper.containsMatchingElement(
        <tr>
          <td>Unreviewed</td>
          <td>{10}</td>
        </tr>
      ),
      'Unreviewed row matches data'
    );

    assert(
      wrapper.containsMatchingElement(
        <tr>
          <td>Accepted</td>
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

  it('computes total applications with locked counts', () => {
    const wrapper = customShallow(
      <SummaryTable
        {...DEFAULT_PROPS}
        canSeeLocked
        applicationType="facilitator"
      />
    );

    assert(
      wrapper.containsMatchingElement(
        <tr>
          <td>Unreviewed</td>
          <td>{1}</td>
          <td>{9}</td>
          <td>{10}</td>
        </tr>
      ),
      'Unreviewed row matches data'
    );

    assert(
      wrapper.containsMatchingElement(
        <tr>
          <td>Accepted</td>
          <td>{2}</td>
          <td>{7}</td>
          <td>{9}</td>
        </tr>
      ),
      'Accepted row matches data'
    );

    assert(
      wrapper.containsMatchingElement(
        <tr>
          <td>Total</td>
          <td>{3}</td>
          <td>{16}</td>
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
  applicationType: 'teacher',
  data: {
    unreviewed: {
      total: 10,
      locked: 1
    },
    accepted: {
      total: 9,
      locked: 2
    }
  }
};

/** Shallow-render the component and stub react-router. */
function customShallow(component) {
  return shallow(component, {
    context: {router: {createHref: () => {}}}
  });
}
