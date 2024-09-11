import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import DataDocView from '@cdo/apps/templates/dataDocs/DataDocView';

describe('DataDocView', () => {
  let defaultProps;
  const docName = 'Name of Doc';
  const docContent = 'Content of Doc';

  beforeEach(() => {
    defaultProps = {
      dataDocName: docName,
      dataDocContent: docContent,
    };
  });

  it('shows data doc name and content', () => {
    const wrapper = shallow(<DataDocView {...defaultProps} />);
    expect(wrapper.text()).toContain(docName);
    expect(wrapper.find('EnhancedSafeMarkdown').first().props().markdown).toBe(
      docContent
    );
  });
});
