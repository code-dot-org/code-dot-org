import React from 'react';
import {mount} from 'enzyme';
import {assert} from 'chai';

import {
  stubRedux,
  restoreRedux,
  getStore,
  registerReducers
} from '@cdo/apps/redux';
import {Provider} from 'react-redux';
import foorm from '../../../../../src/code-studio/pd/foorm/editor/foormEditorRedux';
import {DropdownButton, MenuItem} from 'react-bootstrap';
import FoormEntityLoadButtons from '../../../../../src/code-studio/pd/foorm/editor/components/FoormEntityLoadButtons';
import SingleCheckbox from '../../../../../src/code-studio/pd/form_components/SingleCheckbox';

describe('FoormEntityLoadButtons', () => {
  let defaultProps, store, wrapper;
  beforeEach(() => {
    stubRedux();
    registerReducers({foorm});

    store = getStore();

    defaultProps = {
      foormEntities: [
        {
          metadata: {name: 'b_library', version: 0},
          text: 'b_library, version 0'
        },
        {
          metadata: {name: 'a_library', version: 0},
          text: 'a_library, version 0'
        },
        {
          metadata: {name: 'a_library', version: 1},
          text: 'a_library, version 1'
        },
        {
          metadata: {name: 'c_library', version: 0},
          text: 'c_library, version 0'
        }
      ]
    };
  });

  afterEach(() => {
    restoreRedux();
  });

  it('filters and sorts menu items by default with toggle', () => {
    wrapper = mount(
      <Provider store={store}>
        <FoormEntityLoadButtons
          {...defaultProps}
          showVersionFilterToggle={true}
        />
      </Provider>
    );

    const expectedOrder = [
      'a_library, version 1',
      'b_library, version 0',
      'c_library, version 0'
    ];

    assert.equal(
      wrapper
        .find(DropdownButton)
        .at(0)
        .find(MenuItem).length,
      3
    );
    wrapper
      .find(DropdownButton)
      .at(0)
      .find(MenuItem)
      .every((menuItem, i) => assert.equal(menuItem.text(), expectedOrder[i]));
  });

  it("doesn't filter and sort menu items when toggled off", () => {
    wrapper = mount(
      <Provider store={store}>
        <FoormEntityLoadButtons
          {...defaultProps}
          showVersionFilterToggle={true}
        />
      </Provider>
    );

    wrapper
      .find(SingleCheckbox)
      .at(0)
      .prop('onChange')();
    wrapper.update();

    const expectedOrder = [
      'a_library, version 0',
      'a_library, version 1',
      'b_library, version 0',
      'c_library, version 0'
    ];

    assert.equal(
      wrapper
        .find(DropdownButton)
        .at(0)
        .find(MenuItem).length,
      4
    );
    wrapper
      .find(DropdownButton)
      .at(0)
      .find(MenuItem)
      .every((menuItem, i) => assert.equal(menuItem.text(), expectedOrder[i]));
  });

  it("doesn't filter and sort menu items with no toggle", () => {
    wrapper = mount(
      <Provider store={store}>
        <FoormEntityLoadButtons
          {...defaultProps}
          showVersionFilterToggle={false}
        />
      </Provider>
    );

    const expectedOrder = [
      'a_library, version 0',
      'a_library, version 1',
      'b_library, version 0',
      'c_library, version 0'
    ];

    assert.equal(
      wrapper
        .find(DropdownButton)
        .at(0)
        .find(MenuItem).length,
      4
    );
    wrapper
      .find(DropdownButton)
      .at(0)
      .find(MenuItem)
      .every((menuItem, i) => assert.equal(menuItem.text(), expectedOrder[i]));
  });
});
