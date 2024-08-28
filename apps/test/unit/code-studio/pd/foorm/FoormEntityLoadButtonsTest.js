import {assert} from 'chai'; // eslint-disable-line no-restricted-imports
import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import {Button} from 'react-bootstrap'; // eslint-disable-line no-restricted-imports

import {UnconnectedFoormEntityLoadButtons as FoormEntityLoadButtons} from '@cdo/apps/code-studio/pd/foorm/editor/components/FoormEntityLoadButtons';
import SingleCheckbox from '@cdo/apps/code-studio/pd/form_components/SingleCheckbox';

describe('FoormEntityLoadButtons', () => {
  let defaultProps, wrapper, showCodeMirrorStub;
  showCodeMirrorStub = jest.fn();
  beforeEach(() => {
    defaultProps = {
      foormEntities: [
        {
          metadata: {name: 'b_library', version: 0},
          text: 'b_library, version 0',
        },
        {
          metadata: {name: 'a_library', version: 0},
          text: 'a_library, version 0',
        },
        {
          metadata: {name: 'a_library', version: 1},
          text: 'a_library, version 1',
        },
        {
          metadata: {name: 'c_library', version: 0},
          text: 'c_library, version 0',
        },
      ],
      showCodeMirror: showCodeMirrorStub,
      resetCodeMirror: () => {},
      resetSelectedData: () => {},
      setLastSaved: () => {},
      setSaveError: () => {},
      setHasJSONError: () => {},
      setHasLintError: () => {},
      setLastSavedQuestions: () => {},
    };
  });

  it('filters and sorts menu items by default with toggle', () => {
    wrapper = shallow(
      <FoormEntityLoadButtons
        {...defaultProps}
        showVersionFilterToggle={true}
      />
    );

    const expectedOrder = [
      'a_library, version 1',
      'b_library, version 0',
      'c_library, version 0',
    ];

    assert.equal(
      wrapper.find('.load-buttons-search').prop('options').length,
      3
    );
    wrapper
      .find('.load-buttons-search')
      .prop('options')
      .every((menuItem, i) => assert.equal(menuItem.label, expectedOrder[i]));
  });

  it("sorts, but doesn't filter menu items when toggled off", () => {
    wrapper = shallow(
      <FoormEntityLoadButtons
        {...defaultProps}
        showVersionFilterToggle={true}
      />
    );

    wrapper.find(SingleCheckbox).at(0).prop('onChange')();
    wrapper.update();

    const expectedOrder = [
      'a_library, version 0',
      'a_library, version 1',
      'b_library, version 0',
      'c_library, version 0',
    ];

    assert.equal(
      wrapper.find('.load-buttons-search').prop('options').length,
      4
    );
    wrapper
      .find('.load-buttons-search')
      .prop('options')
      .every((menuItem, i) => assert.equal(menuItem.label, expectedOrder[i]));
  });

  it("sorts, but doesn't filter menu items with no toggle", () => {
    wrapper = shallow(
      <FoormEntityLoadButtons
        {...defaultProps}
        showVersionFilterToggle={false}
      />
    );

    const expectedOrder = [
      'a_library, version 0',
      'a_library, version 1',
      'b_library, version 0',
      'c_library, version 0',
    ];

    assert.equal(
      wrapper.find('.load-buttons-search').prop('options').length,
      4
    );
    wrapper
      .find('.load-buttons-search')
      .prop('options')
      .every((menuItem, i) => assert.equal(menuItem.label, expectedOrder[i]));
  });

  it('shows blank editor on new library click', () => {
    wrapper.find(Button).prop('onClick')();

    expect(showCodeMirrorStub).toHaveBeenCalledTimes(1);
  });
});
