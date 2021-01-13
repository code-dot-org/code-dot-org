import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import {expect} from '../../../../util/reconfiguredChai';
import SearchBox from '@cdo/apps/lib/levelbuilder/lesson-editor/SearchBox';

describe('SearchBox', () => {
  let defaultProps, onSearchSelect, constructOptions;

  beforeEach(() => {
    onSearchSelect = sinon.spy();
    constructOptions = sinon.spy();
    defaultProps = {
      onSearchSelect,
      courseVersionId: 1,
      searchUrl: 'fakesearch',
      constructOptions
    };
  });

  it('renders default props', () => {
    const wrapper = shallow(<SearchBox {...defaultProps} />);
    expect(wrapper.find('Async').length).to.equal(1);
  });
});
