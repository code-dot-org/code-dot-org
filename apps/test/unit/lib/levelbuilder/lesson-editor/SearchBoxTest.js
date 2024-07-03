import {mount, shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import sinon from 'sinon';

import SearchBox from '@cdo/apps/lib/levelbuilder/lesson-editor/SearchBox';



describe('SearchBox', () => {
  let defaultProps, constructOptions, fetchSpy;

  beforeEach(() => {
    constructOptions = sinon.spy();
    fetchSpy = sinon.stub(window, 'fetch');
    defaultProps = {
      onSearchSelect: () => {},
      additionalQueryParams: {extraParam1: 1, extraParam2: 2},
      searchUrl: 'fakesearch',
      constructOptions,
    };
  });

  afterEach(() => {
    fetchSpy.restore();
  });

  it('renders default props', () => {
    const wrapper = shallow(<SearchBox {...defaultProps} />);
    expect(wrapper.find('Async').length).toBe(1);
  });

  it('searches when query is 3+ letters', () => {
    const wrapper = mount(<SearchBox {...defaultProps} />);
    let returnData = [{result: 'res1'}];
    fetchSpy.returns(
      Promise.resolve({ok: true, json: () => JSON.stringify(returnData)})
    );
    return wrapper
      .instance()
      .getOptions('abc')
      .then(() => {
        expect(fetchSpy).toHaveBeenCalledWith('/fakesearch?query=abc&limit=7&extraParam1=1&extraParam2=2');
        expect(constructOptions).toHaveBeenCalledWith(JSON.stringify(returnData));
      });
  });

  it('doesnt when query is < 3 letters', () => {
    const wrapper = mount(<SearchBox {...defaultProps} />);
    let returnData = [{result: 'res1'}];
    fetchSpy.returns(
      Promise.resolve({ok: true, json: () => JSON.stringify(returnData)})
    );
    return wrapper
      .instance()
      .getOptions('ab')
      .then(() => {
        expect(fetchSpy).not.toHaveBeenCalledWith('/fakesearch?query=abc&limit=7&courseVersionId=1');
        expect(constructOptions).not.toHaveBeenCalledWith(JSON.stringify(returnData));
      });
  });
});
