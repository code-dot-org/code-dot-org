import {assert, expect} from '../util/configuredChai';
import * as dropletUtils from '@cdo/apps/dropletUtils';
import {singleton as studioApp, stubStudioApp, restoreStudioApp} from '@cdo/apps/StudioApp';
import {loadSource} from './levelTests';

describe('setParamAtIndex', () => {
  let editor, parser, plainTree, arrayTree;

  before(function () {
    // Load droplet sources.
    return loadSource('/base/lib/ace/src-noconflict/ace.js')
    .then(function () { return loadSource('/base/lib/ace/src-noconflict/mode-javascript.js'); })
    .then(function () { return loadSource('/base/lib/ace/src-noconflict/ext-language_tools.js'); })
    .then(function () { return loadSource('/base/lib/droplet/droplet-full.js'); })
    .then(function () { return loadSource('/base/lib/tooltipster/jquery.tooltipster.js'); })
    .then(function () { return loadSource('/base/lib/phaser/phaser.js'); })
    .then(function () {
      assert(window.droplet, 'droplet in global namespace');
    });
  });

  beforeEach(stubStudioApp);
  afterEach(restoreStudioApp);

  beforeEach(() => {
    // Mock-up an editor to access a JS parser
    const dropletCodeTextbox = document.createElement('div');
    dropletCodeTextbox.setAttribute('id', 'dropletCodeTextbox');
    editor = new window.droplet.Editor(dropletCodeTextbox, {
      mode: 'javascript',
      palette: [],
      showPaletteInTextMode: false,
      showDropdownInPalette: true,
      allowFloatingBlocks: false,
      enablePaletteAtStart: false,
      textModeAtStart: true,
    });

    var aceEditor = editor.aceEditor;
    aceEditor.session.setMode('ace/mode/javascript_codeorg');

    studioApp().editor = editor;
    parser = editor.session.mode;

    // Initialize object trees with test text
    plainTree = parser.parse("setProperty(obj, 'height', 100);");
    arrayTree = parser.parse("setProperty(arr[i], 'height', 100);");
  });

  it('sets the first parameter', () => {
    dropletUtils.setParamAtIndex(0, 'updated', plainTree);
    expect(plainTree.stringify()).to.equal("updated(obj, 'height', 100);");
  });

  it('sets the third parameter', () => {
    dropletUtils.setParamAtIndex(2, 'updated', plainTree);
    expect(plainTree.stringify()).to.equal("setProperty(obj, updated, 100);");
  });

  it('sets the second parameter when the first parameter is an array lookup', () => {
    dropletUtils.setParamAtIndex(2, 'updated', arrayTree);
    expect(arrayTree.stringify()).to.equal("setProperty(arr[i], updated, 100);");
  });
});
