import React from 'react';
import {expect} from '../util/deprecatedChai';
import {mount} from 'enzyme';
import sinon from 'sinon';
import ShareWarningsDialog from '@cdo/apps/templates/ShareWarningsDialog';
import commonMsg from '@cdo/locale';

describe('ShareWarningsDialog', () => {
  it('renders ShareWarnings with age prompt', () => {
    const closeSpy = sinon.spy();
    const tooYoungSpy = sinon.spy();
    const dialog = mount(
      <ShareWarningsDialog
        showStoreDataAlert={false}
        promptForAge={true}
        handleClose={closeSpy}
        handleTooYoung={tooYoungSpy}
      />
    );
    expect(dialog.state('modalIsOpen')).to.be.true;
    const shareWarnings = dialog.find('ShareWarnings');
    expect(shareWarnings).to.have.length(1);
    expect(shareWarnings.props().promptForAge).to.be.true;
    expect(shareWarnings.props().showStoreDataAlert).to.be.false;
    const ageDropdown = shareWarnings.find('AgeDropdown');
    expect(ageDropdown).to.have.length(1);
    expect(shareWarnings).to.containMatchingElement(
      <div>{commonMsg.shareWarningsAge()}</div>
    );
  });

  it('renders ShareWarnings with data alert', () => {
    const closeSpy = sinon.spy();
    const tooYoungSpy = sinon.spy();
    const dialog = mount(
      <ShareWarningsDialog
        showStoreDataAlert={true}
        promptForAge={false}
        handleClose={closeSpy}
        handleTooYoung={tooYoungSpy}
      />
    );
    expect(dialog.state('modalIsOpen')).to.be.true;
    const shareWarnings = dialog.find('ShareWarnings');
    expect(shareWarnings).to.have.length(1);
    expect(shareWarnings.props().showStoreDataAlert).to.be.true;
    expect(shareWarnings.props().promptForAge).to.be.false;
    expect(shareWarnings).to.containMatchingElement(
      <div>
        {commonMsg.shareWarningsStoreDataBeforeHighlight()}
        <span>{commonMsg.shareWarningsStoreDataHighlight()}</span>
        {commonMsg.shareWarningsStoreDataAfterHighlight()}
      </div>
    );
    expect(shareWarnings.find('AgeDropdown')).to.have.length(0);
  });

  it('renders ShareWarnings with both data alert and age prompt', () => {
    const closeSpy = sinon.spy();
    const tooYoungSpy = sinon.spy();
    const dialog = mount(
      <ShareWarningsDialog
        showStoreDataAlert={true}
        promptForAge={true}
        handleClose={closeSpy}
        handleTooYoung={tooYoungSpy}
      />
    );
    expect(dialog.state('modalIsOpen')).to.be.true;
    const shareWarnings = dialog.find('ShareWarnings');
    expect(shareWarnings).to.have.length(1);
    expect(shareWarnings.props().showStoreDataAlert).to.be.true;
    expect(shareWarnings.props().promptForAge).to.be.true;
    const ageDropdown = shareWarnings.find('AgeDropdown');
    expect(ageDropdown).to.have.length(1);
    expect(shareWarnings).to.containMatchingElement(
      <div>{commonMsg.shareWarningsAge()}</div>
    );
    expect(shareWarnings).to.containMatchingElement(
      <div>
        {commonMsg.shareWarningsStoreDataBeforeHighlight()}
        <span>{commonMsg.shareWarningsStoreDataHighlight()}</span>
        {commonMsg.shareWarningsStoreDataAfterHighlight()}
      </div>
    );
  });

  it('does not show the dialog if not needed', () => {
    const closeSpy = sinon.spy();
    const tooYoungSpy = sinon.spy();
    const dialog = mount(
      <ShareWarningsDialog
        showStoreDataAlert={false}
        promptForAge={false}
        handleClose={closeSpy}
        handleTooYoung={tooYoungSpy}
      />
    );
    expect(dialog.state('modalIsOpen')).to.be.false;
  });

  it('calls handleClose if we click OK when age is known', () => {
    const closeSpy = sinon.spy();
    const tooYoungSpy = sinon.spy();
    const dialog = mount(
      <ShareWarningsDialog
        showStoreDataAlert={true}
        promptForAge={false}
        handleClose={closeSpy}
        handleTooYoung={tooYoungSpy}
      />
    );
    expect(dialog.state('modalIsOpen')).to.be.true;
    expect(dialog).to.containMatchingElement(
      <button type="button">{commonMsg.dialogOK()}</button>
    );
    expect(closeSpy).not.to.have.been.called;
    dialog.find('button').simulate('click');
    expect(closeSpy).to.have.been.called;
    expect(dialog.state('modalIsOpen')).to.be.false;
  });

  it('does not calls handleClose if we click OK when age is unknown', () => {
    const closeSpy = sinon.spy();
    const tooYoungSpy = sinon.spy();
    const dialog = mount(
      <ShareWarningsDialog
        showStoreDataAlert={true}
        promptForAge={true}
        handleClose={closeSpy}
        handleTooYoung={tooYoungSpy}
      />
    );
    expect(dialog.state('modalIsOpen')).to.be.true;
    expect(dialog).to.containMatchingElement(
      <button type="button">{commonMsg.dialogOK()}</button>
    );
    expect(closeSpy).not.to.have.been.called;
    dialog.find('button').simulate('click');
    expect(closeSpy).not.to.have.been.called;
    expect(dialog.state('modalIsOpen')).to.be.true;
  });

  it('calls handleClose if we specify age >=13, then click OK', () => {
    const closeSpy = sinon.spy();
    const tooYoungSpy = sinon.spy();
    const dialog = mount(
      <ShareWarningsDialog
        showStoreDataAlert={true}
        promptForAge={true}
        handleClose={closeSpy}
        handleTooYoung={tooYoungSpy}
      />
    );
    expect(dialog.state('modalIsOpen')).to.be.true;
    expect(dialog).to.containMatchingElement(
      <button type="button">{commonMsg.dialogOK()}</button>
    );
    expect(closeSpy).not.to.have.been.called;
    const ageDropdown = dialog.find('AgeDropdown');
    const select = ageDropdown.find('select');
    const selectDOMNode = select.getDOMNode();
    selectDOMNode.value = '15';
    select.simulate('change', {target: selectDOMNode});
    dialog.find('button').simulate('click');
    expect(closeSpy).to.have.been.called;
    expect(tooYoungSpy).not.to.have.been.called;
    expect(dialog.state('modalIsOpen')).to.be.false;
  });

  it('calls handleTooYoung if we specify age < 13, then click OK', () => {
    const closeSpy = sinon.spy();
    const tooYoungSpy = sinon.spy();
    const dialog = mount(
      <ShareWarningsDialog
        showStoreDataAlert={true}
        promptForAge={true}
        handleClose={closeSpy}
        handleTooYoung={tooYoungSpy}
      />
    );
    expect(dialog.state('modalIsOpen')).to.be.true;
    expect(dialog).to.containMatchingElement(
      <button type="button">{commonMsg.dialogOK()}</button>
    );
    expect(closeSpy).not.to.have.been.called;
    expect(tooYoungSpy).not.to.have.been.called;
    const ageDropdown = dialog.find('AgeDropdown');
    const select = ageDropdown.find('select');
    const selectDOMNode = select.getDOMNode();
    selectDOMNode.value = '10';
    select.simulate('change', {target: selectDOMNode});
    dialog.find('button').simulate('click');
    expect(tooYoungSpy).to.have.been.called;
    expect(closeSpy).not.to.have.been.called;
    expect(dialog.state('modalIsOpen')).to.be.false;
  });
});
