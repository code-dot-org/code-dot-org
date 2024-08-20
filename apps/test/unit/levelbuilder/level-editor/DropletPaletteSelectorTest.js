import CodeMirror from 'codemirror';
import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import DropletPaletteSelector from '@cdo/apps/levelbuilder/level-editor/DropletPaletteSelector';

describe('DropletPaletteSelector', () => {
  let textArea, editor;
  beforeEach(() => {
    textArea = document.createElement('textarea');
    document.body.appendChild(textArea);
    editor = CodeMirror.fromTextArea(textArea);
  });

  afterEach(() => {
    // Removes the CodeMirror editor and restores the original textarea.
    // @see https://codemirror.net/doc/manual.html#api_static
    editor.toTextArea();
    document.body.removeChild(textArea);
  });

  describe('when the editor is empty and no blocks are provided in the palette', () => {
    it('renders a select box', () => {
      const selector = mount(
        <DropletPaletteSelector editor={editor} palette={{}} />
      );
      expect(
        selector.containsMatchingElement(
          <select disabled>
            <option>All blocks have been added</option>
          </select>
        )
      ).toBe(true);
    });
  });

  describe('when blocks are provided', () => {
    it('the select blocks contains a list of blocks that can be added', () => {
      const selector = mount(
        <DropletPaletteSelector editor={editor} palette={{a: null, b: null}} />
      );
      expect(
        selector.containsMatchingElement(
          <select>
            <option>Add block</option>
            <option value="a">a</option>
            <option value="b">b</option>
          </select>
        )
      ).toBe(true);
    });

    describe('and the editor contains some existing json', () => {
      let selector;

      beforeEach(() => {
        editor.setValue(JSON.stringify({a: null}));
        selector = mount(
          <DropletPaletteSelector
            editor={editor}
            palette={{a: null, b: null}}
          />
        );
      });

      it("shows the blocks that aren't already in the editor", () => {
        expect(
          selector.containsMatchingElement(
            <select>
              <option>Add block</option>
              <option value="b">b</option>
            </select>
          )
        ).toBe(true);

        editor.setValue(JSON.stringify({a: null, b: null}));
        selector.update();
        expect(
          selector.containsMatchingElement(
            <select>
              <option>All blocks have been added</option>
            </select>
          )
        ).toBe(true);
      });
    });

    describe('and the editor contains invalid json', () => {
      it('shows a warning', () => {
        const selector = mount(
          <DropletPaletteSelector
            editor={editor}
            palette={{a: null, b: null}}
          />
        );
        editor.setValue('invalud json');
        selector.update();
        expect(
          selector.containsMatchingElement(
            <select disabled>
              <option>Fix JSON syntax to see available blocks</option>
            </select>
          )
        ).toBe(true);
      });
    });

    describe('When selecting an item', () => {
      it('updates the editor to include that value', () => {
        const selector = mount(
          <DropletPaletteSelector
            editor={editor}
            palette={{a: null, b: null}}
          />
        );
        selector
          .find('select')
          .props()
          .onChange({target: {value: 'b'}});
        selector.update();
        expect(editor.getValue()).toBe(`{
  "b": null
}`);
        expect(
          selector.containsMatchingElement(
            <select>
              <option>Add block</option>
              <option value="a">a</option>
            </select>
          )
        ).toBe(true);

        selector
          .find('select')
          .props()
          .onChange({target: {value: 'a'}});
        selector.update();

        expect(
          selector.containsMatchingElement(
            <select disabled>
              <option>All blocks have been added</option>
            </select>
          )
        ).toBe(true);

        expect(editor.getValue()).toBe(`{
  "b": null,
  "a": null
}`);
      });
    });
  });
});
