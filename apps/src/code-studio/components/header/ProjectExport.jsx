import React from 'react';
import i18n from '@cdo/locale';
import {exportProject} from '../../headerExport';
import {styles} from './EditableProjectName';

export default class ProjectExport extends React.Component {
  render() {
    return (
      <button
        type="button"
        className="project_share header_button header_button_light no-mc"
        onClick={exportProject}
        style={styles.buttonSpacing}
      >
        {i18n.export()}
      </button>
    );
  }
}
