import {Button as MuiButton, Typography as MuiTypography} from '@mui/material';
import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import VersionRow from '@cdo/apps/templates/VersionRow';
import msg from '@cdo/locale';

import {expect} from '../../util/deprecatedChai'; // eslint-disable-line no-restricted-imports

describe('VersionRow', () => {
  const MINIMUM_PROPS = {
    rowIndex: 0,
    versionId: 'abcdef',
    lastModified: new Date(),
  };
  const VERSION_LABEL = msg.versionHistory_versionLabel({
    timestamp: MINIMUM_PROPS.lastModified.toLocaleString(),
  });
  const ROW_DOM_ID = `version-history-row-${MINIMUM_PROPS.rowIndex}`;
  const VERSION_LABEL_ID = `${ROW_DOM_ID}-version-label`;
  const RESTORE_BUTTON_ID = `${ROW_DOM_ID}-restore-button`;
  const VIEW_BUTTON_ID = `${ROW_DOM_ID}-view-button`;

  const findButtonByText = (wrapper, text) =>
    wrapper.find(MuiButton).filterWhere(button => button.text() === text);

  it('renders preview and restore buttons for a non-latest version', () => {
    const wrapper = shallow(
      <VersionRow
        {...MINIMUM_PROPS}
        isLatest={false}
        isSelectedVersion={false}
        isReadOnly={false}
      />
    );
    const viewButton = findButtonByText(wrapper, msg.view());
    const restoreButton = findButtonByText(wrapper, msg.restore());
    const versionLabel = wrapper
      .find(MuiTypography)
      .filterWhere(typography => typography.text() === VERSION_LABEL);

    expect(wrapper).to.not.have.className('highlight');
    expect(versionLabel.prop('id')).to.equal(VERSION_LABEL_ID);
    expect(viewButton).to.have.length(1);
    expect(viewButton.prop('id')).to.equal(VIEW_BUTTON_ID);
    expect(viewButton.prop('component')).to.equal('a');
    expect(viewButton.prop('target')).to.equal('_blank');
    expect(viewButton.prop('rel')).to.equal('noopener noreferrer');
    expect(viewButton.prop('color')).to.equal('primary');
    expect(viewButton.prop('size')).to.equal('small');
    expect(viewButton.prop('variant')).to.equal('contained');
    expect(viewButton.prop('href')).to.contain('version=abcdef');
    expect(viewButton.prop('aria-describedby')).to.equal(VERSION_LABEL_ID);

    expect(restoreButton).to.have.length(1);
    expect(restoreButton.prop('id')).to.equal(RESTORE_BUTTON_ID);
    expect(restoreButton.prop('type')).to.equal('button');
    expect(restoreButton.prop('color')).to.equal('tertiary');
    expect(restoreButton.prop('size')).to.equal('small');
    expect(restoreButton.prop('variant')).to.equal('outlined');
    expect(restoreButton.prop('aria-describedby')).to.equal(VERSION_LABEL_ID);
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
    const viewButton = findButtonByText(wrapper, msg.view());
    const restoreButton = findButtonByText(wrapper, msg.restore());

    expect(wrapper).to.have.className('highlight');
    expect(viewButton).to.have.length(1);
    expect(viewButton.prop('id')).to.equal(VIEW_BUTTON_ID);
    expect(viewButton.prop('type')).to.equal('button');
    expect(viewButton.prop('color')).to.equal('secondary');
    expect(viewButton.prop('size')).to.equal('small');
    expect(viewButton.prop('variant')).to.equal('contained');
    expect(viewButton.prop('disabled')).to.be.true;
    expect(viewButton.prop('aria-describedby')).to.equal(VERSION_LABEL_ID);

    expect(restoreButton).to.have.length(1);
    expect(restoreButton.prop('id')).to.equal(RESTORE_BUTTON_ID);
    expect(restoreButton.prop('type')).to.equal('button');
    expect(restoreButton.prop('color')).to.equal('primary');
    expect(restoreButton.prop('size')).to.equal('small');
    expect(restoreButton.prop('variant')).to.equal('contained');
    expect(restoreButton.prop('aria-describedby')).to.equal(VERSION_LABEL_ID);
  });

  it('renders a disabled button for the latest version', () => {
    const wrapper = shallow(
      <VersionRow
        {...MINIMUM_PROPS}
        isLatest={true}
        isSelectedVersion={true}
        isReadOnly={false}
      />
    );
    const latestVersionMessage = wrapper
      .find(MuiTypography)
      .filterWhere(typography => typography.text() === msg.latestVersion());
    const viewButton = findButtonByText(wrapper, msg.view());

    expect(latestVersionMessage).to.have.length(1);
    expect(latestVersionMessage.prop('component')).to.equal('span');
    expect(latestVersionMessage.prop('variant')).to.equal('body2');
    expect(viewButton.prop('disabled')).to.be.true;
    expect(viewButton.prop('aria-describedby')).to.equal(VERSION_LABEL_ID);
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

    findButtonByText(wrapper, msg.restore()).simulate('click');
    expect(onChoose).to.have.been.calledOnce;
  });
});
