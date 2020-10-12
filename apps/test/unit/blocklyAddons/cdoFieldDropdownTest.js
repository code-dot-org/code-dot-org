/* global Blockly GoogleBlockly */
import {expect} from '../../util/reconfiguredChai';
import sinon from 'sinon';
import '@cdo/apps/flappy/flappy'; // Importing the app forces the test to load Blockly
import CdoFieldDropdown from '@cdo/apps/blocklyAddons/cdoFieldDropdown';

describe('Google Blockly Wrapper', () => {
  const cdoBlockly = Blockly;
  const fieldDropdown = new CdoFieldDropdown([
    ['first', 'ITEM1'],
    ['second', 'ITEM2']
  ]);

  beforeEach(() => {
    Blockly = GoogleBlockly; // eslint-disable-line no-global-assign
  });
  afterEach(() => {
    // reset Blockly for other tests
    Blockly = cdoBlockly; // eslint-disable-line no-global-assign
    sinon.restore();
  });

  describe('changeHandler', () => {
    let spy, fieldDropdownWithChangeHandler;
    beforeEach(() => {
      spy = sinon.spy();
      fieldDropdownWithChangeHandler = new CdoFieldDropdown(
        [['first', 'ITEM1'], ['second', 'ITEM2']],
        spy
      );
    });
    it('only calls the change handler if the value changes', () => {
      fieldDropdownWithChangeHandler.getSourceBlock = sinon.fake.returns({
        isInsertionMarker_: false
      });
      fieldDropdownWithChangeHandler.setValue('ITEM2');
      expect(spy).to.have.been.calledOnce;
      fieldDropdownWithChangeHandler.setValue('ITEM2');
      expect(spy).to.have.been.calledOnce;
      fieldDropdownWithChangeHandler.setValue('ITEM1');
      expect(spy).to.have.been.calledTwice;
    });
    it('never calls the change handler for insertion marker blocks', () => {
      fieldDropdownWithChangeHandler.getSourceBlock = sinon.fake.returns({
        isInsertionMarker_: true
      });
      fieldDropdownWithChangeHandler.setValue('ITEM2');
      expect(spy).not.to.have.been.called;
    });
  });

  describe('doClassValidation_', () => {
    it('allows valid options', () => {
      expect(fieldDropdown.doClassValidation_('ITEM1')).to.equal('ITEM1');
      expect(fieldDropdown.doClassValidation_('ITEM2')).to.equal('ITEM2');
    });
    it('does not allow invalid options', () => {
      expect(fieldDropdown.doClassValidation_('ITEM3')).to.equal(null);
    });
    it('allows ??? values', () => {
      expect(fieldDropdown.doClassValidation_('???')).to.equal('???');
    });
  });

  describe('doValueUpdate_', () => {
    it('allows valid options', () => {
      fieldDropdown.doValueUpdate_('ITEM1');
      expect(fieldDropdown.selectedOption_).to.deep.equal(['first', 'ITEM1']);
      fieldDropdown.doValueUpdate_('ITEM2');
      expect(fieldDropdown.selectedOption_).to.deep.equal(['second', 'ITEM2']);
    });
    it('does not allow invalid options', () => {
      fieldDropdown.doValueUpdate_('ITEM1');
      expect(fieldDropdown.selectedOption_).to.deep.equal(['first', 'ITEM1']);
      fieldDropdown.doValueUpdate_('ITEM3');
      expect(fieldDropdown.selectedOption_).to.deep.equal(['first', 'ITEM1']);
    });
    it('allows ??? value', () => {
      fieldDropdown.doValueUpdate_('???');
      expect(fieldDropdown.selectedOption_).to.deep.equal(['???', '']);
    });
  });
});
