import React from 'react';
import {shallow} from 'enzyme';
import DataDocView from '@cdo/apps/templates/dataDocs/DataDocView';
import {expect} from '../../../util/reconfiguredChai';

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
    expect(wrapper.text()).to.contain(docName);
    expect(
      wrapper.find('EnhancedSafeMarkdown').first().props().markdown
    ).to.equal(docContent);
  });
});
