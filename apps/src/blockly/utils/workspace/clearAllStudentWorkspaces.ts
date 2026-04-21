// Blockly labs also need to clear separate workspaces for the function editor.
export function clearAllStudentWorkspaces() {
  // Disable Blockly events to prevent unnecessary event mirroring
  Blockly.Events.disable();

  const studentWorkspaces = [
    Blockly.getMainWorkspace(),
    Blockly.getFunctionEditorWorkspace(),
    Blockly.getHiddenDefinitionWorkspace(),
  ];

  studentWorkspaces.forEach(workspace => {
    if (workspace) {
      workspace.clear();
      workspace.getProcedureMap().clear();
    }
  });

  Blockly.Events.enable();
}
