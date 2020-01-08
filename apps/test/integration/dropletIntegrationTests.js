import {assert, expect} from '../util/deprecatedChai';
import * as dropletUtils from '@cdo/apps/dropletUtils';
import {
  singleton as studioApp,
  stubStudioApp,
  restoreStudioApp
} from '@cdo/apps/StudioApp';
import loadSource from './util/loadSource';

describe('setParamAtIndex', () => {
  let editor, parser, plainTree, arrayTree;

  before(function() {
    // Load droplet sources.
    return loadSource('/base/lib/ace/src-noconflict/ace.js')
      .then(function() {
        return loadSource('/base/lib/ace/src-noconflict/mode-javascript.js');
      })
      .then(function() {
        return loadSource('/base/lib/ace/src-noconflict/ext-language_tools.js');
      })
      .then(function() {
        return loadSource('/base/lib/droplet/droplet-full.js');
      })
      .then(function() {
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
      palette: []
    });

    studioApp().editor = editor;
    parser = editor.session.mode;

    // Initialize object trees with test text

    // NOTE: in these tests, setProperty is not a known block, so the function
    // name itself is a socket, which means index 0 is actually the function
    // name and index 1 is the first parameter within the function call

    plainTree = parser.parse("setProperty(obj, 'height', 100);");
    arrayTree = parser.parse("setProperty(arr[i], 'height', 100);");
  });

  it('sets the first parameter', () => {
    dropletUtils.setParamAtIndex(0, 'updated', plainTree);
    expect(plainTree.stringify()).to.equal("updated(obj, 'height', 100);");
  });

  it('sets the third parameter', () => {
    dropletUtils.setParamAtIndex(2, 'updated', plainTree);
    expect(plainTree.stringify()).to.equal('setProperty(obj, updated, 100);');
  });

  it('sets the second parameter when the first parameter is an array lookup', () => {
    dropletUtils.setParamAtIndex(2, 'updated', arrayTree);
    expect(arrayTree.stringify()).to.equal(
      'setProperty(arr[i], updated, 100);'
    );
  });

  it('does not modify sockets beyond the parameter requested when starting in a socket', () => {
    // A special object tree to avoid regressing a bug fix
    // See: https://github.com/code-dot-org/code-dot-org/pull/22693
    const beforeCode = `onEvent("id", "click", function(event) {
                          setProperty("id", "width", 0);
                        });
                        onEvent("id", "click", function(event) {
                        });`;
    const codeTree = parser.parse(beforeCode);
    const block = codeTree.getBlockOnLine(1);
    dropletUtils.setParamAtIndex(3, '100', block);
    const afterCode = `onEvent("id", "click", function(event) {
                          setProperty("id", "width", 100);
                        });
                        onEvent("id", "click", function(event) {
                        });`;
    expect(codeTree.stringify()).to.equal(afterCode);
  });
});
