import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {ImportProjectDialog} from '@cdo/apps/applab/ImportProjectDialog';
import {
  sources as sourcesApi,
  channels as channelsApi,
} from '@cdo/apps/clientApi';

describe('Applab ImportProjectDialog component', function () {
  var form, urlInput, nextButton;

  const defaultProps = {
    onImport: () => {},
  };

  beforeEach(() => {
    jest.spyOn(sourcesApi, 'ajax').mockClear().mockImplementation();
    jest.spyOn(channelsApi, 'ajax').mockClear().mockImplementation();
  });

  afterEach(() => {
    sourcesApi.ajax.mockRestore();
    channelsApi.ajax.mockRestore();
  });

  function render(theForm) {
    form = shallow(theForm);
    urlInput = form.find('input');
    nextButton = form.find('Confirm');
  }

  it('renders a div with a text input and next button', () => {
    render(<ImportProjectDialog {...defaultProps} />);
    expect(urlInput).toHaveLength(1);
    expect(nextButton).toHaveLength(1);
  });

  it('renders a warning if there was an error', () => {
    render(<ImportProjectDialog {...defaultProps} error={true} />);
    expect(form.find('p').last().text()).toBe(
      "We can't seem to find this project. " +
        "Please make sure you've entered a valid App Lab project URL."
    );
  });

  it('it disables the next button and shows a spinner while the url is fetched', () => {
    render(<ImportProjectDialog {...defaultProps} isFetching={true} />);
    expect(nextButton.prop('disabled')).toBe(true);
    expect(nextButton.find('.fa-spin')).toHaveLength(1);
  });

  it('calls the onImport prop with the url when the next button is clicked', () => {
    var onImport = jest.fn();
    render(<ImportProjectDialog {...defaultProps} onImport={onImport} />);
    urlInput.simulate('change', {target: {value: 'some url'}});
    nextButton.simulate('click');
    expect(onImport).toHaveBeenCalledWith('some url');
  });
});
