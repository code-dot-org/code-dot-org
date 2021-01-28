/* globals dashboard */

import React from 'react';
import i18n from '@cdo/locale';
import {shareProject} from '../../headerShare';

const styles = {
  button: {
    marginTop: 0,
    marginBottom: 0,
    marginLeft: 10,
    marginRight: 0
  }
};

export default class ProjectShare extends React.Component {
  shareProject = () => {
    shareProject(dashboard.project.getShareUrl());
  };

  render() {
    return (
      <button
        type="button"
        className="project_share header_button header_button_light"
        onClick={this.shareProject}
        style={styles.button}
      >
        {i18n.share()}
      </button>
    );
  }
}
