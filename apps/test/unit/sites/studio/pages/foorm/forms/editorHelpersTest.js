import {lintFoormKeys} from '@cdo/apps/sites/studio/pages/foorm/forms/editorHelpers';

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
    const annotations = lintFoormKeys(testValidJson);
    expect(annotations.length === 0).toBeTruthy();
  });
  it('finds errors in bad json', () => {
    const annotations = lintFoormKeys(testErrorJson);
    expect(annotations.length === 2).toBeTruthy();
    expect(
      annotations[1].message ===
        'Question names should only contain letters and underscores.'
    ).toBeTruthy();
    expect(annotations[0].severity === 'error').toBeTruthy();
    expect(
      annotations[1].message ===
        'Question names should only contain letters and underscores.'
    ).toBeTruthy();
    expect(annotations[1].severity === 'error').toBeTruthy();
  });
});
