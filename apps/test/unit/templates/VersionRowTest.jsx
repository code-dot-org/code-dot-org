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
        isSelectedVersion={false}
        isReadOnly={false}
      />
    );
    expect(wrapper).to.not.have.className('highlight');
    expect(wrapper).to.containMatchingElement(
      <a target="_blank">
        <button type="button" className="btn-info">
          <i className="fa fa-eye" />
        </button>
      </a>
    );
    expect(wrapper).to.containMatchingElement(
      <button type="button" className="img-upload">
        {msg.restore()}
      </button>
    );
  });

  it('renders just restore button for viewed version', () => {
    const wrapper = shallow(
      <VersionRow
        {...MINIMUM_PROPS}
        isLatest={false}
        isSelectedVersion={true}
        isReadOnly={false}
      />
    );
    expect(wrapper).to.have.className('highlight');
    expect(wrapper).to.not.containMatchingElement(
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
      <div
        key={'latest-version-message'}
        style={{marginRight: '20px', fontSize: 18}}
      >
        {msg.latestVersion()}
      </div>
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
