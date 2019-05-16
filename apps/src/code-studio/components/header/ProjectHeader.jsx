/* globals dashboard, appOptions */

import React from 'react';

import EditableProjectName from './EditableProjectName';
import ProjectImport from './ProjectImport';
import ProjectRemix from './ProjectRemix';
import ProjectShare from './ProjectShare';

export default class ProjectHeader extends React.Component {
  render() {
    return (
      <div>
        <EditableProjectName />
        <ProjectShare />
        <ProjectRemix lightStyle />

        {/* For Minecraft Code Connection (aka CodeBuilder) projects, add the
            option to import code from an Hour of Code share link */}
        {appOptions.level.isConnectionLevel && <ProjectImport />}

        {/* TODO: Remove this (and the related style) when Web Lab is no longer
            in beta.*/}
        {appOptions.app === 'weblab' && (
          <div className="beta-notice">{dashboard.i18n.t('beta')}</div>
        )}
      </div>
    );
  }
}
