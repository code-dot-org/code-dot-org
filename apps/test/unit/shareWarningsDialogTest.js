import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import ShareWarningsDialog from '@cdo/apps/templates/ShareWarningsDialog';
import commonMsg from '@cdo/locale';

describe('ShareWarningsDialog', () => {
  it('renders ShareWarnings with age prompt', () => {
    const closeSpy = jest.fn();
    const tooYoungSpy = jest.fn();
    const dialog = mount(
      <ShareWarningsDialog
        showStoreDataAlert={false}
        promptForAge={true}
        handleClose={closeSpy}
        handleTooYoung={tooYoungSpy}
      />
    );
    expect(dialog.state('modalIsOpen')).toBe(true);
    const shareWarnings = dialog.find('ShareWarnings');
    expect(shareWarnings).toHaveLength(1);
    expect(shareWarnings.props().promptForAge).toBe(true);
    expect(shareWarnings.props().showStoreDataAlert).toBe(false);
    const ageDropdown = shareWarnings.find('AgeDropdown');
    expect(ageDropdown).toHaveLength(1);
    expect(
      shareWarnings.containsMatchingElement(
        <div>{commonMsg.shareWarningsAge()}</div>
      )
    ).toBe(true);
  });

  it('renders ShareWarnings with data alert', () => {
    const closeSpy = jest.fn();
    const tooYoungSpy = jest.fn();
    const dialog = mount(
      <ShareWarningsDialog
        showStoreDataAlert={true}
        promptForAge={false}
        handleClose={closeSpy}
        handleTooYoung={tooYoungSpy}
      />
    );
    expect(dialog.state('modalIsOpen')).toBe(true);
    const shareWarnings = dialog.find('ShareWarnings');
    expect(shareWarnings).toHaveLength(1);
    expect(shareWarnings.props().showStoreDataAlert).toBe(true);
    expect(shareWarnings.props().promptForAge).toBe(false);
    expect(
      shareWarnings.containsMatchingElement(
        <div>
          {commonMsg.shareWarningsStoreDataBeforeHighlight()}
          <span>{commonMsg.shareWarningsStoreDataHighlight()}</span>
          {commonMsg.shareWarningsStoreDataAfterHighlight()}
        </div>
      )
    ).toBe(true);
    expect(shareWarnings.find('AgeDropdown')).toHaveLength(0);
  });

  it('renders ShareWarnings with both data alert and age prompt', () => {
    const closeSpy = jest.fn();
    const tooYoungSpy = jest.fn();
    const dialog = mount(
      <ShareWarningsDialog
        showStoreDataAlert={true}
        promptForAge={true}
        handleClose={closeSpy}
        handleTooYoung={tooYoungSpy}
      />
    );
    expect(dialog.state('modalIsOpen')).toBe(true);
    const shareWarnings = dialog.find('ShareWarnings');
    expect(shareWarnings).toHaveLength(1);
    expect(shareWarnings.props().showStoreDataAlert).toBe(true);
    expect(shareWarnings.props().promptForAge).toBe(true);
    const ageDropdown = shareWarnings.find('AgeDropdown');
    expect(ageDropdown).toHaveLength(1);
    expect(
      shareWarnings.containsMatchingElement(
        <div>{commonMsg.shareWarningsAge()}</div>
      )
    ).toBe(true);
    expect(
      shareWarnings.containsMatchingElement(
        <div>
          {commonMsg.shareWarningsStoreDataBeforeHighlight()}
          <span>{commonMsg.shareWarningsStoreDataHighlight()}</span>
          {commonMsg.shareWarningsStoreDataAfterHighlight()}
        </div>
      )
    ).toBe(true);
  });

  it('does not show the dialog if not needed', () => {
    const closeSpy = jest.fn();
    const tooYoungSpy = jest.fn();
    const dialog = mount(
      <ShareWarningsDialog
        showStoreDataAlert={false}
        promptForAge={false}
        handleClose={closeSpy}
        handleTooYoung={tooYoungSpy}
      />
    );
    expect(dialog.state('modalIsOpen')).toBe(false);
  });

  it('calls handleClose if we click OK when age is known', () => {
    const closeSpy = jest.fn();
    const tooYoungSpy = jest.fn();
    const dialog = mount(
      <ShareWarningsDialog
        showStoreDataAlert={true}
        promptForAge={false}
        handleClose={closeSpy}
        handleTooYoung={tooYoungSpy}
      />
    );
    expect(dialog.state('modalIsOpen')).toBe(true);
    expect(
      dialog.containsMatchingElement(
        <button type="button">{commonMsg.dialogOK()}</button>
      )
    ).toBe(true);
    expect(closeSpy).not.toHaveBeenCalled();
    dialog.find('button').simulate('click');
    expect(closeSpy).toHaveBeenCalled();
    expect(dialog.state('modalIsOpen')).toBe(false);
  });

  it('does not calls handleClose if we click OK when age is unknown', () => {
    const closeSpy = jest.fn();
    const tooYoungSpy = jest.fn();
    const dialog = mount(
      <ShareWarningsDialog
        showStoreDataAlert={true}
        promptForAge={true}
        handleClose={closeSpy}
        handleTooYoung={tooYoungSpy}
      />
    );
    expect(dialog.state('modalIsOpen')).toBe(true);
    expect(
      dialog.containsMatchingElement(
        <button type="button">{commonMsg.dialogOK()}</button>
      )
    ).toBe(true);
    expect(closeSpy).not.toHaveBeenCalled();
    dialog.find('button').simulate('click');
    expect(closeSpy).not.toHaveBeenCalled();
    expect(dialog.state('modalIsOpen')).toBe(true);
  });

  it('calls handleClose if we specify age >=13, then click OK', () => {
    const closeSpy = jest.fn();
    const tooYoungSpy = jest.fn();
    const dialog = mount(
      <ShareWarningsDialog
        showStoreDataAlert={true}
        promptForAge={true}
        handleClose={closeSpy}
        handleTooYoung={tooYoungSpy}
      />
    );
    expect(dialog.state('modalIsOpen')).toBe(true);
    expect(
      dialog.containsMatchingElement(
        <button type="button">{commonMsg.dialogOK()}</button>
      )
    ).toBe(true);
    expect(closeSpy).not.toHaveBeenCalled();
    const ageDropdown = dialog.find('AgeDropdown');
    const select = ageDropdown.find('select');
    const selectDOMNode = select.getDOMNode();
    selectDOMNode.value = '15';
    select.simulate('change', {target: selectDOMNode});
    dialog.find('button').simulate('click');
    expect(closeSpy).toHaveBeenCalled();
    expect(tooYoungSpy).not.toHaveBeenCalled();
    expect(dialog.state('modalIsOpen')).toBe(false);
  });

  it('calls handleTooYoung if we specify age < 13, then click OK', () => {
    const closeSpy = jest.fn();
    const tooYoungSpy = jest.fn();
    const dialog = mount(
      <ShareWarningsDialog
        showStoreDataAlert={true}
        promptForAge={true}
        handleClose={closeSpy}
        handleTooYoung={tooYoungSpy}
      />
    );
    expect(dialog.state('modalIsOpen')).toBe(true);
    expect(
      dialog.containsMatchingElement(
        <button type="button">{commonMsg.dialogOK()}</button>
      )
    ).toBe(true);
    expect(closeSpy).not.toHaveBeenCalled();
    expect(tooYoungSpy).not.toHaveBeenCalled();
    const ageDropdown = dialog.find('AgeDropdown');
    const select = ageDropdown.find('select');
    const selectDOMNode = select.getDOMNode();
    selectDOMNode.value = '10';
    select.simulate('change', {target: selectDOMNode});
    dialog.find('button').simulate('click');
    expect(tooYoungSpy).toHaveBeenCalled();
    expect(closeSpy).not.toHaveBeenCalled();
    expect(dialog.state('modalIsOpen')).toBe(false);
  });
});
