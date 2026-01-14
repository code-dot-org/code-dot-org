import {render, screen, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import {UnconnectedBackpack as Backpack} from '@cdo/apps/javalab/Backpack';
import {DisplayTheme} from '@cdo/apps/javalab/DisplayTheme';
import javalab from '@cdo/apps/javalab/redux/javalabRedux';
import {registerReducers, stubRedux, restoreRedux} from '@cdo/apps/redux';
import {BackpackAPIContext} from '@cdo/apps/sharedComponents/backpack/BackpackAPIContext';
import BackpackClientApi from '@cdo/apps/sharedComponents/backpack/BackpackClientApi';
import javalabMsg from '@cdo/javalab/locale';

import {expect} from '../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

describe('Java Lab Backpack Test', () => {
  let defaultProps, backpackApiStub;

  beforeEach(() => {
    stubRedux();
    registerReducers({javalab});
    backpackApiStub = sinon.createStubInstance(BackpackClientApi);
    backpackApiStub.hasBackpack.returns(true);
    defaultProps = {
      displayTheme: DisplayTheme.DARK,
      isButtonDisabled: false,
      onImport: () => {},
      backpackEnabled: true,
      sources: {},
      validation: {},
    };
  });

  afterEach(() => {
    restoreRedux();
  });

  const renderWithProps = props => {
    return render(
      <BackpackAPIContext.Provider value={backpackApiStub}>
        <Backpack {...{...defaultProps, ...props}} />
      </BackpackAPIContext.Provider>
    );
  };

  const openBackpack = async user => {
    await user.click(screen.getByRole('button', {name: /backpack/i}));
  };

  it('updates selected files correctly', async () => {
    const user = userEvent.setup();
    renderWithProps({});
    backpackApiStub.getFileList.callsArgWith(1, [
      'Class1.java',
      'Class2.java',
      'Class3.java',
    ]);

    await openBackpack(user);
    await screen.findByLabelText('Class1.java');
    await user.click(screen.getByLabelText('Class1.java'));
    await user.click(screen.getByLabelText('Class2.java'));
    await user.click(screen.getByLabelText('Class3.java'));
    await user.click(screen.getByLabelText('Class1.java'));
    await user.click(screen.getByRole('button', {name: javalabMsg.delete()}));

    const confirmMessage = await screen.findByText(
      javalabMsg.fileDeleteConfirm()
    );
    const dialog = confirmMessage.closest('.modal');
    expect(dialog).to.not.equal(null);
    const dialogQueries = within(dialog);
    expect(dialogQueries.queryByText('Class1.java')).to.equal(null);
    expect(dialogQueries.getByText('Class2.java')).to.not.equal(null);
    expect(dialogQueries.getByText('Class3.java')).to.not.equal(null);
  });

  it('expand dropdown triggers getFileList', async () => {
    const user = userEvent.setup();
    renderWithProps({});
    await openBackpack(user);
    expect(backpackApiStub.getFileList.calledOnce).to.be.true;
  });

  it('expand dropdown resets state correctly', async () => {
    const user = userEvent.setup();
    renderWithProps({});
    backpackApiStub.getFileList.onCall(0).callsArgWith(1, ['file1', 'file2']);
    backpackApiStub.getFileList.onCall(1).callsArgWith(1, ['file1', 'file2']);

    await openBackpack(user);
    await screen.findByLabelText('file1');
    await user.click(screen.getByLabelText('file1'));
    expect(
      screen.getByRole('button', {name: javalabMsg.import()}).disabled
    ).to.equal(false);
    await openBackpack(user);
    await openBackpack(user);
    await screen.findByLabelText('file1');
    expect(
      screen.getByRole('button', {name: javalabMsg.import()}).disabled
    ).to.equal(true);
  });

  it('import shows warning before overwriting files', async () => {
    const user = userEvent.setup();
    const otherProps = {
      sources: {file1: {isVisible: true}, file2: {isVisible: true}},
    };
    renderWithProps(otherProps);
    backpackApiStub.getFileList.callsArgWith(1, ['file1', 'file2', 'file3']);

    await openBackpack(user);
    await screen.findByLabelText('file1');
    await user.click(screen.getByLabelText('file1'));
    await user.click(screen.getByLabelText('file3'));
    await user.click(screen.getByRole('button', {name: javalabMsg.import()}));

    const warningMessage = await screen.findByText(
      javalabMsg.fileImportWarning()
    );
    const dialog = warningMessage.closest('.modal');
    expect(dialog).to.not.equal(null);
    const dialogQueries = within(dialog);
    expect(dialogQueries.getByText('file1')).to.not.equal(null);
    expect(dialogQueries.queryByText('file3')).to.equal(null);
  });

  it('import shows error if hidden file name is used', async () => {
    const user = userEvent.setup();
    const otherProps = {
      sources: {visibleFile: {isVisible: true}, hiddenFile: {isVisible: false}},
    };
    renderWithProps(otherProps);
    backpackApiStub.getFileList.callsArgWith(1, [
      'visibleFile',
      'hiddenFile',
      'file3',
    ]);

    await openBackpack(user);
    await screen.findByLabelText('hiddenFile');
    await user.click(screen.getByLabelText('hiddenFile'));
    await user.click(screen.getByLabelText('file3'));
    await user.click(screen.getByRole('button', {name: javalabMsg.import()}));

    const errorMessage = await screen.findByText(javalabMsg.fileImportError());
    const dialog = errorMessage.closest('.modal');
    expect(dialog).to.not.equal(null);
    const dialogQueries = within(dialog);
    expect(dialogQueries.getByText('hiddenFile')).to.not.equal(null);
  });

  it('no dialog shown if there are no duplicate file names', async () => {
    const user = userEvent.setup();
    renderWithProps({});
    backpackApiStub.getFileList.callsArgWith(1, ['file1', 'file2', 'file3']);

    await openBackpack(user);
    await screen.findByLabelText('file2');
    await user.click(screen.getByLabelText('file2'));
    await user.click(screen.getByLabelText('file3'));
    await user.click(screen.getByRole('button', {name: javalabMsg.import()}));

    expect(screen.queryByText(javalabMsg.fileImportWarning())).to.equal(null);
    expect(screen.queryByText(javalabMsg.fileImportError())).to.equal(null);
    expect(screen.queryByRole('button', {name: javalabMsg.import()})).to.equal(
      null
    );
  });

  it('renders nothing if backpack is disabled', () => {
    const {container} = renderWithProps({backpackEnabled: false});
    expect(container.firstChild).to.equal(null);
  });

  it('delete shows warning before deleting files', async () => {
    const user = userEvent.setup();
    const otherProps = {
      sources: {file1: {isVisible: true}, file2: {isVisible: true}},
    };
    renderWithProps(otherProps);
    backpackApiStub.getFileList.callsArgWith(1, ['file1', 'file2', 'file3']);

    await openBackpack(user);
    await screen.findByLabelText('file1');
    await user.click(screen.getByLabelText('file1'));
    await user.click(screen.getByLabelText('file3'));
    await user.click(screen.getByRole('button', {name: javalabMsg.delete()}));

    const confirmMessage = await screen.findByText(
      javalabMsg.fileDeleteConfirm()
    );
    const dialog = confirmMessage.closest('.modal');
    expect(dialog).to.not.equal(null);
    const dialogQueries = within(dialog);
    expect(dialogQueries.getByText('file1')).to.not.equal(null);
    expect(dialogQueries.getByText('file3')).to.not.equal(null);
  });

  it('dropdown and modal are closed if delete succeeds', async () => {
    const user = userEvent.setup();
    const otherProps = {
      sources: {file1: {isVisible: true}, file2: {isVisible: true}},
    };
    renderWithProps(otherProps);
    // set up delete files to call success callback
    backpackApiStub.deleteFiles.callsArg(2);
    backpackApiStub.getFileList.callsArgWith(1, ['file1', 'file2', 'file3']);

    await openBackpack(user);
    await screen.findByLabelText('file1');
    await user.click(screen.getByLabelText('file1'));
    await user.click(screen.getByLabelText('file3'));
    await user.click(screen.getByRole('button', {name: javalabMsg.delete()}));

    const confirmMessage = await screen.findByText(
      javalabMsg.fileDeleteConfirm()
    );
    const dialog = confirmMessage.closest('.modal');
    expect(dialog).to.not.equal(null);
    await user.click(
      within(dialog).getByRole('button', {name: javalabMsg.delete()})
    );
    expect(screen.queryByText(javalabMsg.fileDeleteConfirm())).to.equal(null);
    expect(screen.queryByLabelText('file1')).to.equal(null);
  });

  it('Delete error modal is shown if delete fails', async () => {
    const user = userEvent.setup();
    const otherProps = {
      sources: {file1: {isVisible: true}, file2: {isVisible: true}},
    };
    renderWithProps(otherProps);
    // set up delete files to call failure callback
    backpackApiStub.deleteFiles.callsArgWith(1, null, ['file1', 'file3']);
    backpackApiStub.getFileList.callsArgWith(1, ['file1', 'file2', 'file3']);

    await openBackpack(user);
    await screen.findByLabelText('file1');
    await user.click(screen.getByLabelText('file1'));
    await user.click(screen.getByLabelText('file3'));
    await user.click(screen.getByRole('button', {name: javalabMsg.delete()}));

    const confirmMessage = await screen.findByText(
      javalabMsg.fileDeleteConfirm()
    );
    const dialog = confirmMessage.closest('.modal');
    expect(dialog).to.not.equal(null);
    await user.click(
      within(dialog).getByRole('button', {name: javalabMsg.delete()})
    );
    await screen.findByText(javalabMsg.fileDeleteError());
  });

  it('Deleted files are removed from dropdown on partial delete success', async () => {
    const user = userEvent.setup();
    const otherProps = {
      sources: {file1: {isVisible: true}, file2: {isVisible: true}},
    };
    renderWithProps(otherProps);
    // set up delete files to call failure callback where only file 1 failed to delete
    backpackApiStub.deleteFiles.callsArgWith(1, null, ['file1']);
    backpackApiStub.getFileList.callsArgWith(1, ['file1', 'file2', 'file3']);

    await openBackpack(user);
    await screen.findByLabelText('file1');
    await user.click(screen.getByLabelText('file1'));
    await user.click(screen.getByLabelText('file3'));
    await user.click(screen.getByRole('button', {name: javalabMsg.delete()}));

    const confirmMessage = await screen.findByText(
      javalabMsg.fileDeleteConfirm()
    );
    const dialog = confirmMessage.closest('.modal');
    expect(dialog).to.not.equal(null);
    await user.click(
      within(dialog).getByRole('button', {name: javalabMsg.delete()})
    );
    await screen.findByText(javalabMsg.fileDeleteError());
    expect(screen.queryByLabelText('file3')).to.equal(null);
  });
});
