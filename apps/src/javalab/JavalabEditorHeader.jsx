import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import PaneHeader, {
  PaneSection,
  PaneButton,
} from '@cdo/apps/templates/PaneHeader';
import javalabMsg from '@cdo/javalab/locale';
import msg from '@cdo/locale';

import ProjectTemplateWorkspaceIcon from '../templates/ProjectTemplateWorkspaceIcon';

import Backpack from './Backpack';
import {DisplayTheme} from './DisplayTheme';
import {openEditorDialog} from './redux/editorRedux';
import {JavalabEditorDialog} from './types';

/**
 * Renders the header portion of the Java Lab editor, consisting of the New File,
 * Backpack, Version History, and Commit Code buttons, as well as header text.
 */
function JavalabEditorHeader({
  onBackpackImportFile,
  openEditorDialog,
  isReadOnlyWorkspace,
  backpackEnabled,
  displayTheme,
  showProjectTemplateWorkspaceIcon,
}) {
  const editorHeaderText = isReadOnlyWorkspace
    ? msg.readonlyWorkspaceHeader()
    : javalabMsg.editor();

  return (
    <PaneHeader hasFocus isOldPurpleColor>
      <PaneButton
        id="javalab-editor-create-file"
        iconClass="fa fa-plus-circle"
        onClick={() => openEditorDialog(JavalabEditorDialog.CREATE_FILE)}
        headerHasFocus
        isLegacyStyles
        isRtl={false}
        label={javalabMsg.newFile()}
        leftJustified
        isDisabled={isReadOnlyWorkspace}
      />
      {backpackEnabled && (
        <PaneSection style={styles.backpackSection}>
          <Backpack
            id={'javalab-editor-backpack'}
            displayTheme={displayTheme}
            isButtonDisabled={isReadOnlyWorkspace}
            onImport={onBackpackImportFile}
          />
        </PaneSection>
      )}
      <PaneButton
        id="data-mode-versions-header"
        isLegacyStyles
        iconClass="fa fa-clock-o"
        label={msg.showVersionsHeader()}
        headerHasFocus
        isRtl={false}
        onClick={() => openEditorDialog(JavalabEditorDialog.VERSION_HISTORY)}
        isDisabled={isReadOnlyWorkspace}
      />
      <PaneButton
        id="javalab-editor-save"
        isLegacyStyles
        iconClass="fa fa-check-circle"
        onClick={() => openEditorDialog(JavalabEditorDialog.COMMIT_FILES)}
        headerHasFocus
        isRtl={false}
        label={javalabMsg.commitCode()}
        isDisabled={isReadOnlyWorkspace}
      />
      <PaneSection>
        {showProjectTemplateWorkspaceIcon && <ProjectTemplateWorkspaceIcon />}
        {editorHeaderText}
      </PaneSection>
    </PaneHeader>
  );
}

JavalabEditorHeader.propTypes = {
  onBackpackImportFile: PropTypes.func.isRequired,
  // populated by Redux
  openEditorDialog: PropTypes.func.isRequired,
  isReadOnlyWorkspace: PropTypes.bool.isRequired,
  backpackEnabled: PropTypes.bool.isRequired,
  displayTheme: PropTypes.oneOf(Object.values(DisplayTheme)),
  showProjectTemplateWorkspaceIcon: PropTypes.bool.isRequired,
};

const styles = {
  backpackSection: {
    textAlign: 'left',
    display: 'inline-block',
    float: 'left',
    overflow: 'visible',
  },
};

export default connect(
  state => ({
    isReadOnlyWorkspace: state.javalab.isReadOnlyWorkspace,
    backpackEnabled: state.javalab.backpackEnabled,
    displayTheme: state.javalabView.displayTheme,
    showProjectTemplateWorkspaceIcon:
      !!state.pageConstants.isProjectTemplateLevel &&
      state.javalab.isReadOnlyWorkspace,
  }),
  dispatch => ({
    openEditorDialog: dialogName => dispatch(openEditorDialog(dialogName)),
  })
)(JavalabEditorHeader);
