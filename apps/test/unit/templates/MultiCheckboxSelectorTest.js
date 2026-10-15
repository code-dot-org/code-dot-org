import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PropTypes from 'prop-types';
import React from 'react';

import MultiCheckboxSelector from '@cdo/apps/templates/MultiCheckboxSelector';

const ItemComponent = function ({item}) {
  return <strong>{item}</strong>;
};
ItemComponent.propTypes = {item: PropTypes.string};

describe('MultiCheckboxSelector', () => {
  let onChange, user;

  beforeEach(() => {
    onChange = jest.fn();
    user = userEvent.setup();
  });

  function renderSelector(props) {
    render(
      <MultiCheckboxSelector
        header="Some Items"
        items={['one', 'two', 'three']}
        selected={['two']}
        onChange={onChange}
        {...props}
      >
        <ItemComponent />
      </MultiCheckboxSelector>
    );
  }

  function selectAllCheckbox() {
    return screen.getByRole('checkbox', {name: 'Select all Some Items'});
  }

  function checkboxFor(item) {
    return screen.getByRole('checkbox', {name: item});
  }

  describe('basic usage', () => {
    beforeEach(() => renderSelector());

    it('should render a header with an unchecked checkbox', () => {
      // The select-all box is not part of the heading's name.
      expect(screen.getByRole('heading', {name: 'Some Items'})).toBeDefined();
      expect(selectAllCheckbox().checked).toBe(false);
    });

    it('should render a list of items with checkboxes', () => {
      expect(screen.getAllByRole('listitem')).toHaveLength(3);
      expect(checkboxFor('one').checked).toBe(false);
      expect(checkboxFor('two').checked).toBe(true);
      expect(checkboxFor('three').checked).toBe(false);
    });

    it('should call onChange with the new selection when checkboxes are clicked', async () => {
      await user.click(checkboxFor('one'));
      expect(onChange.mock.lastCall[0]).toEqual(['two', 'one']);

      await user.click(checkboxFor('two'));
      expect(onChange.mock.lastCall[0]).toEqual([]);

      await user.click(selectAllCheckbox());
      expect(onChange.mock.lastCall[0]).toEqual(['one', 'two', 'three']);
    });
  });

  describe('when all items are selected', () => {
    beforeEach(() => renderSelector({selected: ['two', 'one', 'three']}));

    it('should render a checked checkbox in the header', () => {
      expect(selectAllCheckbox().checked).toBe(true);
    });

    it('should call onChange with an empty selection when the header checkbox is clicked', async () => {
      await user.click(selectAllCheckbox());
      expect(onChange.mock.lastCall[0]).toEqual([]);
    });
  });

  describe('no header', () => {
    beforeEach(() => renderSelector({noHeader: true}));

    it('should not render a header', () => {
      expect(screen.queryByRole('heading')).toBeNull();
      // Without the header there is no select-all, only the per-item boxes.
      expect(screen.getAllByRole('checkbox')).toHaveLength(3);
    });
  });

  describe('when items are not strings', () => {
    const ObjectItemComponent = function ({item}) {
      return <strong>{item.name}</strong>;
    };
    ObjectItemComponent.propTypes = {item: PropTypes.object};

    function renderObjectSelector(props) {
      render(
        <MultiCheckboxSelector
          header="Some Items"
          items={[{name: 'one'}, {name: 'two'}]}
          selected={[]}
          onChange={onChange}
          {...props}
        >
          <ObjectItemComponent />
        </MultiCheckboxSelector>
      );
    }

    it('names each checkbox with itemLabel when given one', () => {
      renderObjectSelector({itemLabel: item => item.name});

      expect(screen.getByRole('checkbox', {name: 'one'})).toBeDefined();
      expect(screen.getByRole('checkbox', {name: 'two'})).toBeDefined();
    });

    it('falls back to the rendered item when given no itemLabel', () => {
      renderObjectSelector();

      // No label to derive from an object, so the checkbox borrows the name of
      // what the item renders rather than going unnamed.
      expect(screen.getByRole('checkbox', {name: 'one'})).toBeDefined();
      expect(screen.getByRole('checkbox', {name: 'two'})).toBeDefined();
    });
  });

  describe('when disabled', () => {
    beforeEach(() => renderSelector({disabled: true}));

    it('should disable every checkbox', () => {
      screen
        .getAllByRole('checkbox')
        .forEach(checkbox => expect(checkbox.disabled).toBe(true));
    });
  });
});
