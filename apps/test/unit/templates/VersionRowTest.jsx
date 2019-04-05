import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import {expect} from '../../util/reconfiguredChai';
import VersionRow from '@cdo/apps/templates/VersionRow';
import msg from '@cdo/locale';

describe('VersionRow', () => {
  const MINIMUM_PROPS = {
    versionId: 'abcdef',
    lastModified: new Date()
  };

  it('renders preview and restore buttons for a non-current version', () => {
    const wrapper = shallow(<VersionRow {...MINIMUM_PROPS} isLatest={false} />);
    expect(
      wrapper.containsMatchingElement(
        <a target="_blank">
          <button type="button" className="version-preview">
            <i className="fa fa-eye" />
          </button>
        </a>
      )
    ).to.be.ok;
    expect(
      wrapper.containsMatchingElement(
        <button type="button" className="btn-info">
          {msg.restoreThisVersion()}
        </button>
      )
    ).to.be.ok;
  });

  it('renders a disabled button for the current version', () => {
    const wrapper = shallow(<VersionRow {...MINIMUM_PROPS} isLatest={true} />);
    expect(
      wrapper.containsMatchingElement(
        <button type="button" className="btn-default" disabled="disabled">
          {msg.currentVersion()}
        </button>
      )
    ).to.be.ok;
  });

  it('calls onChoose when restore button is clicked', () => {
    const onChoose = sinon.spy();
    const wrapper = shallow(
      <VersionRow {...MINIMUM_PROPS} isLatest={false} onChoose={onChoose} />
    );
    expect(onChoose).not.to.have.been.called;

    wrapper.find('.btn-info').simulate('click');
    expect(onChoose).to.have.been.calledOnce;
  });
});
