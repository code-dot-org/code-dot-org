import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import CopyUnitDialog from '@cdo/apps/levelbuilder/unit-editor/CopyUnitDialog';

describe('CopyUnitDialog', () => {
  let defaultProps, handleCloseSpy, fetchSpy;

  beforeEach(() => {
    handleCloseSpy = jest.fn();
    fetchSpy = jest.spyOn(window, 'fetch').mockClear().mockImplementation();
    defaultProps = {
      isOpen: true,
      sourceUnitName: 'source-unit',
      unitGroupNames: ['group-a', 'group-b'],
      handleClose: handleCloseSpy,
    };
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it('renders with blank new unit name input', () => {
    const wrapper = shallow(<CopyUnitDialog {...defaultProps} />);
    const nameInput = wrapper.find('input[type="text"]').first();
    expect(nameInput.prop('value')).toBe('');
  });

  it('populates destination unit group dropdown from props', () => {
    const wrapper = shallow(<CopyUnitDialog {...defaultProps} />);
    const options = wrapper.find('select option');
    // First option is the placeholder, then the two unit groups.
    expect(options.length).toBe(3);
    expect(options.at(1).prop('value')).toBe('group-a');
    expect(options.at(2).prop('value')).toBe('group-b');
  });

  it('disables submit until all fields are filled', () => {
    const wrapper = shallow(<CopyUnitDialog {...defaultProps} />);
    const submit = () => wrapper.find('Button[id="copy-unit-button"]');
    expect(submit().prop('disabled')).toBe(true);

    wrapper
      .find('input[type="text"]')
      .first()
      .simulate('change', {target: {value: 'new-unit'}});
    expect(submit().prop('disabled')).toBe(true);

    wrapper.find('select').simulate('change', {target: {value: 'group-a'}});
    expect(submit().prop('disabled')).toBe(true);

    wrapper
      .find('input[type="text"]')
      .last()
      .simulate('change', {target: {value: '2026'}});
    expect(submit().prop('disabled')).toBe(false);
  });

  it('displays notice and hides submit button on success', () => {
    const wrapper = shallow(<CopyUnitDialog {...defaultProps} />);
    wrapper.setState({
      newUnitName: 'new-unit',
      destinationUnitGroupName: 'group-a',
      newLevelSuffix: '2026',
    });

    fetchSpy.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({notice: 'Copying unit...'}),
      })
    );

    return wrapper
      .instance()
      .onSubmit()
      .then(() => {
        expect(wrapper.state('notice')).toBe('Copying unit...');
        expect(wrapper.find('Button[id="copy-unit-button"]').exists()).toBe(
          false
        );
      });
  });

  it('displays inline error on 422 response', () => {
    const wrapper = shallow(<CopyUnitDialog {...defaultProps} />);
    wrapper.setState({
      newUnitName: 'taken-name',
      destinationUnitGroupName: 'group-a',
      newLevelSuffix: '2026',
    });

    fetchSpy.mockImplementation(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({error: 'Name already taken.'}),
      })
    );

    return wrapper
      .instance()
      .onSubmit()
      .then(() => {
        expect(wrapper.state('error')).toBe('Name already taken.');
        // Submit button still present so user can retry.
        expect(wrapper.find('Button[id="copy-unit-button"]').exists()).toBe(
          true
        );
      });
  });

  it('disables submit while saving', () => {
    const wrapper = shallow(<CopyUnitDialog {...defaultProps} />);
    wrapper.setState({
      newUnitName: 'new-unit',
      destinationUnitGroupName: 'group-a',
      newLevelSuffix: '2026',
    });

    // Pending fetch.
    fetchSpy.mockImplementation(() => new Promise(() => {}));

    wrapper.find('Button[id="copy-unit-button"]').simulate('click');
    expect(wrapper.find('Button[id="copy-unit-button"]').prop('disabled')).toBe(
      true
    );
  });
});
