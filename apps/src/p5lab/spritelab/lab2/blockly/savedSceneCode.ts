import {takeLevelDefaults} from './imagePickerFields';

/**
 * The code of a scene that is not open in the editor, from its saved
 * blocks. A scene the level made and the student has not opened yet has
 * image dropdowns with no saved value; they take the level's default
 * images here, the same ones they show once the scene is opened.
 */
export function codeFromSavedScene(source: object): string {
  const workspace = new Blockly.Workspace();
  try {
    Blockly.serialization.workspaces.load(source, workspace);
    takeLevelDefaults(workspace);
    return Blockly.JavaScript.workspaceToCode(workspace);
  } finally {
    workspace.dispose();
  }
}
