import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import PlcHeader from '@cdo/apps/code-studio/plc/header';

const TEST_UNIT_NAME = 'Test Unit';
const TEST_COURSE_VIEW_PATH = 'http://example.com/course';
const TEST_PAGE_NAME = 'Test Page';
const TEST_UNIT_VIEW_PATH = 'http://example.com/unit';

describe('PlcHeader', () => {
  it('renders a simple header with no page name', () => {
    const wrapper = shallow(
      <PlcHeader
        unit_name={TEST_UNIT_NAME}
        course_view_path={TEST_COURSE_VIEW_PATH}
      />
    );

    expect(
      wrapper.containsMatchingElement(
        <div>
          <a href={TEST_COURSE_VIEW_PATH}>My Learning Plan</a>
          <span className="fa fa-caret-right" />
          <span>{TEST_UNIT_NAME}</span>
        </div>
      )
    ).toBeTruthy();
  });

  it('renders an extra layer of breadcrumb with a page name', () => {
    const wrapper = shallow(
      <PlcHeader
        unit_name={TEST_UNIT_NAME}
        unit_view_path={TEST_UNIT_VIEW_PATH}
        course_view_path={TEST_COURSE_VIEW_PATH}
        page_name={TEST_PAGE_NAME}
      />
    );

    expect(
      wrapper.containsMatchingElement(
        <div>
          <a href={TEST_COURSE_VIEW_PATH}>My Learning Plan</a>
          <span className="fa fa-caret-right" />
          <span>
            <a href={TEST_UNIT_VIEW_PATH}>{TEST_UNIT_NAME}</a>
            <span className="fa fa-caret-right" />
            <span>{TEST_PAGE_NAME}</span>
          </span>
        </div>
      )
    ).toBeTruthy();
  });
});
