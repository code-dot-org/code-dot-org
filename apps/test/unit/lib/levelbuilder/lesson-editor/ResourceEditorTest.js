import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import ResourcesEditor from '@cdo/apps/lib/levelbuilder/lesson-editor/ResourcesEditor';
import resourceTestData from './resourceTestData';

describe('ResourcesEditor', () => {
  let defaultProps;
  beforeEach(() => {
    defaultProps = {
      resources: resourceTestData
    };
  });

  it('renders default props', () => {
    const wrapper = shallow(<ResourcesEditor {...defaultProps} />);
    expect(wrapper.find('tr').length).to.equal(resourceTestData.length + 1);
  });
});
