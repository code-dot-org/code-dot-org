import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import {expect} from '../../util/deprecatedChai';
import VersionRow from '@cdo/apps/templates/VersionRow';
import msg from '@cdo/locale';

describe('VersionRow', () => {
  const MINIMUM_PROPS = {
    versionId: 'abcdef',
    lastModified: new Date()
  };

  it('renders preview and restore buttons for a non-latest version', () => {
    const wrapper = shallow(
      <VersionRow
        {...MINIMUM_PROPS}
        isLatest={false}
        isViewingVersion={false}
        isProjectOwned={true}
      />
    );
    expect(wrapper).to.not.have.className('highlight');
    expect(wrapper).to.containMatchingElement(
      <a target="_blank">
        <button type="button" className="version-preview">
          <i className="fa fa-eye" />
        </button>
      </a>
    );
    expect(wrapper).to.containMatchingElement(
      <button type="button" className="btn-info">
        {msg.restoreThisVersion()}
      </button>
    );
  });

  it('renders just restore button for viewed version', () => {
    const wrapper = shallow(
      <VersionRow
        {...MINIMUM_PROPS}
        isLatest={false}
        isViewingVersion={true}
        isProjectOwned={true}
      />
    );
    expect(wrapper).to.have.className('highlight');
    expect(wrapper).to.not.containMatchingElement(
      <a target="_blank">
        <button type="button" className="version-preview">
          <i className="fa fa-eye" />
        </button>
      </a>
    );
    expect(wrapper).to.containMatchingElement(
      <button type="button" className="btn-info">
        {msg.restoreThisVersion()}
      </button>
    );
  });

  it('renders a disabled button for the latest version', () => {
    const wrapper = shallow(
      <VersionRow
        {...MINIMUM_PROPS}
        isLatest={true}
        isViewingVersion={false}
        isProjectOwned={true}
      />
    );
    expect(wrapper).to.containMatchingElement(
      <button type="button" className="btn-default" disabled="disabled">
        {msg.currentVersion()}
      </button>
    );
  });

  it('calls onChoose when restore button is clicked', () => {
    const onChoose = sinon.spy();
    const wrapper = shallow(
      <VersionRow
        {...MINIMUM_PROPS}
        isLatest={false}
        isViewingVersion={false}
        isProjectOwned={true}
        onChoose={onChoose}
      />
    );
    expect(onChoose).not.to.have.been.called;

    wrapper.find('.btn-info').simulate('click');
    expect(onChoose).to.have.been.calledOnce;
  });
});
