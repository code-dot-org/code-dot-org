import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import VersionRow from '@cdo/apps/templates/VersionRow';
import msg from '@cdo/locale';

import {expect} from '../../util/deprecatedChai'; // eslint-disable-line no-restricted-imports

describe('VersionRow', () => {
  const MINIMUM_PROPS = {
    versionId: 'abcdef',
    lastModified: new Date(),
  };

  it('renders preview and restore buttons for a non-latest version', () => {
    const wrapper = shallow(
      <VersionRow
        {...MINIMUM_PROPS}
        isLatest={false}
        isSelectedVersion={false}
        isReadOnly={false}
      />
    );
    expect(wrapper).to.not.have.className('highlight');
    expect(wrapper).to.containMatchingElement(
      <a target="_blank">
        <button type="button" className="btn-info">
          {msg.view()}
        </button>
      </a>
    );
    expect(wrapper).to.containMatchingElement(
      <button type="button" className="img-upload">
        {msg.restore()}
      </button>
    );
  });

  it('renders restore button and disabled view button for selected version', () => {
    const wrapper = shallow(
      <VersionRow
        {...MINIMUM_PROPS}
        isLatest={false}
        isSelectedVersion={true}
        isReadOnly={false}
      />
    );
    expect(wrapper).to.have.className('highlight');
    expect(wrapper).to.containMatchingElement(
      <button type="button" className="btn-default">
        {msg.view()}
      </button>
    );
    expect(wrapper).to.containMatchingElement(
      <button type="button" className="btn-info">
        {msg.restore()}
      </button>
    );
  });

  it('renders a disabled button for the latest version', () => {
    const wrapper = shallow(
      <VersionRow
        {...MINIMUM_PROPS}
        isLatest={true}
        isSelectedVersion={false}
        isReadOnly={false}
      />
    );
    expect(wrapper).to.containMatchingElement(
      <button
        key={'latest-version-message'}
        type="button"
        className="btn-default"
        disabled="disabled"
        style={{cursor: 'default', background: 'none', border: 'none'}}
      >
        {msg.latestVersion()}
      </button>
    );
  });

  it('calls onChoose when restore button is clicked', () => {
    const onChoose = sinon.spy();
    const wrapper = shallow(
      <VersionRow
        {...MINIMUM_PROPS}
        isLatest={false}
        isSelectedVersion={false}
        isReadOnly={false}
        onChoose={onChoose}
      />
    );
    expect(onChoose).not.to.have.been.called;

    wrapper.find('.img-upload').simulate('click');
    expect(onChoose).to.have.been.calledOnce;
  });
});
