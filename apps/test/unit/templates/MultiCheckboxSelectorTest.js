import PropTypes from 'prop-types';
import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../util/deprecatedChai';
import sinon from 'sinon';

import MultiCheckboxSelector from '@cdo/apps/templates/MultiCheckboxSelector';

const ItemComponent = function({item}) {
  return <strong>{item}</strong>;
};
ItemComponent.propTypes = {item: PropTypes.string};

describe('MultiCheckboxSelector', () => {
  var wrapper, allSelectedCheckbox, header, itemList, checkboxes, onChange;

  beforeEach(() => {
    onChange = sinon.spy();
  });

  function render(component) {
    wrapper = shallow(component);
    header = wrapper.find('h2');
    allSelectedCheckbox = header.find('input');
    itemList = wrapper.find('ul');
    checkboxes = itemList.find('input');
  }

  describe('basic usage', () => {
    beforeEach(() => {
      render(
        <MultiCheckboxSelector
          header="Some Items"
          items={['one', 'two', 'three']}
          selected={['two']}
          onChange={onChange}
        >
          <ItemComponent />
        </MultiCheckboxSelector>
      );
    });

    it('should render a header with an unchecked checkbox', () => {
      expect(
        header.matchesElement(
          <h2>
            <input type="checkbox" checked={false} />
            Some Items
          </h2>
        )
      ).to.be.true;
    });

    it('should render a list of items with checkboxes', () => {
      expect(
        itemList.matchesElement(
          <ul>
            <li>
              <input type="checkbox" />
              <ItemComponent item="one" />
            </li>
            <li>
              <input type="checkbox" checked />
              <ItemComponent item="two" />
            </li>
            <li>
              <input type="checkbox" />
              <ItemComponent item="three" />
            </li>
          </ul>
        )
      ).to.be.true;
    });

    it('should call onChange with the new selection when checkboxes are clicked', () => {
      checkboxes.first().simulate('change');
      expect(onChange.lastCall.args[0]).to.deep.equal(['two', 'one']);

      checkboxes.at(1).simulate('change');
      expect(onChange.lastCall.args[0]).to.deep.equal([]);

      allSelectedCheckbox.simulate('change');
      expect(onChange.lastCall.args[0]).to.deep.equal(['one', 'two', 'three']);
    });
  });

  describe('when all items are selected', () => {
    beforeEach(() => {
      render(
        <MultiCheckboxSelector
          header="Some Items"
          items={['one', 'two', 'three']}
          selected={['two', 'one', 'three']}
          onChange={onChange}
        >
          <ItemComponent />
        </MultiCheckboxSelector>
      );
    });

    it('should render a checked checkbox in the header', () => {
      expect(allSelectedCheckbox.prop('checked')).to.be.true;
    });

    it('should call onChange with an empty selection when the header checkbox is clicked', () => {
      allSelectedCheckbox.simulate('change');
      expect(onChange.lastCall.args[0]).to.deep.equal([]);
    });
  });
  describe('no header', () => {
    beforeEach(() => {
      render(
        <MultiCheckboxSelector
          noHeader={true}
          header="Some Items"
          items={['one', 'two', 'three']}
          selected={['two']}
          onChange={onChange}
        >
          <ItemComponent />
        </MultiCheckboxSelector>
      );
    });

    it('should not render a header', () => {
      expect(header).to.have.lengthOf(0);
    });
  });
});
