import {assert} from 'chai';
import {lintFoormKeys} from '@cdo/apps/sites/studio/pages/foorm/forms/editorHelpers';

const fakeCodeMirror = {
  posFromIndex: x => ({from: 0, to: 1})
};

const testValidJson = `{
  "name": "valid",
  "somethingElse": "534%$3g3gj90n 0o23-=+;[;fd]",
  "nested": {
    "value": "also_valid"
  }
}`;
const testErrorJson = `{
  "name": "not valid",
  "somethingElse": "534%$3g3gj90n 0o23-=+;[;fd]",
  "nested": {
    "value": "[not_valid]"
  }
}`;

describe('foorm linting', () => {
  it("doesn't find errors in valid json", () => {
    const annotations = lintFoormKeys(testValidJson, {}, fakeCodeMirror);
    assert(annotations.length === 0);
  });
  it('finds errors in bad json', () => {
    const annotations = lintFoormKeys(testErrorJson, {}, fakeCodeMirror);
    assert(annotations.length === 2);
    assert(
      annotations[1].message ===
        'Question names should only contain letters and underscores.'
    );
    assert(annotations[0].severity === 'error');
    assert(
      annotations[1].message ===
        'Question names should only contain letters and underscores.'
    );
    assert(annotations[1].severity === 'error');
  });
});
