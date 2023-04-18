import React from 'react';
import CheckboxDropdown from '../../../src/templates/CheckboxDropdown';
import {expect} from '../../util/reconfiguredChai';
import {shallow} from 'enzyme';
import sinon from 'sinon';

describe('CheckboxDropdown', () => {
  const sampleOptions = ['Cat', 'Dog', 'Fish', 'Rabbit', 'Lizard'];
  let checkboxDropdown;
  let onChangeCallback;
  let checkedPets;

  beforeEach(() => {
    onChangeCallback = sinon.spy();
    checkedPets = [];

    // Track which pet checkboxes are checked
    const handleCheck = event => {
      const value = event.target.value;
      const isChecked = event.target.checked;

      isChecked
        ? (checkedPets = [...checkedPets, value])
        : (checkedPets = checkedPets.filter(i => i !== value));

      onChangeCallback();
    };

    checkboxDropdown = shallow(
      <CheckboxDropdown
        name="pets"
        label="Pets"
        options={sampleOptions}
        onChange={handleCheck}
      />
    );
  });

  it('renders dropdown with checkbox for each option', () => {
    const checkboxes = checkboxDropdown.find('input');
    expect(checkboxes.length).to.equal(sampleOptions.length);
  });

  it('calls the onChange callback when a box is checked', () => {
    // Select "Cat" initially, resulting in ["Cat"] being selected
    checkboxDropdown
      .find("input[name='Cat']")
      .simulate('change', {target: {value: 'Cat', checked: true}});
    expect(onChangeCallback).to.have.been.calledOnce;
    expect(checkedPets).to.deep.equal(['Cat']);
  });

  it('calls the onChange callback when a box is unchecked', () => {
    // First select "Cat" and "Dog"
    checkboxDropdown
      .find("input[name='Cat']")
      .simulate('change', {target: {value: 'Cat', checked: true}});
    checkboxDropdown
      .find("input[name='Dog']")
      .simulate('change', {target: {value: 'Dog', checked: true}});
    expect(checkedPets).to.deep.equal(['Cat', 'Dog']);

    // Unselect "Cat" from ["Cat", "Dog"], resulting in ["Dog"] being selected
    checkboxDropdown
      .find("input[name='Cat']")
      .simulate('change', {target: {value: 'Cat', checked: false}});
    expect(onChangeCallback.callCount).to.equal(3);
    expect(checkedPets).to.deep.equal(['Dog']);
  });
});
